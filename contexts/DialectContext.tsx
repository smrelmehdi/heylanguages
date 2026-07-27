import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { getDialectContent, type DialectContent } from '../data/content-registry';
import { speakArabic, stopAudio, type PlayOptions } from '../utils/tts';

const DEFAULT_DIALECT = 'gulf';
const HYDRATION_TIMEOUT_MS = 1500;
const SUPPORTED_DIALECTS = new Set(['gulf', 'egyptian', 'msa', 'maghrebi']);

function normalizeStoredDialect(value: string | null): string {
  if (value && SUPPORTED_DIALECTS.has(value)) return value;
  return DEFAULT_DIALECT;
}

async function getStoredDialectWithTimeout(): Promise<string | null> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      AsyncStorage.getItem('wizard_dialect'),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), HYDRATION_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

interface DialectContextValue {
  dialect: string;
  content: DialectContent;
  isDialectHydrated: boolean;
  setDialect: (d: string) => Promise<void>;
  speakInDialect: (text: string, options?: PlayOptions) => Promise<void>;
}

const DialectContext = createContext<DialectContextValue>({
  dialect: DEFAULT_DIALECT,
  content: getDialectContent(DEFAULT_DIALECT),
  isDialectHydrated: false,
  setDialect: async () => {},
  speakInDialect: async () => {},
});

export function DialectProvider({ children }: { children: React.ReactNode }) {
  const [dialect, setDialectState] = useState(DEFAULT_DIALECT);
  const [isDialectHydrated, setIsDialectHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrateDialect = async () => {
      try {
        const stored = await getStoredDialectWithTimeout();
        const hydratedDialect = normalizeStoredDialect(stored);
        if (!cancelled) {
          setDialectState(hydratedDialect);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Dialect hydration failed; falling back to Gulf.', error);
        }
        if (!cancelled) {
          setDialectState(DEFAULT_DIALECT);
        }
      } finally {
        if (!cancelled) {
          setIsDialectHydrated(true);
        }
      }
    };

    hydrateDialect();

    return () => {
      cancelled = true;
    };
  }, []);

  const setDialect = useCallback(async (newDialect: string) => {
    const nextDialect = normalizeStoredDialect(newDialect);
    if (nextDialect === dialect) return;
    stopAudio(undefined, 'dialect-change');
    setDialectState(nextDialect);
    await AsyncStorage.setItem('wizard_dialect', nextDialect);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('users').update({ dialect: nextDialect }).eq('id', session.user.id);
    }
  }, [dialect]);

  const content = getDialectContent(dialect);

  const speakInDialect = useCallback(
    (text: string, options?: PlayOptions) => {
      if (!isDialectHydrated) return Promise.resolve();
      return speakArabic(text, content.voiceId, options);
    },
    [content.voiceId, isDialectHydrated]
  );

  if (!isDialectHydrated) {
    return null;
  }

  return (
    <DialectContext.Provider value={{ dialect, content, isDialectHydrated, setDialect, speakInDialect }}>
      {children}
    </DialectContext.Provider>
  );
}

export function useDialect() {
  return useContext(DialectContext);
}
