import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFriendsRoadTripPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FriendsRoadTrip ?? require('../assets/images/dubai-taxi-street.png')}
      badge="🚗 Unit 10 · Lesson 6"
      title="Road Trip"
      description="Plan a road trip to Hatta with your crew — destination, who drives, and what to pack in Gulf Arabic."
      pills={['🗺️ Trip planning', '🚗 Driving vocab', '⛺ Outdoor life']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="يالله رحلة برية — Let's do a road trip!"
      onStart={() => router.push('/scenario?type=FriendsRoadTrip' as any)}
    />
  );
}
