import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroGymPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.AtGym ?? require('../assets/images/dubai-supermarket-interior.png')}
      badge="💪 Unit 6 · Lesson 2"
      title="At the Gym"
      description="Your personal trainer Mudarrib is ready for the session. Warm up, hit the treadmill, and push through your workout in Gulf Arabic."
      pills={['👋 Greetings', '🏃 Warm-up', '💪 Training']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="يلا نتمرن! Let's Train!"
      onStart={() => router.push('/scenario?type=AtGym' as any)}
    />
  );
}
