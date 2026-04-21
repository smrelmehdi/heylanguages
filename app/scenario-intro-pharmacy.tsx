import { useRouter } from 'expo-router';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroPharmacyPage() {
  const router = useRouter();
  return (
    <ScenarioIntroScreen
      image={require('../assets/images/dubai-pharmacy-entrance.png')}
      badge="💊 Unit 2 · Lesson 6"
      title="Pharmacy"
      description="You're at a pharmacy in Dubai feeling unwell. Describe your symptoms, get medicine, and understand the instructions — in Gulf Arabic."
      pills={['🤒 Symptoms', '💊 Medicine', '📋 Instructions']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 14 phrases']}
      buttonText="يلا نروح! Let's Go!"
      onStart={() => router.push('/scenario?type=Pharmacy' as any)}
    />
  );
}
