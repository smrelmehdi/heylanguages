/**
 * XPContext — global XP, premium status, and content-access state.
 *
 * - Loads from AsyncStorage instantly on mount (optimistic, no flicker)
 * - Syncs from Supabase once user session is available
 * - Signed-in XP is read from Supabase and awarded only by atomic RPCs
 * - Guest XP snapshots are applied after serialized AsyncStorage persistence
 * - getAccess(): synchronous access result — callers provide dialect/progress state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getLevelFromXP } from '../constants/levels';
import { usePremium } from './PremiumContext';
import { getContentAccess, TESTING_UNLOCK_ALL, type ContentAccessInput, type ContentAccessResult } from '../utils/access';
import type { PremiumStatus } from '../utils/premium';
import { supabase } from '../utils/supabase';

export interface LevelUpInfo {
  newLevel: string;
  icon: string;
  color: string;
}

interface XPContextValue {
  xp: number;
  premiumStatus: PremiumStatus;
  isPremium: boolean;
  isLoaded: boolean;
  /** Applies a guest XP snapshot after progress and XP were persisted together. */
  applyGuestXpSnapshot: (previousXp: number, nextXp: number) => LevelUpInfo | null;
  /** Synchronous dialect-aware access check — no await needed in render or event handlers. */
  getAccess: (input: Omit<ContentAccessInput, 'isPremium' | 'isTestingUnlocked'>) => ContentAccessResult;
  /** Re-fetch XP from Supabase and premium entitlement from RevenueCat. */
  refreshFromServer: () => Promise<void>;
}

const XPContext = createContext<XPContextValue>({
  xp: 0,
  premiumStatus: 'loading',
  isPremium: false,
  isLoaded: false,
  applyGuestXpSnapshot: () => null,
  getAccess: () => ({ allowed: false, reason: 'unavailable' }),
  refreshFromServer: async () => {},
});

const XP_CACHE_KEY = 'xp_cache';
const GUEST_XP_CACHE_KEY = 'guest_xp_cache';

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { premiumStatus, refreshCustomerInfo } = usePremium();
  const isPremium = premiumStatus === 'premium';
  // Ref mirrors xp state — needed for synchronous reads inside callbacks
  const xpRef = useRef(0);
  const hydrationGenerationRef = useRef(0);
  const activeIdentityRef = useRef<string | null>(null);

  const loadXpForSession = useCallback(async (session: Session | null) => {
    const generation = ++hydrationGenerationRef.current;
    const identity = session?.user.id ?? 'guest';
    if (activeIdentityRef.current !== identity) {
      activeIdentityRef.current = identity;
      xpRef.current = 0;
      setXP(0);
      setIsLoaded(false);
    }
    const cacheKey = session ? `${XP_CACHE_KEY}:${session.user.id}` : GUEST_XP_CACHE_KEY;
    const cached = await AsyncStorage.getItem(cacheKey);
    if (generation !== hydrationGenerationRef.current) return;
    const parsed = cached == null ? 0 : Number.parseInt(cached, 10);
    const cachedXp = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    xpRef.current = cachedXp;
    setXP(cachedXp);
    setIsLoaded(true);

    if (!session) return;
    const { data: user, error } = await supabase.from('users')
      .select('xp')
      .eq('id', session.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!user) return;
    if (generation !== hydrationGenerationRef.current) return;

    const serverXP = Math.max(0, Number(user.xp ?? 0));
    xpRef.current = serverXP;
    setXP(serverXP);
    await AsyncStorage.setItem(cacheKey, String(serverXP));
  }, []);

  // Hydrate initially and whenever authentication changes. This prevents a
  // previous account's cached XP remaining visible after login or logout.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (active) return loadXpForSession(session);
      })
      .catch(error => {
        console.warn('XP hydration error:', error);
        if (active) setIsLoaded(true);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (!active) return;
        loadXpForSession(session).catch(error => console.warn('XP auth refresh error:', error));
      }, 0);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadXpForSession]);

  const applyGuestXpSnapshot = useCallback((previousXp: number, nextXp: number): LevelUpInfo | null => {
    xpRef.current = nextXp;
    setXP(nextXp);
    const oldLevel = getLevelFromXP(previousXp);
    const newLevel = getLevelFromXP(nextXp);
    return oldLevel.name !== newLevel.name
      ? { newLevel: newLevel.name, icon: newLevel.icon, color: newLevel.color }
      : null;
  }, []);

  // ── access ────────────────────────────────────────────────────────────────
  const getAccess = useCallback((input: Omit<ContentAccessInput, 'isPremium' | 'isTestingUnlocked'>): ContentAccessResult => {
    return getContentAccess({
      ...input,
      isPremium,
      isTestingUnlocked: TESTING_UNLOCK_ALL,
    });
  }, [isPremium]);

  const refreshFromServer = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await Promise.all([loadXpForSession(session), refreshCustomerInfo()]);
  }, [loadXpForSession, refreshCustomerInfo]);

  return (
    <XPContext.Provider value={{ xp, premiumStatus, isPremium, isLoaded, applyGuestXpSnapshot, getAccess, refreshFromServer }}>
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  return useContext(XPContext);
}
