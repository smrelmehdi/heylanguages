import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFriendsFootballPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FriendsFootballEntrance ?? require('../assets/images/dubai-friends-football-entrance.png')}
      badge="⚽ Unit 10 · Lesson 2"
      title="Watching Football"
      description="Al Hilal vs Al Nasr is on tonight! Plan where to watch the game with your friend in Gulf Arabic."
      pills={['⚽ Football vocab', '📺 Game night', '🍕 Snacks & plans']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="يالله نشوفها — Let's watch it!"
      onStart={() => router.push('/scenario?type=FriendsFootball' as any)}
    />
  );
}
