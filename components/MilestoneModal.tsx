import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { MILESTONE_MESSAGES } from '../utils/streak';
import { theme } from '../constants/theme';

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
    backgroundColor: 'rgba(31, 29, 39, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radii.lg,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  fires: { fontSize: 36, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: theme.fontWeight.medium, color: theme.colors.accentSuccess, marginBottom: 12 },
  message: { fontSize: 16, color: theme.colors.textPrimary, textAlign: 'center', lineHeight: 24, marginBottom: 28, opacity: 0.9 },
  btn: {
    width: '100%',
    minHeight: 52,
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnText: { color: theme.colors.bgBase, fontSize: 17, fontWeight: theme.fontWeight.medium },
});
