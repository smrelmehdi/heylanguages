import { Crown, Lock, X } from 'lucide-react-native';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LEGAL_URLS } from '../constants/legal';
import { theme } from '../constants/theme';
import type { PremiumAvailabilityStatus } from '../contexts/PremiumContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  contentLabel: string;
  /** If true, only show the premium option (no ad unlock available) */
  premiumOnly?: boolean;
  price?: string | null;
  isPurchasing?: boolean;
  isRestoring?: boolean;
  isPremiumAvailable?: boolean;
  availabilityStatus?: PremiumAvailabilityStatus;
  error?: string | null;
  onPurchase?: () => void;
  onRestore?: () => void;
  onRefresh?: () => void;
};

export default function PaywallModal({
  visible,
  onClose,
  contentLabel,
  premiumOnly = false,
  price,
  isPurchasing = false,
  isRestoring = false,
  isPremiumAvailable = false,
  availabilityStatus = 'initializing',
  error,
  onPurchase,
  onRestore,
  onRefresh,
}: Props) {
  const purchaseLabel = price ? `Start Premium - ${price} / month` : 'Start Premium';
  const isBusy = isPurchasing || isRestoring;
  const unavailableText =
    availabilityStatus === 'initializing' ? 'Loading Premium...' :
    availabilityStatus === 'missing_api_key' || availabilityStatus === 'invalid_api_key' ||
    availabilityStatus === 'native_module_missing' || availabilityStatus === 'unsupported_platform'
      ? 'Premium purchases are unavailable in this build.'
      : availabilityStatus === 'missing_default_offering'
        ? 'Premium is not available in the store right now.'
        : availabilityStatus === 'missing_monthly_product'
          ? 'Monthly Premium is not available in the store right now.'
          : availabilityStatus === 'store_unavailable'
            ? 'The store is temporarily unavailable. Please try again later.'
            : 'Premium unavailable, try again later.';

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={isBusy ? () => {} : onClose}>
      <Pressable style={styles.backdrop} onPress={isBusy ? undefined : onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Pressable
            style={[styles.closeBtn, isBusy && styles.buttonDisabled]}
            onPress={onClose}
            disabled={isBusy}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close Premium"
          >
            <X color={theme.colors.textTertiary} size={18} />
          </Pressable>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.handle} />

            <View style={styles.iconWell}>
              <Lock color={theme.colors.accentPrimary} size={28} />
            </View>

            <Text style={styles.title}>Unlock "{contentLabel}"</Text>
            <Text style={styles.subtitle}>
              {premiumOnly
                ? 'This lesson is available with a Premium membership.'
                : 'Premium unlocks all lessons, offline packs, and premium practice.'}
            </Text>

            <View style={[styles.option, styles.optionPremium]}>
              <View style={[styles.optionIconWell, styles.optionIconWellPremium]}>
                <Crown color="#F59E0B" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitlePremium}>HeyYusuf Premium</Text>
                <Text style={styles.optionMeta}>
                  Unlock every lesson, offline packs, and premium practice.
                </Text>
              </View>
            </View>

            {error && <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>}

            {isPremiumAvailable ? (
              <Pressable
                style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
                onPress={onPurchase}
                disabled={isBusy}
                accessibilityRole="button"
                accessibilityLabel={purchaseLabel}
              >
                {isPurchasing ? (
                  <ActivityIndicator color={theme.colors.bgBase} />
                ) : (
                  <Text style={styles.primaryButtonText}>{purchaseLabel}</Text>
                )}
              </Pressable>
            ) : (
              <View style={styles.unavailableBox}>
                <Text style={styles.unavailableText}>{unavailableText}</Text>
                {onRefresh && (
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={onRefresh}
                    disabled={isBusy}
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading Premium"
                  >
                    <Text style={styles.secondaryButtonText}>Retry</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Text style={styles.renewalText}>
              Renews automatically each month until canceled. Manage or cancel through your store account.
            </Text>

            <Pressable
              style={styles.restoreButton}
              onPress={onRestore}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel="Restore Purchases"
            >
              <Text style={styles.restoreButtonText}>{isRestoring ? 'Restoring...' : 'Restore Purchases'}</Text>
            </Pressable>

            <View style={styles.legalLinks}>
              <Pressable
                onPress={() => openUrl(LEGAL_URLS.privacy)}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel="Open Privacy Policy"
              >
                <Text style={styles.legalLinkText}>Privacy Policy</Text>
              </Pressable>
              <Text style={styles.legalSeparator}>•</Text>
              <Pressable
                onPress={() => openUrl(LEGAL_URLS.terms)}
                hitSlop={8}
                accessibilityRole="link"
                accessibilityLabel="Open Terms of Use"
              >
                <Text style={styles.legalLinkText}>Terms of Use</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  scroll: { width: '100%' },
  sheetContent: { alignItems: 'center', paddingBottom: 16 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderDefault,
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 2,
  },
  iconWell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.accentPrimary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.bgBase,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionPremium: {
    borderColor: '#F59E0B44',
    backgroundColor: '#F59E0B0A',
  },
  optionIconWell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${theme.colors.accentPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWellPremium: {
    backgroundColor: '#F59E0B18',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  optionTitleDim: {
    color: theme.colors.textTertiary,
  },
  optionTitlePremium: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 2,
  },
  optionMeta: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    lineHeight: 16,
  },
  errorText: {
    width: '100%',
    color: theme.colors.accentDanger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: theme.colors.bgBase,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  unavailableBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  unavailableText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    height: 38,
    minWidth: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: theme.colors.textAccent,
    fontSize: 13,
    fontWeight: '600',
  },
  restoreButton: {
    marginTop: 14,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreButtonText: {
    color: theme.colors.textAccent,
    fontSize: 14,
    fontWeight: '600',
  },
  renewalText: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 6,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  legalLinkText: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: theme.colors.textTertiary,
    fontSize: 12,
  },
  freePill: {
    backgroundColor: `${theme.colors.accentPrimary}20`,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  freePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.accentPrimary,
  },
});
