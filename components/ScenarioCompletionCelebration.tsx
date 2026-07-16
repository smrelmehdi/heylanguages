import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import Yusuf from './Yusuf';

type Props = {
  headline: string;
  subtitle: string;
  score: number;
  xpEarned: number;
  phrasesSpoken: number;
  onBackHome: () => void;
  onTryAgain: () => void;
};

const CONFETTI = [
  { top: 34, left: 28, size: 10, color: '#F5A524' },
  { top: 64, left: 72, size: 14, color: '#3DD4C0' },
  { top: 44, right: 36, size: 12, color: '#E56B6F' },
  { top: 96, right: 82, size: 8, color: '#7FD99A' },
  { top: 152, left: 48, size: 9, color: '#F8D06C' },
  { top: 138, right: 28, size: 13, color: '#53C6E8' },
] as const;

export default function ScenarioCompletionCelebration({
  headline,
  subtitle,
  score,
  xpEarned,
  phrasesSpoken,
  onBackHome,
  onTryAgain,
}: Props) {
  const haloScale = useRef(new Animated.Value(0.96)).current;
  const haloOpacity = useRef(new Animated.Value(0.55)).current;
  const contentY = useRef(new Animated.Value(18)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(haloScale, {
              toValue: 1.04,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(haloOpacity, {
              toValue: 0.8,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(haloScale, {
              toValue: 0.96,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(haloOpacity, {
              toValue: 0.55,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ])
      ),
    ]).start();
  }, [contentOpacity, contentY, haloOpacity, haloScale]);

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(15, 15, 20, 0.96)', 'rgba(24, 28, 39, 0.98)', 'rgba(18, 47, 48, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {CONFETTI.map((piece, index) => (
          <View
            key={index}
            style={[
              styles.confetti,
              {
                top: piece.top,
                left: 'left' in piece ? piece.left : undefined,
                right: 'right' in piece ? piece.right : undefined,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.halo,
            {
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentY }],
            },
          ]}
        >
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kicker}>SCENARIO COMPLETE</Text>
            <View style={styles.kickerDot} />
          </View>

          <View style={styles.heroWrap}>
            <Yusuf mood="celebrating" size="lg" />
          </View>

          <Text style={styles.arabicTitle}>ممتاز!</Text>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>{score}% conversation score</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{phrasesSpoken}</Text>
              <Text style={styles.statLabel}>Phrases spoken</Text>
            </View>
            <View style={styles.statCardAccent}>
              <Text style={styles.statValueAccent}>+{xpEarned}</Text>
              <Text style={styles.statLabelAccent}>XP earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{score}%</Text>
              <Text style={styles.statLabel}>Pronunciation</Text>
            </View>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>You can handle this situation now.</Text>
            <Text style={styles.noteText}>Come back later to sharpen your score, or keep moving while the phrases are still fresh.</Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={onBackHome}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onTryAgain}>
            <Text style={styles.secondaryButtonText}>Run It Again</Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 34,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(61, 212, 192, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248, 208, 108, 0.18)',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.9,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F8D06C',
  },
  kicker: {
    color: '#F8D06C',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: theme.fontWeight.medium,
  },
  heroWrap: {
    marginBottom: 4,
  },
  arabicTitle: {
    color: theme.colors.textPrimary,
    fontSize: 42,
    fontWeight: theme.fontWeight.medium,
    marginBottom: 6,
  },
  headline: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
    marginBottom: 8,
    maxWidth: 320,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
    maxWidth: 320,
  },
  scorePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(248, 208, 108, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248, 208, 108, 0.28)',
    marginBottom: 20,
  },
  scorePillText: {
    color: '#F8D06C',
    fontSize: 13,
    fontWeight: theme.fontWeight.medium,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statCardAccent: {
    flex: 1,
    backgroundColor: 'rgba(61, 212, 192, 0.14)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(61, 212, 192, 0.25)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: theme.fontWeight.medium,
    marginBottom: 4,
  },
  statValueAccent: {
    color: '#7FD99A',
    fontSize: 24,
    fontWeight: theme.fontWeight.medium,
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statLabelAccent: {
    color: '#B7FFF0',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  noteCard: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 18,
  },
  noteTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: theme.fontWeight.medium,
    marginBottom: 6,
    textAlign: 'center',
  },
  noteText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F8D06C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#15161C',
    fontSize: 17,
    fontWeight: theme.fontWeight.medium,
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: theme.fontWeight.medium,
  },
});
