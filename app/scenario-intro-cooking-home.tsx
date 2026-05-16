import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroCookingHomePage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.CookingHomeEntrance ?? require('../assets/images/dubai-cooking-home-entrance.png')}
      badge="🍳 Unit 6 · Lesson 3"
      title="Cooking at Home"
      description="Your wife (zawja) asks for help in the kitchen. You're making traditional Gulf majboos together — fetch the rice, stir the pot, and chat in Arabic."
      pills={['🍳 Planning', '🍚 Ingredients', '😋 Majboos']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="يلا نطبخ! Let's Cook!"
      onStart={() => router.push('/scenario?type=CookingHome' as any)}
    />
  );
}
