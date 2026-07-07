import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';

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
  overlay: { flex: 1, backgroundColor: 'rgba(31, 29, 39, 0.85)', justifyContent: 'flex-end' },
  card: { backgroundColor: theme.colors.bgSurface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderDefault },
  title: { fontSize: theme.fontSize.title, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: theme.fontSize.body, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  benefits: { width: '100%', gap: 10, marginBottom: 24 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitCheck: { fontSize: 16, color: theme.colors.accentSuccess, fontWeight: theme.fontWeight.medium, width: 20 },
  benefitText: { fontSize: 15, color: theme.colors.textPrimary, fontWeight: theme.fontWeight.regular },
  signUpBtn: { width: '100%', minHeight: 52, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center', marginBottom: 12, paddingVertical: 14 },
  signUpBtnText: { color: theme.colors.bgBase, fontSize: 17, fontWeight: theme.fontWeight.medium },
  laterBtn: { paddingVertical: 12 },
  laterText: { color: theme.colors.textSecondary, fontSize: 14 },
});
