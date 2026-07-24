import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import { getDialectContentMeta } from '../utils/content-resolver';
import ScenarioIntroScreen from './ScenarioIntroScreen';

type Props = {
  contentId: string;
};

function unitNumber(unitId: string) {
  return unitId.replace('unit-', '');
}

export default function CurriculumScenarioIntro({ contentId }: Props) {
  const router = useRouter();
  const { content, dialect } = useDialect();
  const item = getDialectContentMeta(dialect, contentId, 'scenario');

  if (!item || !item.scenarioName || item.availability === 'unavailable') {
    return (
      <ScenarioIntroScreen
        badge="Scenario unavailable"
        title="Scenario unavailable"
        description="This scenario is not available for the selected dialect."
        pills={[]}
        stats={[]}
        buttonText="Back to Home"
        onStart={() => router.replace('/(tabs)' as any)}
      />
    );
  }

  const entranceImage = (item.sceneEntranceImageId
    ? content.sceneImages[item.sceneEntranceImageId]
    : undefined)
    ?? (dialect !== 'egyptian' ? content.sceneImages[`${item.scenarioName}Entrance`] : undefined);
  const description = [item.setting, item.objective ?? item.description]
    .filter(Boolean)
    .join('. ')
    || `Practice this situation in ${dialect === 'msa' ? 'Modern Standard Arabic' : 'Gulf Arabic'}.`;

  return (
    <ScenarioIntroScreen
      image={entranceImage}
      badge={`Unit ${unitNumber(item.unitId)} · Scenario`}
      title={item.title}
      description={description}
      pills={['Conversation', 'Listening', 'Speaking']}
      stats={[item.subtitle ?? '3 mins', `${content.scenarios[item.scenarioName]?.length ?? 0} phrases`]}
      buttonText="Start Scenario"
      onStart={() => router.push(`/scenario?type=${encodeURIComponent(item.scenarioName!)}` as any)}
    />
  );
}
