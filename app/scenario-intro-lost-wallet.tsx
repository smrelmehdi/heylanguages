import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroLostWalletPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.LostWalletEntrance ?? require('../assets/images/dubai-lost-wallet-entrance.png')}
      badge="👛 Unit 8 · Lesson 5"
      title="Lost Wallet"
      description="You can't find your wallet at the mall. Talk to security and describe it so they can check lost and found."
      pills={['👛 Describing lost items', '🔍 Checking lost & found', '💳 Cards & money vocab']}
      stats={['🕐 5 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="ضيعت محفظتي — I lost my wallet!"
      onStart={() => router.push('/scenario?type=LostWallet' as any)}
    />
  );
}
