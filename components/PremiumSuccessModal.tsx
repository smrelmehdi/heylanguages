import { Check, Crown } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PremiumSuccessModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.crownWell}>
            <Crown color={theme.colors.accentWarm} size={32} />
            <View style={styles.checkBadge}>
              <Check color={theme.colors.bgBase} size={13} strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.title}>Welcome to HeyYusuf Premium</Text>
          <Text style={styles.message}>
            Every lesson, scenario, practice mode, and offline audio pack is now unlocked.
          </Text>
          <Pressable
            style={styles.button}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Start Learning"
          >
            <Text style={styles.buttonText}>Start Learning</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.68)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 28,
    alignItems: 'center',
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.accentWarm}66`,
  },
  crownWell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.accentWarm}18`,
    borderWidth: 1,
    borderColor: `${theme.colors.accentWarm}55`,
    marginBottom: 18,
  },
  checkBadge: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentPrimary,
    borderWidth: 2,
    borderColor: theme.colors.bgSurface,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    minHeight: 50,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accentPrimary,
  },
  buttonText: {
    color: theme.colors.bgBase,
    fontSize: 15,
    fontWeight: theme.fontWeight.medium,
  },
});
