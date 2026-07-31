import { Clipboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { theme } from '../constants/theme';
import { usePremium } from '../contexts/PremiumContext';
import {
  getPremiumDiagnosticSnapshot,
  getSanitizedPremiumDiagnostics,
  PREMIUM_DIAGNOSTICS_ENABLED,
  recordNoLocalPremiumCache,
  subscribePremiumDiagnostics,
} from '../utils/premium-diagnostics';

function valueOrDash(value: string | null | undefined) {
  return value || '-';
}

export default function PremiumDiagnosticsPanel() {
  const {
    isConfigured,
    refreshCustomerInfo,
    restorePurchases,
    isRestoring,
    clearPremiumCustomerInfoCache,
  } = usePremium();
  const [snapshot, setSnapshot] = useState(getPremiumDiagnosticSnapshot);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => subscribePremiumDiagnostics(() => {
    setSnapshot(getPremiumDiagnosticSnapshot());
  }), []);

  if (!PREMIUM_DIAGNOSTICS_ENABLED) return null;

  const rows = [
    ['Premium status', snapshot.premiumStatus],
    ['RevenueCat configured', isConfigured ? 'yes' : 'no'],
    ['RevenueCat app user ID', valueOrDash(snapshot.revenueCatAppUserId)],
    ['Authenticated user present', snapshot.authenticatedUserPresent ? 'yes' : 'no'],
    ['Active entitlements', snapshot.activeEntitlementIds.join(', ') || '-'],
    ['Premium expiration', valueOrDash(snapshot.premiumExpirationDate)],
    ['Product identifier', valueOrDash(snapshot.productIdentifier)],
    ['Latest purchase', valueOrDash(snapshot.latestPurchaseDate)],
    ['CustomerInfo refreshed', valueOrDash(snapshot.customerInfoLastRefreshedAt)],
    ['Last entitlement source', valueOrDash(snapshot.lastEntitlementSource)],
    ['Last Premium transition', valueOrDash(snapshot.lastPremiumStateTransition)],
    ['Last RevenueCat error', valueOrDash(snapshot.lastRevenueCatErrorCode)],
    ['App state', snapshot.appState],
    ['Identity generation', String(snapshot.identityGeneration)],
    ['Latest CustomerInfo operation', snapshot.latestAcceptedCustomerInfoOperationId == null
      ? '-'
      : String(snapshot.latestAcceptedCustomerInfoOperationId)],
    ['Test subscription', snapshot.testSubscriptionState],
  ];

  const copyDiagnostics = () => {
    Clipboard.setString(getSanitizedPremiumDiagnostics());
    setNotice('Sanitized diagnostics copied.');
  };

  const clearLocalPremiumCache = async () => {
    recordNoLocalPremiumCache();
    const cleared = await clearPremiumCustomerInfoCache();
    setNotice(cleared
      ? 'RevenueCat CustomerInfo cache cleared. Premium state was not changed; refresh to fetch it again.'
      : 'RevenueCat CustomerInfo cache could not be cleared. See the sanitized diagnostics.');
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>RevenueCat diagnostics</Text>
      <Text style={styles.caption}>Internal builds only. No keys, receipts, tokens, or emails are recorded.</Text>

      <View style={styles.rows}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} selectable>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => refreshCustomerInfo('profile_diagnostics')}>
          <Text style={styles.buttonText}>Refresh CustomerInfo</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={restorePurchases} disabled={isRestoring}>
          <Text style={styles.buttonText}>{isRestoring ? 'Restoring...' : 'Restore Purchases'}</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={copyDiagnostics}>
          <Text style={styles.buttonText}>Copy sanitized diagnostics</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => clearLocalPremiumCache()}>
          <Text style={styles.buttonText}>Clear local premium cache</Text>
        </Pressable>
      </View>
      {notice && <Text style={styles.notice}>{notice}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: `${theme.colors.accentWarm}66`,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.bgSurface,
  },
  title: { color: theme.colors.accentWarm, fontSize: 15, fontWeight: theme.fontWeight.medium },
  caption: { color: theme.colors.textTertiary, fontSize: 11, lineHeight: 16, marginTop: 4, marginBottom: 12 },
  rows: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  label: { width: 126, color: theme.colors.textSecondary, fontSize: 11, lineHeight: 16 },
  value: { flex: 1, color: theme.colors.textPrimary, fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  button: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: theme.radii.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
    backgroundColor: theme.colors.bgElevated,
  },
  buttonText: { color: theme.colors.textAccent, fontSize: 11, fontWeight: theme.fontWeight.medium },
  notice: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 10 },
});
