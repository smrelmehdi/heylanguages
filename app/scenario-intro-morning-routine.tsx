import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroMorningRoutinePage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.MorningRoutine ?? require('../assets/images/cafe-bg.png')}
      badge="🌅 Unit 6 · Lesson 1"
      title="Morning Routine"
      description="It's 7am in Dubai and Umm Yusuf is calling from the kitchen. Chat about breakfast, decide what to drink, and start the day in Gulf Arabic."
      pills={['🌅 Waking up', '🍳 Breakfast', '☕ Morning drinks']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="صباح الخير! Good Morning!"
      onStart={() => router.push('/scenario?type=MorningRoutine' as any)}
    />
  );
}
