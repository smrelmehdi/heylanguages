import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFlightProblemPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FlightProblem ?? require('../assets/images/dubai-airport-interior.png')}
      badge="✈️ Unit 8 · Lesson 7"
      title="Flight Problem"
      description="Your flight is delayed and you'll miss your connection. Talk to the airline staff and get rebooked in Gulf Arabic."
      pills={['✈️ Flight vocab', '🎫 Rebooking', '⏰ Delays & connections']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 9 phrases']}
      buttonText="رحلتي تأخرت — My flight is delayed!"
      onStart={() => router.push('/scenario?type=FlightProblem' as any)}
    />
  );
}
