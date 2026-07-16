import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import type { QuizSrsSummary } from '../../utils/srs';

const PASSING_SCORE = 14;

interface Props {
  correct: number;
  total: number;
  xpEarned: number;
  hasMissed: boolean;
  srsSummary?: QuizSrsSummary | null;
  onRetry: () => void;
  onHome: () => void;
}

export default function QuizResults({ correct, total, xpEarned, hasMissed, srsSummary, onRetry, onHome }: Props) {
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

        {srsSummary && (
          <View style={styles.srsCard}>
            <Text style={styles.srsTitle}>Review impact</Text>
            <View style={styles.srsRow}>
              <View style={styles.srsItem}>
                <Text style={styles.srsValue}>{srsSummary.dueCount}</Text>
                <Text style={styles.srsLabel}>Due reviewed</Text>
              </View>
              <View style={styles.srsItem}>
                <Text style={styles.srsValue}>{srsSummary.weakCount}</Text>
                <Text style={styles.srsLabel}>Weak items</Text>
              </View>
              <View style={styles.srsItem}>
                <Text style={styles.srsValue}>{srsSummary.unseenCount}</Text>
                <Text style={styles.srsLabel}>Fresh items</Text>
              </View>
            </View>
            <Text style={styles.srsNote}>Weak and overdue items are now pushed higher in future quiz sessions.</Text>
          </View>
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
  srsCard: { width: '100%', backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.borderDefault, padding: theme.spacing.lg, marginBottom: 20 },
  srsTitle: { fontSize: 16, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 12, textAlign: 'center' },
  srsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  srsItem: { flex: 1, alignItems: 'center', backgroundColor: theme.colors.bgElevated, borderRadius: theme.radii.md, paddingVertical: 12, paddingHorizontal: 8 },
  srsValue: { fontSize: 20, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent },
  srsLabel: { fontSize: 11, color: theme.colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2, textAlign: 'center' },
  srsNote: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  homeBtn: { width: '100%', height: 56, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  homeBtnText: { color: theme.colors.bgBase, fontSize: 17, fontWeight: theme.fontWeight.medium },
  retryBtn: { width: '100%', height: 50, backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.lg, borderWidth: 1, borderColor: theme.colors.borderDefault, alignItems: 'center', justifyContent: 'center' },
  retryBtnText: { color: theme.colors.textAccent, fontSize: theme.fontSize.heading, fontWeight: theme.fontWeight.medium },
});
