import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.CafeEntrance ?? require('../assets/images/arabic-cafe-entrance.png')}
      badge="☕ Unit 2 · Lesson 1"
      title="Café Ordering"
      description="You're walking into a traditional Arabic café in Dubai. Order your coffee, chat with the waiter, and practice real Gulf Arabic."
      pills={['☕ Ordering', '💬 Small talk', '💳 Paying']}
      stats={['🕐 4 mins', '💎 +120 XP', '📝 24 phrases']}
      buttonText="Let's Go! يلا نبدأ"
      onStart={() => router.push('/scenario?type=Cafe' as any)}
    />
  );
}
