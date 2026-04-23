import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { theme } from '../../constants/theme';

interface Props {
  current: number;
  total: number;
}

export default function QuizProgress({ current, total }: Props) {
  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${(current / total) * 100}%` as any, { duration: 200 }),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, fillStyle]} />
      </View>
      <Text style={styles.label}>{current} / {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 10 },
  barBg: { flex: 1, height: 4, backgroundColor: theme.colors.bgBase, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: 2 },
  label: { fontSize: theme.fontSize.caption, fontWeight: theme.fontWeight.medium, color: theme.colors.textTertiary, minWidth: 40, textAlign: 'right' },
});
