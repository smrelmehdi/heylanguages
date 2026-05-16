import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFridayGatheringPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FridayGatheringEntrance ?? require('../assets/images/dubai-friday-gathering-entrance.png')}
      badge="🕌 Unit 6 · Lesson 7"
      title="Friday Gathering"
      description="The whole family is together after Jumu'ah prayer. Uncle (amm) welcomes you in, there's mandi and kabsa on the table, and the elders are ready to eat."
      pills={['🕌 Welcome', '🍖 Mandi & Kabsa', '👴 The elders']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="أهلاً يا عمي! Hello Uncle!"
      onStart={() => router.push('/scenario?type=FridayGathering' as any)}
    />
  );
}
