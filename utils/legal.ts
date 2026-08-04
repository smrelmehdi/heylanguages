export const LEGAL_CONFIG = {
  privacyPolicyUrl: 'https://heylanguages.com/heyyusuf/privacy',
  termsOfUseUrl: 'https://heylanguages.com/heyyusuf/terms',
  supportUrl: 'https://heylanguages.com/heyyusuf/support',
  accountDeletionUrl: 'https://heylanguages.com/heyyusuf/delete-account',
  supportEmail: 'dev@heylanguages.com',
  supportSubject: 'HeyYusuf Support',
} as const;

export function isValidSupportEmail(value: string) {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
}

export function getSupportMailto() {
  if (!isValidSupportEmail(LEGAL_CONFIG.supportEmail)) return null;
  return `mailto:${LEGAL_CONFIG.supportEmail}?subject=${encodeURIComponent(LEGAL_CONFIG.supportSubject)}`;
}

export function isSafeExternalDestination(value: string) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'mailto:') return isValidSupportEmail(decodeURIComponent(parsed.pathname));
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return Boolean(host) && host !== 'example.com' && !host.endsWith('.example.com');
  } catch {
    return false;
  }
}

export type ExternalLinkDependencies = {
  canOpenURL: (url: string) => Promise<boolean>;
  openURL: (url: string) => Promise<unknown>;
  showError: (title: string, message: string) => void;
};

export async function openExternalDestination(value: string, dependencies: ExternalLinkDependencies) {
  if (!isSafeExternalDestination(value)) {
    dependencies.showError('Link unavailable', 'This destination is not configured correctly.');
    return 'invalid' as const;
  }
  try {
    if (!await dependencies.canOpenURL(value)) {
      dependencies.showError('Cannot open link', 'No compatible app is available on this device.');
      return 'unsupported' as const;
    }
    await dependencies.openURL(value);
    return 'opened' as const;
  } catch {
    dependencies.showError('Could not open link', 'Please try again later.');
    return 'failed' as const;
  }
}

export async function openSupport(dependencies: ExternalLinkDependencies) {
  const mailto = getSupportMailto();
  if (mailto) {
    try {
      if (await dependencies.canOpenURL(mailto)) {
        await dependencies.openURL(mailto);
        return 'opened' as const;
      }
    } catch {
      // Fall through to the hosted support page when no usable mail composer exists.
    }
  }
  return openExternalDestination(LEGAL_CONFIG.supportUrl, dependencies);
}
