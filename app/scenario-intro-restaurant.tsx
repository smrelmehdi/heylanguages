import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroRestaurantPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.RestaurantEntrance ?? require('../assets/images/dubai-restaurant-entrance.png')}
      badge="🍽️ Unit 2 · Lesson 4"
      title="Restaurant"
      description="You're dining at a traditional Gulf restaurant in Dubai. Order food, ask about the menu, and handle the bill — all in Gulf Arabic."
      pills={['🥘 Ordering', '💬 Small talk', '💳 Paying']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 16 phrases']}
      buttonText="يلا نأكل! Let's Eat!"
      onStart={() => router.push('/scenario?type=Restaurant' as any)}
    />
  );
}
