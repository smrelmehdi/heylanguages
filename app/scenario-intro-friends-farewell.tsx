import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFriendsFarewellPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FriendsFarewellEntrance ?? require('../assets/images/dubai-friends-farewell-entrance.png')}
      badge="👋 Unit 10 · Lesson 8"
      title="Saying Goodbye"
      description="Your close friend is moving to Saudi Arabia for work. Say a heartfelt goodbye and promise to stay in touch in Gulf Arabic."
      pills={['👋 Farewells', '✈️ Moving away', '💌 Staying in touch']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 10 phrases']}
      buttonText="الله يوفقك — God grant you success"
      onStart={() => router.push('/scenario?type=FriendsFarewell' as any)}
    />
  );
}
