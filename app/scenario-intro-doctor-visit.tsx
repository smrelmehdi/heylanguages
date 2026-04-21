import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroDoctorVisitPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.DoctorVisit ?? require('../assets/images/dubai-pharmacy-interior.png')}
      badge="🏥 Unit 6 · Lesson 5"
      title="Doctor Visit"
      description="You've had a headache and fever since yesterday. Dr. Al-Rashidi sees you at the clinic — describe your symptoms and get a diagnosis in Gulf Arabic."
      pills={['🤒 Symptoms', '🩺 Examination', '💊 Medicine']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="عند الدكتور Let's Go In!"
      onStart={() => router.push('/scenario?type=DoctorVisit' as any)}
    />
  );
}
