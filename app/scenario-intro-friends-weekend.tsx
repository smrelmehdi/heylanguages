import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFriendsWeekendPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FriendsWeekend ?? require('../assets/images/cairo-cafe-entrance.png')}
      badge="🏖️ Unit 10 · Lesson 4"
      title="Weekend Plans"
      description="The weekend is here! Plan a beach trip and barbecue with your friend in Gulf Arabic."
      pills={['📅 Making plans', '🏖️ Beach vocab', '🔥 Barbecue']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="شنو مسوي الويكند؟ — What are you doing this weekend?"
      onStart={() => router.push('/scenario?type=FriendsWeekend' as any)}
    />
  );
}
