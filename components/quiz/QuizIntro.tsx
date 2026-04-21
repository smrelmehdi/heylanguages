import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

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
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  lottie: { width: 160, height: 160, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#888', marginBottom: 24 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  pill: { backgroundColor: '#161616', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 0.5, borderColor: '#2a2a2a' },
  pillText: { fontSize: 13, color: '#ccc' },
  xpCard: { backgroundColor: 'rgba(0,137,123,0.08)', borderWidth: 1, borderColor: '#00897B', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 32, width: '100%' },
  xpText: { fontSize: 18, fontWeight: '700', color: '#00897B', marginBottom: 4 },
  xpSub: { fontSize: 12, color: '#555' },
  startBtn: { width: '100%', height: 58, backgroundColor: '#00897B', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
