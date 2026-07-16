import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

const LOGO = require('../assets/images/logo.png');
const YUSUF = require('../assets/images/yusuf-welcome.png');

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
const FADE_OUT_MS = 500;
const TIP_INTERVAL_MS = 3000;
const TIP_FADE_MS = 280;

interface Props {
  ready: boolean;
  onReady?: () => void;
}

export default function SplashScreen({ ready, onReady }: Props) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;
  // Entry animations
  const logoScale   = useRef(new Animated.Value(0.82)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const yusufTransY = useRef(new Animated.Value(24)).current;
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

  // Entry animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(180),
        Animated.parallel([
          Animated.timing(yusufOpacity, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.spring(yusufTransY, {
            toValue: 0,
            tension: 55,
            friction: 9,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
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
      {/* TOP — Logo + name */}
      <View style={styles.topZone}>
        <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>
        <Text style={styles.appName}>HeyYusuf</Text>
        <View style={styles.tagPill}>
          <Text style={styles.tagDot}>●</Text>
          <Text style={styles.appTag}>GULF ARABIC</Text>
          <Text style={styles.tagDot}>●</Text>
        </View>
      </View>

      {/* MIDDLE — Yusuf character */}
      <Animated.View style={[styles.yusufWrap, { opacity: yusufOpacity, transform: [{ translateY: yusufTransY }] }]}>
        <Image source={YUSUF} style={styles.yusufImage} resizeMode="contain" />
      </Animated.View>

      {/* BOTTOM — Rotating tips */}
      <View style={styles.bottomZone}>
        <View style={styles.tipDivider}>
          <View style={styles.tipLine} />
          <Text style={styles.tipLabel}>TIP</Text>
          <View style={styles.tipLine} />
        </View>
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
    paddingBottom: 40,
  },

  // TOP
  topZone: {
    paddingTop: 72,
    alignItems: 'center',
    gap: 0,
  },
  logoWrap: {
    shadowColor: '#3DD4C0',
    shadowOpacity: 0.45,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
    marginBottom: 18,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  appName: {
    color: '#F7F5F0',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(61, 212, 192, 0.25)',
    backgroundColor: 'rgba(61, 212, 192, 0.06)',
  },
  tagDot: {
    color: '#3DD4C0',
    fontSize: 5,
    opacity: 0.7,
  },
  appTag: {
    color: '#3DD4C0',
    fontSize: 10,
    letterSpacing: 2.5,
    fontWeight: '600',
    opacity: 0.85,
  },

  // MIDDLE — Yusuf
  yusufWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  yusufImage: {
    width: 200,
    height: 200,
  },

  // BOTTOM — Tips
  bottomZone: {
    paddingBottom: 8,
    alignItems: 'center',
    gap: 6,
  },
  tipDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipLine: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(61, 212, 192, 0.35)',
  },
  tipLabel: {
    color: 'rgba(61, 212, 192, 0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
  tipSection: {
    paddingHorizontal: 36,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  tipAr: {
    color: '#F7F5F0',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  tipEn: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
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
