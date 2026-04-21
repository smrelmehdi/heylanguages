import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroLostInCityPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.LostInCity ?? require('../assets/images/dubai-taxi-street.png')}
      badge="🗺️ Unit 8 · Lesson 1"
      title="Lost in the City"
      description="You're in Dubai and can't find your way to Dubai Mall. Stop a passerby and ask for directions in Gulf Arabic."
      pills={['🗺️ Getting lost', '🚶 Asking directions', '📍 Using a map']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="لو سمحت — Excuse me!"
      onStart={() => router.push('/scenario?type=LostInCity' as any)}
    />
  );
}
