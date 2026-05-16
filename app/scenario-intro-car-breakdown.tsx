import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroCarBreakdownPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.CarBreakdownEntrance ?? require('../assets/images/dubai-car-breakdown-entrance.png')}
      badge="🚗 Unit 8 · Lesson 2"
      title="Car Breakdown"
      description="Your car broke down on Sheikh Zayed Road. Call the mechanic and explain what happened in Gulf Arabic."
      pills={['🚗 Breakdown vocab', '📞 Calling for help', '🔧 Car talk']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="سيارتي خربت — My car broke down!"
      onStart={() => router.push('/scenario?type=CarBreakdown' as any)}
    />
  );
}
