import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroHotelPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.HotelEntrance ?? require('../assets/images/dubai-hotel-entrance.png')}
      badge="🏨 Unit 2 · Lesson 3"
      title="Hotel Check-in"
      description="You're arriving at The Grand Al-Yusuf Hotel in Dubai. Check in, get your room key, and ask all the right questions in Gulf Arabic."
      pills={['🛎️ Check-in', '🗺️ Directions', '🍳 Breakfast']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 16 phrases']}
      buttonText="يلا ندخل! Let's Check In!"
      onStart={() => router.push('/scenario?type=Hotel' as any)}
    />
  );
}
