import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroBankPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.AtBank ?? require('../assets/images/dubai-hotel-reception.png')}
      badge="🏦 Unit 6 · Lesson 6"
      title="At the Bank"
      description="You need to open a new account at Emirates NBD. The bank employee walks you through the process — passport, address, timeline, all in Gulf Arabic."
      pills={['📋 Opening account', '🪪 Documents', '🗓️ Timeline']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="أبي أفتح حساب! Open Account!"
      onStart={() => router.push('/scenario?type=AtBank' as any)}
    />
  );
}
