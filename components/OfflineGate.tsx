import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { WifiOff } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { useConnectivity } from '../contexts/ConnectivityContext';

export default function OfflineGate() {
  const router = useRouter();
  const { shouldBlockOfflineFree, refreshConnection, offlineBlockReason } = useConnectivity();

  if (!shouldBlockOfflineFree) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <LinearGradient
        colors={['rgba(12, 13, 18, 0.96)', 'rgba(24, 27, 37, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.iconWrap}>
          <WifiOff color={theme.colors.textPrimary} size={30} />
        </View>
        <Text style={styles.title}>{offlineBlockReason === 'pack-required' ? 'This dialect is not ready offline yet' : 'Internet required on free plan'}</Text>
        <Text style={styles.subtitle}>
          {offlineBlockReason === 'pack-required'
            ? 'Reconnect once to prepare this dialect pack, then you can use it offline with premium.'
            : 'Reconnect to continue learning, or upgrade for offline dialect packs.'}
        </Text>

        <Pressable style={styles.primaryButton} onPress={() => refreshConnection().catch(() => {})}>
          <Text style={styles.primaryButtonText}>Retry connection</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/profile' as any)}>
          <Text style={styles.secondaryButtonText}>Learn about Premium</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: theme.colors.bgBase,
    fontSize: 16,
    fontWeight: theme.fontWeight.medium,
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: theme.fontWeight.medium,
  },
});
