import { useLocalSearchParams } from 'expo-router';
import CurriculumScenarioIntro from '../components/CurriculumScenarioIntro';

export default function EgyptianScenarioIntroPage() {
  const { contentId } = useLocalSearchParams<{ contentId?: string }>();
  return <CurriculumScenarioIntro contentId={typeof contentId === 'string' ? contentId : ''} />;
}
