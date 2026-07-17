import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import type { QuizTierInfo } from '../../utils/quiz-level';

interface Props {
  title: string;
  tier: QuizTierInfo;
  questionCount: number;
  maxXp: number;
  isLoading?: boolean;
  onStart: () => void;
}

const FORMAT_PILLS: Record<string, string> = {
  scene_replay:         '🎭 Scene Replay',
  fill_conversation:    '💬 Fill the Blank',
  listening:            '🎧 Listening',
  emoji_match:          '🔗 Emoji Match',
  transliteration_type: '⌨️ Type It',
  arabic_select:        '✍️ Read Arabic',
};

export default function QuizIntro({ title, tier, questionCount, maxXp, isLoading = false, onStart }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{questionCount} questions · ~{Math.ceil(questionCount * 0.4)} min</Text>

        {/* Tier badge */}
        <View style={styles.tierBadge}>
          <Text style={styles.tierIcon}>{tier.icon}</Text>
          <View>
            <Text style={styles.tierLabel}>QUIZ TIER</Text>
            <Text style={styles.tierName}>{tier.label}</Text>
          </View>
          <Text style={styles.tierTagline}>{tier.tagline}</Text>
        </View>

        {/* Format pills */}
        <View style={styles.pillGrid}>
          {tier.formats.map(fmt => (
            <View key={fmt} style={[styles.pill, fmt === 'transliteration_type' || fmt === 'arabic_select' ? styles.pillNew : null]}>
              <Text style={styles.pillText}>{FORMAT_PILLS[fmt] ?? fmt}</Text>
              {(fmt === 'transliteration_type' || fmt === 'arabic_select') && (
                <View style={styles.newTag}><Text style={styles.newTagText}>NEW</Text></View>
              )}
            </View>
          ))}
        </View>

        {/* Transliteration hint */}
        {!tier.showTranslit && (
          <View style={styles.hintCard}>
            <Text style={styles.hintCardText}>
              👁 Transliteration is hidden — tap "Reveal" on any question if you need it
            </Text>
          </View>
        )}

        <View style={styles.xpCard}>
          <Text style={styles.xpText}>💎 Up to +{maxXp} XP</Text>
          <Text style={styles.xpSub}>No-hint perfect performance</Text>
        </View>

        <Pressable
          style={[styles.startBtn, isLoading && styles.startBtnDisabled]}
          onPress={onStart}
          disabled={isLoading}
        >
          <Text style={styles.startBtnText}>{isLoading ? 'Preparing…' : 'يلا نبدأ! Start Quiz'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xxl, gap: 14 },
  title: { fontSize: 26, fontWeight: theme.fontWeight.medium, color: theme.colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: theme.fontSize.body, color: theme.colors.textTertiary },

  tierBadge: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.md,
    padding: 14, borderWidth: 1, borderColor: theme.colors.borderAccent,
    flexWrap: 'wrap',
  },
  tierIcon: { fontSize: 26 },
  tierLabel: { fontSize: 10, color: theme.colors.textTertiary, letterSpacing: 1.2, fontWeight: theme.fontWeight.medium },
  tierName: { fontSize: 16, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent },
  tierTagline: { fontSize: 12, color: theme.colors.textSecondary, flex: 1, flexShrink: 1 },

  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: { backgroundColor: theme.colors.bgSurface, borderRadius: theme.radii.pill, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: theme.colors.borderDefault, flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillNew: { borderColor: theme.colors.accentPrimary },
  pillText: { fontSize: theme.fontSize.body, color: theme.colors.textSecondary },
  newTag: { backgroundColor: theme.colors.accentPrimary, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  newTagText: { fontSize: 9, color: theme.colors.bgBase, fontWeight: theme.fontWeight.medium, letterSpacing: 0.5 },

  hintCard: { width: '100%', backgroundColor: 'rgba(255, 170, 0, 0.06)', borderRadius: theme.radii.md, padding: 12, borderWidth: 1, borderColor: 'rgba(255, 170, 0, 0.25)' },
  hintCardText: { fontSize: 13, color: theme.colors.accentWarm, textAlign: 'center', lineHeight: 18 },

  xpCard: { backgroundColor: 'rgba(61, 212, 192, 0.08)', borderWidth: 1, borderColor: theme.colors.borderAccent, borderRadius: theme.radii.lg, padding: theme.spacing.lg, alignItems: 'center', width: '100%' },
  xpText: { fontSize: 18, fontWeight: theme.fontWeight.medium, color: theme.colors.textAccent, marginBottom: 4 },
  xpSub: { fontSize: theme.fontSize.caption, color: theme.colors.textTertiary },

  startBtn: { width: '100%', height: 58, backgroundColor: theme.colors.accentPrimary, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center' },
  startBtnDisabled: { opacity: 0.65 },
  startBtnText: { color: theme.colors.bgBase, fontSize: 18, fontWeight: theme.fontWeight.medium },
});
