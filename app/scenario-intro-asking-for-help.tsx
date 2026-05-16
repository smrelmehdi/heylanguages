import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroAskingForHelpPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.AskingForHelpEntrance ?? require('../assets/images/dubai-asking-for-help-entrance.png')}
      badge="🙏 Unit 8 · Lesson 8"
      title="Asking Strangers for Help"
      description="Your phone battery died and you urgently need to make a call. Ask a kind stranger to borrow their phone in Gulf Arabic."
      pills={['🙏 Asking for favours', '📞 Borrowing a phone', '🤝 Thanking strangers']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="ممكن تساعدني — Can you help me?"
      onStart={() => router.push('/scenario?type=AskingForHelp' as any)}
    />
  );
}
