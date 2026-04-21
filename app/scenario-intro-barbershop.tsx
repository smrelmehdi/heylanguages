import { useRouter } from 'expo-router';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroBarbershopPage() {
  const router = useRouter();
  return (
    <ScenarioIntroScreen
      image={require('../assets/images/dubai-barbershop-entrance.png')}
      badge="✂️ Unit 2 · Lesson 7"
      title="Barbershop"
      description="You're at a traditional barbershop in Dubai. Tell the barber what you want, describe the style, and walk out looking sharp — in Gulf Arabic."
      pills={['✂️ Haircut', '💬 Describing style', '💳 Paying']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 14 phrases']}
      buttonText="يلا نقص! Let's Go!"
      onStart={() => router.push('/scenario?type=Barbershop' as any)}
    />
  );
}
