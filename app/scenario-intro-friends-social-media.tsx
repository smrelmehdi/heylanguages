import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroFriendsSocialMediaPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.FriendsSocialMediaEntrance ?? require('../assets/images/dubai-friends-social-media-entrance.png')}
      badge="📱 Unit 10 · Lesson 5"
      title="Social Media"
      description="Your friend just posted amazing ski trip photos. React, exchange usernames and follow each other in Gulf Arabic."
      pills={['📸 Social media vocab', '📱 Following & likes', '🎿 Travel talk']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="شفت البوست؟ — Did you see the post?"
      onStart={() => router.push('/scenario?type=FriendsSocialMedia' as any)}
    />
  );
}
