import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { getWeekDays } from '../utils/streak';
import type { StreakData } from '../utils/streak';

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
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    borderColor: '#1e1e1e',
  },
  fireEmoji: { fontSize: 48, marginBottom: 4 },
  streakNum: { fontSize: 64, fontWeight: '900', color: '#FF9600', lineHeight: 72 },
  streakLabel: { fontSize: 14, color: '#888', fontWeight: '600', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 },

  weekRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#2a2a2a',
  },
  dayCol: { alignItems: 'center', gap: 6 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e1e1e',
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  dotActive: {
    backgroundColor: '#FF9600',
    borderColor: '#FF9600',
  },
  dotToday: {
    borderColor: '#00897B',
    borderWidth: 2,
  },
  dayLabel: { fontSize: 11, color: '#555', fontWeight: '600' },
  dayLabelToday: { color: '#00897B' },

  longestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#2a2a2a',
  },
  longestLabel: { fontSize: 14, color: '#888' },
  longestVal: { fontSize: 14, color: '#fff', fontWeight: '700' },

  msg: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 24, lineHeight: 20 },

  closeBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#00897B',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
