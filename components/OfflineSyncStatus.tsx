import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { getOfflineProgressStatus, subscribeOfflineProgress } from '../utils/offline-progress';

export default function OfflineSyncStatus() {
  const [status, setStatus] = useState(getOfflineProgressStatus);

  useEffect(() => subscribeOfflineProgress(() => setStatus(getOfflineProgressStatus())), []);
  if (status.pendingCount === 0 && !status.syncing) return null;

  return (
    <View style={styles.banner} pointerEvents="none">
      <Text style={styles.text}>
        {status.syncing ? 'Syncing saved progress...' : 'Saved offline. Will sync when connected.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    zIndex: 998,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    alignItems: 'center',
  },
  text: { color: theme.colors.textSecondary, fontSize: theme.fontSize.caption },
});
