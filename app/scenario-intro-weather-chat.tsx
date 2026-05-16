import { useRouter } from 'expo-router';
import { useDialect } from '../contexts/DialectContext';
import ScenarioIntroScreen from '../components/ScenarioIntroScreen';

export default function ScenarioIntroWeatherChatPage() {
  const router = useRouter();
  const { content } = useDialect();
  return (
    <ScenarioIntroScreen
      image={content.sceneImages.WeatherChatEntrance ?? require('../assets/images/dubai-weather-chat-entrance.png')}
      badge="☀️ Unit 6 · Lesson 4"
      title="Weather Chat"
      description="Your friend Sadeeq stops you outside — it's 45°C in Dubai and there's a sandstorm coming. Complain about the heat and make plans to stay indoors."
      pills={['☀️ The heat', '🌡️ Temperature', '🌪️ Sandstorm']}
      stats={['🕐 3 mins', '💎 +120 XP', '📝 8 phrases']}
      buttonText="والله حر! So Hot!"
      onStart={() => router.push('/scenario?type=WeatherChat' as any)}
    />
  );
}
