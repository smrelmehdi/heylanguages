import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroPhoneStolenPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.PhoneStolen ?? require('../assets/images/dubai-supermarket-entrance.png')}
      badge="📱 Unit 8 · Lesson 6"
      title="Phone Stolen"
      description="Your phone was pickpocketed at the market. Report it to the police and explain what happened in Gulf Arabic."
      pills={['📱 Theft vocab', '👮 Filing a report', '🔍 Tracking a phone']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="تلفوني انسرق — My phone was stolen!"
      onStart={() => router.push('/scenario?type=PhoneStolen' as any)}
    />
  );
}
