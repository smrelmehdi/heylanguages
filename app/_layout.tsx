import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { setAudioModeAsync } from 'expo-audio';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as ExpoSplash from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';
import SplashScreen from '../components/SplashScreen';
import { DialectProvider } from '../contexts/DialectContext';

import { useColorScheme } from '@/components/useColorScheme';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

ExpoSplash.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => { if (error) throw error; }, [error]);

  if (!loaded) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [splashHidden, setSplashHidden] = useState(false);
  // Prevent routing from firing more than once (e.g. on Supabase token refresh)
  const hasRouted = useRef(false);

  // Hand off from native splash to our component splash on first paint.
  useEffect(() => {
    ExpoSplash.hideAsync().catch(() => {});
  }, []);

  // Ensure audio plays even when iOS is in silent mode, and ducks background audio.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      shouldPlayInBackground: false,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Listen for sign in / sign out — only updates session state, never re-routes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Runs once when the session check completes. Never re-runs on token refresh.
  useEffect(() => {
    if (!initialized || hasRouted.current) return;
    hasRouted.current = true;

    const route = async () => {
      // Wizard completion is the single source of truth
      const wizardDone = await AsyncStorage.getItem('wizard_complete');

      if (!wizardDone || wizardDone !== 'true') {
        // Never done wizard → show wizard
        router.replace('/');
        return;
      }

      // Check guest progress expiry (7 days)
      if (!session) {
        const wizardDate = await AsyncStorage.getItem('wizard_complete_date');
        if (wizardDate) {
          const daysSince = (Date.now() - new Date(wizardDate).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince > 7) {
            await AsyncStorage.setItem('guest_expiry_warning', 'true');
          }
        }
      }

      // Wizard done → always go home (guest or logged in)
      router.replace('/(tabs)');
    };

    route();
  }, [initialized]); // session intentionally excluded — login/logout are handled in their own screens

  return (
    <DialectProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="lesson" options={{ headerShown: false }} />
          <Stack.Screen name="scenario" options={{ headerShown: false }} />
          <Stack.Screen name="quiz" options={{ headerShown: false }} />
          <Stack.Screen name="quiz-unit2" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-taxi" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-hotel" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-restaurant" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-supermarket" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-pharmacy" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-barbershop" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-airport" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-morning-routine" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-gym" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-cooking-home" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-weather-chat" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-doctor-visit" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-bank" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friday-gathering" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-neighbor-visit" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-lost-in-city" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-car-breakdown" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-police-station" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-hospital-emergency" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-lost-wallet" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-flight-problem" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-asking-for-help" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friends-new-neighbor" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friends-football" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friends-gaming" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friends-weekend" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friends-social-media" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friends-road-trip" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friends-birthday" options={{ headerShown: false }} />
          <Stack.Screen name="scenario-intro-friends-farewell" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen name="writing" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        {!splashHidden && (
          <SplashScreen
            ready={initialized}
            onReady={() => setSplashHidden(true)}
          />
        )}
      </ThemeProvider>
    </DialectProvider>
  );
}
