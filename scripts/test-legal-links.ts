import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getSupportMailto,
  isSafeExternalDestination,
  isValidSupportEmail,
  LEGAL_CONFIG,
  openExternalDestination,
  openSupport,
} from '../utils/legal';

async function run() {
  assert.equal(isSafeExternalDestination(LEGAL_CONFIG.privacyPolicyUrl), true, 'Privacy Policy URL is configured');
  assert.equal(isSafeExternalDestination(LEGAL_CONFIG.termsOfUseUrl), true, 'Terms URL is configured');
  assert.equal(isSafeExternalDestination(LEGAL_CONFIG.supportUrl), true, 'Support URL is configured');
  assert.equal(isValidSupportEmail(LEGAL_CONFIG.supportEmail), true, 'support email is valid');
  assert.match(getSupportMailto() ?? '', /^mailto:dev@heylanguages\.com\?subject=HeyYusuf%20Support$/);
  assert.equal(isSafeExternalDestination('https://example.com/privacy'), false);
  assert.equal(isSafeExternalDestination('http://heylanguages.com/privacy'), false);
  assert.equal(isSafeExternalDestination('javascript:alert(1)'), false);
  assert.doesNotMatch(JSON.stringify(LEGAL_CONFIG), /(sk_|secret_|service_role|token|password)/i);

  const errors: string[] = [];
  assert.equal(await openExternalDestination('https://example.com', {
    canOpenURL: async () => true,
    openURL: async () => {},
    showError: (title, message) => errors.push(`${title}:${message}`),
  }), 'invalid');
  assert.equal(errors.length, 1, 'invalid destination shows a recoverable error');
  assert.equal(await openExternalDestination(LEGAL_CONFIG.privacyPolicyUrl, {
    canOpenURL: async () => false,
    openURL: async () => { throw new Error('must not open'); },
    showError: (title, message) => errors.push(`${title}:${message}`),
  }), 'unsupported');
  const opened: string[] = [];
  assert.equal(await openSupport({
    canOpenURL: async url => !url.startsWith('mailto:'),
    openURL: async url => { opened.push(url); },
    showError: (title, message) => errors.push(`${title}:${message}`),
  }), 'opened');
  assert.deepEqual(opened, [LEGAL_CONFIG.supportUrl], 'support falls back to the hosted page without an email app');

  const paywall = fs.readFileSync('components/PaywallModal.tsx', 'utf8');
  const profile = fs.readFileSync('app/(tabs)/profile.tsx', 'utf8');
  const login = fs.readFileSync('app/login.tsx', 'utf8');
  assert.match(paywall, /LEGAL_CONFIG\.privacyPolicyUrl/);
  assert.match(paywall, /LEGAL_CONFIG\.termsOfUseUrl/);
  assert.match(paywall, /openSupport/);
  assert.match(profile, /LEGAL_CONFIG\.privacyPolicyUrl/);
  assert.match(profile, /LEGAL_CONFIG\.termsOfUseUrl/);
  assert.match(profile, /openSupport/);
  assert.match(login, /LEGAL_CONFIG\.privacyPolicyUrl/);
  assert.match(login, /LEGAL_CONFIG\.termsOfUseUrl/);
  assert.match(login, /openSupport/);
  assert.match(login, /<ScrollView/);
  assert.match(paywall, /price \? `Start Premium - \$\{price\} \/ month`/);
  assert.doesNotMatch(paywall, /\$\d+(?:\.\d{2})?/);
  assert.doesNotMatch(paywall, /free trial|trial period|try free/i);
  assert.match(paywall, /Renews automatically each month until canceled/i);
  assert.match(paywall, /tied to your store account/i);
  assert.match(profile, /does not cancel an active subscription/i);
  assert.match(profile, /Store purchase records are not erased/i);
  assert.match(paywall, /openExternalDestination/);
  assert.match(profile, /openExternalDestination/);
  assert.match(login, /openExternalDestination/);
  console.log('Legal links and subscription disclosure tests passed (shared destinations, safe opening, UI disclosures).');
}

run().catch(error => { console.error(error); process.exit(1); });
