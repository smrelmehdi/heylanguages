import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFriendsGamingPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FriendsGamingEntrance ?? require('../assets/images/dubai-friends-gaming-entrance.png')}
      badge="🎮 Unit 10 · Lesson 3"
      title="Gaming Night"
      description="It's gaming night! Coordinate with your crew to get online for a squad session in Gulf Arabic."
      pills={['🎮 Gaming vocab', '🕹️ Online play', '👥 Squad chat']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="أنا جاهز — I'm ready!"
      onStart={() => router.push('/scenario?type=FriendsGaming' as any)}
    />
  );
}
