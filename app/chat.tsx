// Route /chat — redirect to the free-chat conversation screen.
// The home screen "Free Chat with Yusuf" card links here.
import { Redirect } from 'expo-router';

export default function ChatRedirect() {
  return <Redirect href={'/chat-conversation?mode=free' as any} />;
}
