import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { theme } from '../../constants/theme';

interface Props {
  title: string;
  onStart: () => void;
}

export default function QuizIntro({ title, onStart }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={require('../../assets/images/animations/yusuf-waving.json')}
          autoPlay
          loop
          style={styles.lottie}
        />

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>18 questions · ~5 min</Text>

        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>🎭 Scene Replay</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>💬 Fill the Blank</Text></View>
        </View>
        <View style={styles.pillRow}>
          <View style={styles.pill}><Text style={styles.pillText}>🎧 Listening</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>🔗 Emoji Match</Text></View>
        </View>

        <View style={styles.xpCard}>
          <Text style={styles.xpText}>💎 Up to +230 XP</Text>
          <Text style={styles.xpSub}>+10 per correct · +50 perfect bonus</Text>
        </View>

        <Pressable style={styles.startBtn} onPress={onStart}>
          <Text style={styles.startBtnText}>يلا نبدأ! Start Quiz</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xxl },
  lottie: { width: 160, height: 160, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: theme.fontSize.body, color: theme.colors.textTertiary, marginBottom: 24 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  pill: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.pill, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: theme.colors.borderDefault },
  pillText: { fontSize: theme.fontSize.body, color: theme.colors.textSecondary },
  xpCard: { backgroundColor: 'rgba(61, 212, 192, 0.08)', borderWidth: 1, borderColor: theme.colors.borderAccent, borderRadius: theme.radii.lg, padding: theme.spacing.lg, alignItems: 'center', marginTop: 20, marginBottom: 32, width: '100%' },
  xpText: { fontSize: 18, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent, marginBottom: 4 },
  xpSub: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary },
  startBtn: { width: '100%', height: 58, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: theme.colors.bgBase, fontSize: 18, fontWeight: theme.fontWeight.medium },
});
