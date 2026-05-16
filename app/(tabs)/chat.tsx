// Chat tab — single source of truth lives at /chat-conversation.
// Tapping the tab bounces straight to the standalone chat screen, which
// is outside (tabs) so the floating tab bar disappears during the session.
import { Redirect } from 'expo-router';

export default function ChatTab() {
  return <Redirect href={'/chat-conversation?mode=free' as any} />;
}
