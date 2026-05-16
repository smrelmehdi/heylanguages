import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroNeighborVisitPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.NeighborVisitEntrance ?? require('../assets/images/dubai-neighbor-visit-entrance.png')}
      badge="🏠 Unit 6 · Lesson 8"
      title="Neighbour Visit"
      description="Your neighbour Khalid invites you in for Arabic coffee. Choose qahwa or tea, request it with hail (cardamom), and exchange warm Gulf pleasantries."
      pills={['🏠 Welcome', '☕ Arabic coffee', '💬 Pleasantries']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="تفضل ادخل! Come In!"
      onStart={() => router.push('/scenario?type=NeighborVisit' as any)}
    />
  );
}
