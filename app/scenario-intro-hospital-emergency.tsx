import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroHospitalEmergencyPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.HospitalEmergency ?? require('../assets/images/dubai-pharmacy-interior.png')}
      badge="🏥 Unit 8 · Lesson 4"
      title="Hospital Emergency"
      description="Your friend fell and can't walk. Rush to the hospital and explain the situation to the nurse in Gulf Arabic."
      pills={['🏥 Medical vocab', '⚕️ Describing injuries', '🩺 Emergency talk']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 9 phrases']}
      buttonText="صاحبي بحاجة مساعدة — My friend needs help!"
      onStart={() => router.push('/scenario?type=HospitalEmergency' as any)}
    />
  );
}
