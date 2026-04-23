import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { theme } from '../../constants/theme';

const PASSING_SCORE = 14;

interface Props {
  correct: number;
  total: number;
  xpEarned: number;
  hasMissed: boolean;
  onRetry: () => void;
  onHome: () => void;
}

export default function QuizResults({ correct, total, xpEarned, hasMissed, onRetry, onHome }: Props) {
  const pct = Math.round((correct / total) * 100);
  const passed = correct >= PASSING_SCORE;
  const stars = pct === 100 ? 3 : pct >= 78 ? 2 : 1;

  const grade =
    stars === 3 ? 'Perfect! 🌟' :
    stars === 2 ? 'Great work! 👍' :
    'Keep practicing 💪';

  const circleColor = passed ? theme.colors.accentPrimary : theme.colors.accentDanger;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={stars >= 2
            ? require('../../assets/images/animations/yusuf-celebrating.json')
            : require('../../assets/images/animations/yusuf-sad.json')
          }
          autoPlay
          loop={false}
          style={styles.lottie}
        />

        <Text style={styles.grade}>{grade}</Text>

        {/* Stars */}
        <View style={styles.stars}>
          {[1, 2, 3].map(s => (
            <Text key={s} style={[styles.star, s <= stars ? styles.starActive : styles.starInactive]}>
              ⭐
            </Text>
          ))}
        </View>

        {/* Score circle */}
        <View style={[styles.scoreCircle, { borderColor: circleColor }]}>
          <Text style={[styles.scoreNum, { color: circleColor }]}>{correct}</Text>
          <Text style={styles.scoreDivider}>/ {total}</Text>
          <Text style={styles.scorePct}>{pct}%</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>+{xpEarned}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: theme.colors.accentSuccess }]}>{correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: theme.colors.accentDanger }]}>{total - correct}</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        {passed ? (
          <Text style={styles.passMsg}>✓ Quiz passed! Next lesson unlocked.</Text>
        ) : (
          <Text style={styles.failMsg}>Need {PASSING_SCORE}/{total} to pass. You can do it!</Text>
        )}

        {/* Buttons */}
        <Pressable style={styles.homeBtn} onPress={onHome}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>

        {hasMissed && !passed && (
          <Pressable style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryBtnText}>Retry Missed Questions</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xxl },
  lottie: { width: 120, height: 120, marginBottom: 4 },
  grade: { fontSize: 22, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 12 },
  stars: { flexDirection: 'row', gap: 4, marginBottom: 20 },
  star: { fontSize: 32 },
  starActive: { opacity: 1 },
  starInactive: { opacity: 0.2 },
  scoreCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  scoreNum: { fontSize: 44, fontWeight: theme.fontWeight.medium, lineHeight: 46 },
  scoreDivider: { fontSize: theme.fontSize.heading, color: theme.colors.textTertiary, fontWeight: theme.fontWeight.medium },
  scorePct: { fontSize: theme.fontSize.body, color: theme.colors.textTertiary, marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, padding: theme.spacing.xl, marginBottom: 16, gap: 24, borderWidth: 1, borderColor: theme.colors.borderDefault, width: '100%', justifyContent: 'center' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent },
  statLabel: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary, textTransform: 'uppercase', marginTop: 2, letterSpacing: 1.5 },
  statDivider: { width: 0.5, backgroundColor: theme.colors.borderDefault },
  passMsg: { fontSize: theme.fontSize.body, color: theme.colors.textAccent, fontWeight: theme.fontWeight.medium, marginBottom: 20, textAlign: 'center' },
  failMsg: { fontSize: theme.fontSize.body, color: theme.colors.textTertiary, marginBottom: 20, textAlign: 'center' },
  homeBtn: { width: '100%', height: 56, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  homeBtnText: { color: theme.colors.bgBase, fontSize: 17, fontWeight: theme.fontWeight.medium },
  retryBtn: { width: '100%', height: 50, backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.borderDefault, alignItems: 'center', justifyContent: 'center' },
  retryBtnText: { color: theme.colors.textAccent, fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium },
});
