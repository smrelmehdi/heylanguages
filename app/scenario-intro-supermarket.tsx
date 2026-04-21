import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroSupermarketPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.SupermarketEntrance ?? require('../assets/images/dubai-supermarket-entrance.png')}
      badge="🛒 Unit 2 · Lesson 5"
      title="Supermarket"
      description="You're shopping at a local supermarket in Dubai. Find items, ask for prices, and check out — all in Gulf Arabic."
      pills={['🔍 Finding items', '💬 Asking prices', '💳 Checkout']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 12 phrases']}
      buttonText="يلا نتسوق! Let's Shop!"
      onStart={() => router.push('/scenario?type=Supermarket' as any)}
    />
  );
}
