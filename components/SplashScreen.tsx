import LottieView from 'lottie-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const TIPS = [
  { ar: 'لا تحفظ، كرّر', en: "Don't memorise, just repeat" },
  { ar: 'الأبجدية بعدين', en: 'Alphabet comes later, speaking comes first' },
  { ar: 'اسمع أولاً، ثم تكلم', en: 'Listen first, then speak' },
  { ar: 'غلط وكمّل', en: 'Make mistakes and keep going' },
  { ar: 'الخليجي سهل لما تسمعه كثير', en: 'Gulf Arabic gets easy with exposure' },
  { ar: 'كرّر بصوت عالٍ', en: 'Say it out loud, every time' },
  { ar: 'جملة واحدة كل يوم تكفي', en: 'One sentence a day is enough' },
  { ar: 'لا تترجم، احس بالمعنى', en: "Don't translate, feel the meaning" },
];

const MIN_VISIBLE_MS = 3500;
const FADE_OUT_MS = 400;
const TIP_INTERVAL_MS = 3000;
const TIP_FADE_MS = 280;

interface Props {
  ready: boolean;
  onReady?: () => void;
}

export default function SplashScreen({ ready, onReady }: Props) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;
  const yusufOpacity = useRef(new Animated.Value(0)).current;
  const mountedAt = useRef(Date.now());
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const [hidden, setHidden] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Randomise tip order on mount, then cycle sequentially
  const order = useMemo(() => {
    const arr = TIPS.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // Tip rotation: fade in → hold → fade out → next
  useEffect(() => {
    let cancelled = false;

    Animated.timing(tipOpacity, {
      toValue: 1,
      duration: TIP_FADE_MS,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      Animated.timing(tipOpacity, {
        toValue: 0,
        duration: TIP_FADE_MS,
        useNativeDriver: true,
      }).start(() => {
        if (cancelled) return;
        setTipIndex((i) => (i + 1) % order.length);
        Animated.timing(tipOpacity, {
          toValue: 1,
          duration: TIP_FADE_MS,
          useNativeDriver: true,
        }).start();
      });
    }, TIP_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [order.length, tipOpacity]);

  // Fade Yusuf in after 300ms so the Lottie grid artifact (Android first-frame) never shows
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(yusufOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, 600);
    return () => clearTimeout(t);
  }, [yusufOpacity]);

  // Fade out once parent says ready AND minimum visible time has elapsed
  useEffect(() => {
    if (!ready || hidden) return;

    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    const t = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(() => {
        setHidden(true);
        onReadyRef.current?.();
      });
    }, wait);

    return () => clearTimeout(t);
  }, [ready, hidden, containerOpacity]);

  if (hidden) return null;

  const tip = order[tipIndex];

  return (
    <Animated.View
      style={[styles.container, { opacity: containerOpacity }]}
      pointerEvents="none"
    >
      {/* ZONE 1 — TOP */}
      <View style={styles.topZone}>
        <View style={styles.iconSquare}>
          <Text style={styles.iconText}>يـ</Text>
        </View>
        <Text style={styles.appName}>HeyYusuf</Text>
        <Text style={styles.appTag}>GULF ARABIC</Text>
      </View>

      {/* ZONE 2 — MIDDLE */}
      <View style={styles.middleZone}>
        <View style={styles.glow} pointerEvents="none" />
        <Animated.View style={{ opacity: yusufOpacity }}>
          <LottieView
            source={require('../assets/images/animations/yusuf-waving.json')}
            autoPlay
            loop
            renderMode="SOFTWARE"
            style={styles.lottie}
          />
        </Animated.View>
      </View>

      {/* ZONE 3 — BOTTOM */}
      <View style={styles.bottomZone}>
        <View style={styles.tealLine} />
        <Animated.View style={[styles.tipSection, { opacity: tipOpacity }]}>
          <Text style={styles.tipAr}>{tip.ar}</Text>
          <Text style={styles.tipEn}>{tip.en}</Text>
        </Animated.View>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, i === tipIndex % 3 && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1F1D27',
    zIndex: 9999,
    elevation: 9999,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },

  // ZONE 1 — TOP
  topZone: {
    paddingTop: 52,
    alignItems: 'center',
  },
  iconSquare: {
    width: 52,
    height: 52,
    backgroundColor: '#3DD4C0',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3DD4C0',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  iconText: {
    color: '#1F1D27',
    fontSize: 20,
    fontWeight: '800',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
  },
  appTag: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    letterSpacing: 2.5,
    marginTop: 4,
  },

  // ZONE 2 — MIDDLE
  middleZone: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'transparent',
    shadowColor: '#3DD4C0',
    shadowOpacity: 0.15,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  lottie: {
    width: 240,
    height: 240,
    backgroundColor: 'transparent',
  },

  // ZONE 3 — BOTTOM
  bottomZone: {
    paddingBottom: 24,
    alignItems: 'center',
    gap: 6,
  },
  tealLine: {
    width: 28,
    height: 2,
    backgroundColor: '#3DD4C0',
    borderRadius: 2,
    opacity: 0.6,
    marginBottom: 4,
  },
  tipSection: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  tipAr: {
    color: '#3DD4C0',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  tipEn: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#3DD4C0',
  },
});
