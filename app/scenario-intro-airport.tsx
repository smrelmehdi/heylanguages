import { useRouter } from 'expo-router';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroAirportPage() {
  const router = useRouter();
  return (
    <ScenarioIntroScreen
      image={require('../assets/images/dubai-airport-entrance.png')}
      badge="✈️ Unit 2 · Lesson 8"
      title="Airport"
      description="You're checking in at Dubai International Airport. Handle check-in, answer questions about your luggage, and find your gate — in Gulf Arabic."
      pills={['🎫 Check-in', '🧳 Baggage', '🚪 Boarding']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 14 phrases']}
      buttonText="يلا نسافر! Let's Go!"
      onStart={() => router.push('/scenario?type=Airport' as any)}
    />
  );
}
