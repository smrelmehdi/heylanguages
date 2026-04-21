import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  reason: string;
}

const BENEFITS = [
  'Unlock all lessons',
  'Save progress forever',
  'Track your streak',
  'Chat with Yusuf',
];

export default function SignUpPrompt({ visible, onClose, reason }: Props) {
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LottieView
            source={require('../assets/images/animations/yusuf-waving.json')}
            autoPlay
            loop
            style={{ width: 120, height: 120 }}
          />
          <Text style={styles.title}>Don't lose your progress!</Text>
          <Text style={styles.subtitle}>
            Create a free account to {reason} and save everything.
          </Text>

          <View style={styles.benefits}>
            {BENEFITS.map(b => (
              <View key={b} style={styles.benefit}>
                <Text style={styles.benefitCheck}>✓</Text>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={styles.signUpBtn}
            onPress={() => {
              onClose();
              router.push('/login' as any);
            }}
          >
            <Text style={styles.signUpBtnText}>Create Free Account</Text>
          </Pressable>

          <Pressable style={styles.laterBtn} onPress={onClose}>
            <Text style={styles.laterText}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#111', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center', borderWidth: 0.5, borderColor: '#222' },
  title: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  benefits: { width: '100%', gap: 10, marginBottom: 24 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitCheck: { fontSize: 16, color: '#00897B', fontWeight: '700', width: 20 },
  benefitText: { fontSize: 15, color: '#FFF', fontWeight: '500' },
  signUpBtn: { width: '100%', height: 56, backgroundColor: '#00897B', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  signUpBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  laterBtn: { paddingVertical: 12 },
  laterText: { color: '#555', fontSize: 14 },
});
