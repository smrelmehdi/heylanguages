import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { MILESTONE_MESSAGES } from '../utils/streak';

interface Props {
  visible: boolean;
  milestone: number | null;
  onClose: () => void;
}

export default function MilestoneModal({ visible, milestone, onClose }: Props) {
  if (!milestone) return null;

  const message = MILESTONE_MESSAGES[milestone] ?? `${milestone} day streak! Keep going 🔥`;
  const fires = '🔥'.repeat(Math.min(milestone <= 3 ? 1 : milestone <= 7 ? 2 : milestone <= 14 ? 3 : 4, 4));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LottieView
            source={require('../assets/images/animations/yusuf-celebrating.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.fires}>{fires}</Text>
          <Text style={styles.title}>{milestone} Day Streak!</Text>
          <Text style={styles.message}>{message}</Text>
          <Pressable style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Awesome! 🎉</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  lottie: { width: 140, height: 140, marginBottom: 4 },
  fires: { fontSize: 36, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', color: '#FF9600', marginBottom: 12 },
  message: { fontSize: 16, color: '#fff', textAlign: 'center', lineHeight: 24, marginBottom: 28, opacity: 0.9 },
  btn: {
    width: '100%',
    height: 54,
    backgroundColor: '#00897B',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
