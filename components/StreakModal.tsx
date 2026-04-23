import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { getWeekDays } from '../utils/streak';
import type { StreakData } from '../utils/streak';
import { theme } from '../constants/theme';

interface Props {
  visible: boolean;
  streakData: StreakData;
  onClose: () => void;
}

export default function StreakModal({ visible, streakData, onClose }: Props) {
  const { currentStreak, longestStreak, activeDates } = streakData;
  const weekDays = getWeekDays();
  const activeSet = new Set(activeDates);

  const bodyMsg =
    currentStreak === 0
      ? 'Complete a lesson today to start your streak!'
      : currentStreak === 1
      ? 'Great start! Come back tomorrow to keep it going.'
      : 'Come back tomorrow to keep your streak!';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>

          {/* Big streak number */}
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.streakNum}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>

          {/* Weekly dots */}
          <View style={styles.weekRow}>
            {weekDays.map(day => {
              const active = activeSet.has(day.date);
              return (
                <View key={day.date} style={styles.dayCol}>
                  <View style={[
                    styles.dot,
                    active     && styles.dotActive,
                    day.isToday && !active && styles.dotToday,
                  ]} />
                  <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Longest streak */}
          <View style={styles.longestRow}>
            <Text style={styles.longestLabel}>Longest streak</Text>
            <Text style={styles.longestVal}>🏆 {longestStreak} days</Text>
          </View>

          {/* Message */}
          <Text style={styles.msg}>{bodyMsg}</Text>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
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
  fireEmoji: { fontSize: 48, marginBottom: 4 },
  streakNum: { fontSize: 64, fontWeight: theme.fontWeight.medium, color: theme.colors.accentWarm, lineHeight: 72 },
  streakLabel: { fontSize: theme.fontSize.label, color: theme.colors.textSecondary, fontWeight: theme.fontWeight.medium, marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1.5 },

  weekRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    backgroundColor: theme.colors.bgBase,
    borderRadius: theme.radii.lg,
    padding: 16,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  dayCol: { alignItems: 'center', gap: 6 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  dotActive: {
    backgroundColor: theme.colors.accentWarm,
    borderColor: theme.colors.accentWarm,
  },
  dotToday: {
    borderColor: theme.colors.borderAccent,
    borderWidth: 2,
  },
  dayLabel: { fontSize: theme.fontSize.label, color: theme.colors.textTertiary, fontWeight: theme.fontWeight.medium },
  dayLabelToday: { color: theme.colors.textAccent },

  longestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    backgroundColor: theme.colors.bgBase,
    borderRadius: theme.radii.md,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  longestLabel: { fontSize: 14, color: theme.colors.textSecondary },
  longestVal: { fontSize: 14, color: theme.colors.textPrimary, fontWeight: theme.fontWeight.medium },

  msg: { fontSize: theme.fontSize.body, color: theme.colors.textTertiary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  closeBtn: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: theme.colors.bgBase, fontSize: 16, fontWeight: theme.fontWeight.medium },
});
