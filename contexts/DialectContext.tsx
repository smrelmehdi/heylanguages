import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { getDialectContent, type DialectContent } from '../data/content-registry';
import { speakArabic } from '../utils/tts';

interface DialectContextValue {
  dialect: string;
  content: DialectContent;
  setDialect: (d: string) => Promise<void>;
  speakInDialect: (text: string) => Promise<void>;
}

const DialectContext = createContext<DialectContextValue>({
  dialect: 'gulf',
  content: getDialectContent('gulf'),
  setDialect: async () => {},
  speakInDialect: async () => {},
});

export function DialectProvider({ children }: { children: React.ReactNode }) {
  const [dialect, setDialectState] = useState('gulf');

  useEffect(() => {
    AsyncStorage.getItem('wizard_dialect').then(stored => {
      if (stored) setDialectState(stored);
    });
  }, []);

  const setDialect = useCallback(async (newDialect: string) => {
    setDialectState(newDialect);
    await AsyncStorage.setItem('wizard_dialect', newDialect);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('users').update({ dialect: newDialect }).eq('id', session.user.id);
    }
  }, []);

  const content = getDialectContent(dialect);

  const speakInDialect = useCallback(
    (text: string) => speakArabic(text, content.voiceId),
    [content.voiceId]
  );

  return (
    <DialectContext.Provider value={{ dialect, content, setDialect, speakInDialect }}>
      {children}
    </DialectContext.Provider>
  );
}

export function useDialect() {
  return useContext(DialectContext);
}
