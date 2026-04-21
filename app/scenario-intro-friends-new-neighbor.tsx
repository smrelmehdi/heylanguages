import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFriendsNewNeighborPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FriendsNewNeighbor ?? require('../assets/images/dubai-hotel-reception.png')}
      badge="🏠 Unit 10 · Lesson 1"
      title="New Neighbor"
      description="A new neighbor just moved in next door. Introduce yourself and make them feel welcome in Gulf Arabic."
      pills={['🏠 Introductions', '🤝 Making friends', '🗺️ Local area']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="هلا والله — Hey, welcome!"
      onStart={() => router.push('/scenario?type=FriendsNewNeighbor' as any)}
    />
  );
}
