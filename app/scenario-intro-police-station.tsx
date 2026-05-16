import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroPoliceStationPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.PoliceStationEntrance ?? require('../assets/images/dubai-police-station-entrance.png')}
      badge="👮 Unit 8 · Lesson 3"
      title="At the Police Station"
      description="A car hit you from behind at a traffic light. Go to the police station and file a report in Gulf Arabic."
      pills={['👮 Reporting an accident', '📋 Filing a report', '🚗 Describing damage']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="ابي ابلغ — I want to report!"
      onStart={() => router.push('/scenario?type=PoliceStation' as any)}
    />
  );
}
