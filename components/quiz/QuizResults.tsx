import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

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

  const circleColor = passed ? '#00897B' : '#D32F2F';

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
            <Text style={[styles.statVal, { color: '#00732F' }]}>{correct}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#D32F2F' }]}>{total - correct}</Text>
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
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lottie: { width: 120, height: 120, marginBottom: 4 },
  grade: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 12 },
  stars: { flexDirection: 'row', gap: 4, marginBottom: 20 },
  star: { fontSize: 32 },
  starActive: { opacity: 1 },
  starInactive: { opacity: 0.2 },
  scoreCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  scoreNum: { fontSize: 44, fontWeight: '800', lineHeight: 46 },
  scoreDivider: { fontSize: 16, color: '#555', fontWeight: '600' },
  scorePct: { fontSize: 13, color: '#555', marginTop: 2 },
  statsRow: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16, gap: 24, borderWidth: 0.5, borderColor: '#1e1e1e', width: '100%', justifyContent: 'center' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800', color: '#00897B' },
  statLabel: { fontSize: 11, color: '#555', textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 0.5, backgroundColor: '#2a2a2a' },
  passMsg: { fontSize: 13, color: '#00897B', fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  failMsg: { fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' },
  homeBtn: { width: '100%', height: 56, backgroundColor: '#00897B', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  homeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  retryBtn: { width: '100%', height: 50, backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  retryBtnText: { color: '#00897B', fontSize: 15, fontWeight: '700' },
});
