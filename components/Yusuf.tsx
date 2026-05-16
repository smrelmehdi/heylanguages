import LottieView, { type AnimationObject } from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export type Mood = 'waving' | 'talking' | 'celebrating' | 'sad' | 'thinking';
export type Size = 'sm' | 'md' | 'lg';

interface Props {
  mood: Mood;
  size: Size;
  whisper?: string;
  onAnimationEnd?: () => void;
}

const SIZE_MAP: Record<Size, number> = {
  sm: 80,
  md: 160,
  lg: 260,
};

const SOURCES: Record<Mood, AnimationObject> = {
  waving: require('../assets/images/animations/yusuf-waving.json'),
  talking: require('../assets/images/animations/yusuf-talking.json'),
  celebrating: require('../assets/images/animations/yusuf-celebrating.json'),
  sad: require('../assets/images/animations/yusuf-sad.json'),
  thinking: require('../assets/images/animations/yusuf-thinking.json'),
};

// Moods that play once and fire onAnimationEnd via Lottie's finish event.
// Looping moods rely on the whisper auto-dismiss to surface onAnimationEnd.
const ONE_SHOT: Record<Mood, boolean> = {
  waving: false,
  talking: false,
  thinking: false,
  celebrating: true,
  sad: true,
};

const WHISPER_HOLD_MS = 3000;
const WHISPER_FADE_MS = 200;
const WHISPER_SLIDE_PX = 8;

export default function Yusuf({ mood, size, whisper, onAnimationEnd }: Props) {
  const dim = SIZE_MAP[size];
  const isOneShot = ONE_SHOT[mood];

  // Refs so the timer/finish callbacks always see the latest values without
  // re-binding effects.
  const onEndRef = useRef(onAnimationEnd);
  onEndRef.current = onAnimationEnd;

  const isOneShotRef = useRef(isOneShot);
  isOneShotRef.current = isOneShot;

  const whisperOpacity = useRef(new Animated.Value(0)).current;
  const whisperTranslateY = useRef(new Animated.Value(WHISPER_SLIDE_PX)).current;

  // `shown` lags `whisper` on dismissal so the bubble stays mounted through
  // its fade-out animation after the prop clears.
  const [shown, setShown] = useState<string | undefined>(whisper);

  // Whisper lifecycle: fade-in on (re)mount, hold 3s, fade-out, optionally
  // surface onAnimationEnd. Re-runs on every whisper change so the timer resets.
  useEffect(() => {
    if (!whisper) {
      // Parent cleared whisper while bubble may still be visible — fade out
      // gracefully, then unmount. Don't surface onAnimationEnd: this is an
      // explicit dismissal, not a natural completion.
      Animated.parallel([
        Animated.timing(whisperOpacity, {
          toValue: 0,
          duration: WHISPER_FADE_MS,
          useNativeDriver: true,
        }),
        Animated.timing(whisperTranslateY, {
          toValue: WHISPER_SLIDE_PX,
          duration: WHISPER_FADE_MS,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setShown(undefined);
      });
      return;
    }

    setShown(whisper);

    Animated.parallel([
      Animated.timing(whisperOpacity, {
        toValue: 1,
        duration: WHISPER_FADE_MS,
        useNativeDriver: true,
      }),
      Animated.timing(whisperTranslateY, {
        toValue: 0,
        duration: WHISPER_FADE_MS,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(whisperOpacity, {
          toValue: 0,
          duration: WHISPER_FADE_MS,
          useNativeDriver: true,
        }),
        Animated.timing(whisperTranslateY, {
          toValue: WHISPER_SLIDE_PX,
          duration: WHISPER_FADE_MS,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) return;
        setShown(undefined);
        // Only surface onAnimationEnd here if the underlying Lottie won't
        // (i.e. it's a looping mood that has no natural end).
        if (!isOneShotRef.current) onEndRef.current?.();
      });
    }, WHISPER_HOLD_MS);

    return () => clearTimeout(timer);
  }, [whisper, whisperOpacity, whisperTranslateY]);

  const handleLottieFinish = () => {
    if (isOneShot) onEndRef.current?.();
  };

  return (
    <View style={styles.container}>
      {shown ? (
        <Animated.View
          style={[
            styles.bubble,
            {
              opacity: whisperOpacity,
              transform: [{ translateY: whisperTranslateY }],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.bubbleText}>{shown}</Text>
        </Animated.View>
      ) : null}

      <LottieView
        source={SOURCES[mood]}
        autoPlay
        loop={!isOneShot}
        onAnimationFinish={handleLottieFinish}
        style={{ width: dim, height: dim }}
      />
    </View>
  );
}

export function useMood(initial: Mood) {
  return useState<Mood>(initial);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  bubble: {
    marginBottom: 12,
    backgroundColor: '#2A2735',
    borderColor: '#3DD4C0',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: 280,
  },
  bubbleText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
