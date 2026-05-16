import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFriendsBirthdayPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FriendsBirthdayEntrance ?? require('../assets/images/dubai-friends-birthday-entrance.png')}
      badge="🎂 Unit 10 · Lesson 7"
      title="Birthday Party"
      description="It's your friend's birthday! Wish them well, give a gift, and celebrate together in Gulf Arabic."
      pills={['🎂 Birthday wishes', '🎁 Gift giving', '🎉 Celebrations']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="كل عام وانت بخير — Happy birthday!"
      onStart={() => router.push('/scenario?type=FriendsBirthday' as any)}
    />
  );
}
