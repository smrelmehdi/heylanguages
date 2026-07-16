/**
 * XPContext — global XP, premium status, and content-access state.
 *
 * - Loads from AsyncStorage instantly on mount (optimistic, no flicker)
 * - Syncs from Supabase once user session is available
 * - addXP(): updates state + AsyncStorage immediately, Supabase in background
 * - canAccess(): synchronous check — no async needed in components
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getLevelFromXP } from '../constants/levels';
import { usePremium } from './PremiumContext';
import { canAccessContent } from '../utils/access';
import { supabase } from '../utils/supabase';

export interface LevelUpInfo {
  newLevel: string;
  icon: string;
  color: string;
}

interface XPContextValue {
  xp: number;
  isPremium: boolean;
  isLoaded: boolean;
  /** Immediately adds XP to local state and syncs to Supabase in background.
   *  Returns LevelUpInfo if the user crossed a level boundary, null otherwise. */
  addXP: (amount: number) => Promise<LevelUpInfo | null>;
  /** Synchronous access check — no await needed in render or event handlers. */
  canAccess: (contentId: string) => boolean;
  /** Re-fetch XP from Supabase and premium entitlement from RevenueCat. */
  refreshFromServer: () => Promise<void>;
}

const XPContext = createContext<XPContextValue>({
  xp: 0,
  isPremium: false,
  isLoaded: false,
  addXP: async () => null,
  canAccess: () => true,   // default open during loading
  refreshFromServer: async () => {},
});

const XP_CACHE_KEY = 'xp_cache';
const GUEST_XP_CACHE_KEY = 'guest_xp_cache';

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isPremium, refreshCustomerInfo } = usePremium();
  // Ref mirrors xp state — needed for synchronous reads inside callbacks
  const xpRef = useRef(0);

  // ── Load from AsyncStorage first (instant), then sync from Supabase ────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. Optimistic load from cache
      const cached = await AsyncStorage.getItem(session ? XP_CACHE_KEY : GUEST_XP_CACHE_KEY);
      if (cached) {
        const parsed = parseInt(cached, 10);
        if (!isNaN(parsed)) {
          xpRef.current = parsed;
          setXP(parsed);
        }
      }
      setIsLoaded(true);

      // 2. Sync from Supabase
      await syncFromServer();
    };
    init();
  }, []);

  const syncFromServer = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: user } = await supabase.from('users')
      .select('xp')
      .eq('id', session.user.id)
      .maybeSingle();

    if (user) {
      const serverXP = user.xp ?? 0;
      // Use server value (source of truth — avoids drift from multi-device)
      xpRef.current = serverXP;
      setXP(serverXP);
      await AsyncStorage.setItem(XP_CACHE_KEY, String(serverXP));
    }
  };

  // ── addXP ──────────────────────────────────────────────────────────────────
  const addXP = useCallback(async (amount: number): Promise<LevelUpInfo | null> => {
    const prev = xpRef.current;
    const next = prev + amount;
    xpRef.current = next;
    setXP(next);

    const { data: { session } } = await supabase.auth.getSession();
    const cacheKey = session ? XP_CACHE_KEY : GUEST_XP_CACHE_KEY;
    await AsyncStorage.setItem(cacheKey, String(next));
    if (!session) {
      // Keep the legacy cache in sync so any older reads still see the guest XP.
      await AsyncStorage.setItem(XP_CACHE_KEY, String(next));
    }

    // Level-up check
    const oldLevel = getLevelFromXP(prev);
    const newLevel = getLevelFromXP(next);
    const levelUpInfo: LevelUpInfo | null =
      oldLevel.name !== newLevel.name
        ? { newLevel: newLevel.name, icon: newLevel.icon, color: newLevel.color }
        : null;

    // Background Supabase sync (don't await — don't block the UI)
    if (session) {
      supabase.from('users')
        .update({ xp: next })
        .eq('id', session.user.id)
        .then(() => {});
    }

    return levelUpInfo;
  }, []);

  // ── canAccess ──────────────────────────────────────────────────────────────
  const canAccess = useCallback((contentId: string): boolean => {
    return canAccessContent(contentId, isPremium);
  }, [isPremium]);

  const refreshFromServer = useCallback(async () => {
    await Promise.all([syncFromServer(), refreshCustomerInfo()]);
  }, [refreshCustomerInfo]);

  return (
    <XPContext.Provider value={{ xp, isPremium, isLoaded, addXP, canAccess, refreshFromServer }}>
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  return useContext(XPContext);
}
