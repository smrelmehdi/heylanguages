import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroTaxiPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.TaxiEntrance ?? require('../assets/images/dubai-taxi-street.png')}
      badge="🚕 Unit 2 · Lesson 2"
      title="Taxi Ride"
      description="You're hailing an RTA taxi on Sheikh Zayed Road. Tell the driver where to go, ask the fare, and chat in real Gulf Arabic."
      pills={['🗺️ Directions', '💬 Small talk', '💳 Paying']}
      stats={['🕐 4 mins', '💎 +120 XP', '📝 24 phrases']}
      buttonText="يلا نركب! Let's Ride!"
      onStart={() => router.push('/scenario?type=Taxi' as any)}
    />
  );
}
