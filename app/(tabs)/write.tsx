import { Redirect } from 'expo-router';

export default function WriteTab() {
  return <Redirect href={'/writing' as any} />;
}
