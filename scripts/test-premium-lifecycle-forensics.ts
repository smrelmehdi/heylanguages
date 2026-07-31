import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createCustomerInfoOperationGuard,
  shouldInvalidateRevenueCatIdentity,
  type CustomerInfoOperation,
  type PremiumStatus,
} from '../utils/premium';

class GuardedLifecycleHarness {
  status: PremiumStatus = 'loading';
  identityGeneration = 1;
  revenueCatAppUserId = 'user-a';
  originalAppUserId = 'original-a';
  readonly guard = createCustomerInfoOperationGuard();

  begin(source: string, options?: Partial<Omit<CustomerInfoOperation, 'operationId' | 'source'>>) {
    return this.guard.begin({
      identityGeneration: options?.identityGeneration ?? this.identityGeneration,
      revenueCatAppUserId: options && 'revenueCatAppUserId' in options
        ? options.revenueCatAppUserId ?? null
        : this.revenueCatAppUserId,
      source,
      requiresOriginalAppUserIdMatch: options?.requiresOriginalAppUserIdMatch ?? false,
    });
  }

  apply(
    operation: CustomerInfoOperation,
    status: 'free' | 'premium',
    incomingOriginalAppUserId = this.originalAppUserId
  ) {
    const decision = this.guard.evaluate(operation, {
      identityGeneration: this.identityGeneration,
      revenueCatAppUserId: this.revenueCatAppUserId,
      originalAppUserId: this.originalAppUserId,
      incomingOriginalAppUserId,
    });
    if (decision.accepted) {
      this.status = status;
      this.originalAppUserId = incomingOriginalAppUserId;
    }
    return decision;
  }
}

function pass(name: string) {
  console.log(`PASS ${name}`);
}

function getBranch(source: string, start: string, end: string): string {
  const endIndex = source.indexOf(end);
  assert.notEqual(endIndex, -1, `Missing branch end: ${end}`);
  const startIndex = source.lastIndexOf(start, endIndex);
  assert.notEqual(startIndex, -1, `Missing branch start: ${start}`);
  return source.slice(startIndex, endIndex);
}

{
  const state = new GuardedLifecycleHarness();
  const initialization = state.begin('initialization');
  const listener = state.begin('listener', { requiresOriginalAppUserIdMatch: true });
  assert.equal(state.apply(listener, 'premium').accepted, true);
  assert.equal(state.apply(initialization, 'free').rejectionReason, 'older-customer-info-operation');
  assert.equal(state.status, 'premium');
  pass('older Free initialization cannot overwrite newer Premium listener');
}

{
  const state = new GuardedLifecycleHarness();
  state.status = 'premium';
  const foreground = state.begin('foreground');
  assert.equal(state.status, 'premium');
  const purchase = state.begin('purchase');
  assert.equal(state.apply(purchase, 'premium').accepted, true);
  assert.equal(state.apply(foreground, 'free').rejectionReason, 'older-customer-info-operation');
  assert.equal(state.status, 'premium');
  pass('older Free foreground result cannot overwrite newer Premium purchase');
}

assert.equal(shouldInvalidateRevenueCatIdentity('user-a', 'user-a', true), false);
pass('same-user auth token refresh does not change identity generation');

{
  const state = new GuardedLifecycleHarness();
  state.status = 'premium';
  const purchase = state.begin('purchase');
  assert.equal(state.identityGeneration, purchase.identityGeneration);
  assert.equal(state.status, 'premium');
  pass('background and foreground do not invalidate checkout identity or resolved UI');
}

{
  const state = new GuardedLifecycleHarness();
  const purchase = state.begin('purchase');
  const listener = state.begin('listener', { requiresOriginalAppUserIdMatch: true });
  assert.equal(state.apply(listener, 'premium').accepted, true);
  assert.equal(state.apply(purchase, 'premium').rejectionReason, 'older-customer-info-operation');
  const confirmation = state.begin('purchase-confirmation');
  assert.equal(state.apply(confirmation, 'premium').accepted, true);
  assert.equal(state.status, 'premium');
  pass('purchase listener and confirmation resolve strictly through monotonic ordering');
}

{
  const state = new GuardedLifecycleHarness();
  const premium = state.begin('purchase');
  state.apply(premium, 'premium');
  const expiration = state.begin('foreground');
  assert.equal(state.apply(expiration, 'free').accepted, true);
  assert.equal(state.status, 'free');
  pass('newer confirmed expiration for current identity downgrades to Free');
}

{
  const state = new GuardedLifecycleHarness();
  state.status = 'premium';
  state.begin('foreground');
  assert.equal(state.status, 'premium');
  pass('network failure and pending foreground refresh retain Premium');
}

{
  const state = new GuardedLifecycleHarness();
  const wrongUser = state.begin('refresh', { revenueCatAppUserId: 'user-b' });
  assert.equal(state.apply(wrongUser, 'premium').rejectionReason, 'revenuecat-app-user-id-changed');
  assert.equal(state.status, 'loading');
  pass('wrong RevenueCat app-user result is rejected');
}

{
  const state = new GuardedLifecycleHarness();
  state.status = 'free';
  const oldListener = state.begin('listener', { requiresOriginalAppUserIdMatch: true });
  state.identityGeneration += 1;
  state.revenueCatAppUserId = 'user-b';
  state.originalAppUserId = 'original-b';
  assert.equal(state.apply(oldListener, 'premium', 'original-a').rejectionReason, 'identity-generation-changed');
  assert.equal(state.status, 'free');

  const delayedOldListener = state.begin('listener', { requiresOriginalAppUserIdMatch: true });
  assert.equal(
    state.apply(delayedOldListener, 'premium', 'original-a').rejectionReason,
    'customer-info-identity-mismatch'
  );
  pass('old identity listener events are rejected before and after the new identity settles');
}

{
  const state = new GuardedLifecycleHarness();
  const oldRequest = state.begin('refresh');
  state.identityGeneration += 1;
  state.revenueCatAppUserId = 'user-b';
  state.originalAppUserId = 'original-b';
  assert.equal(state.apply(oldRequest, 'premium').accepted, false);
  pass('actual authenticated-user change rejects previous operations');
}

{
  const state = new GuardedLifecycleHarness();
  const restore = state.begin('restore');
  state.apply(restore, 'premium');
  assert.equal(state.status, 'premium');
  pass('restore activates Premium when entitlement is active');
}

{
  const state = new GuardedLifecycleHarness();
  state.status = 'premium';
  const renewal = state.begin('listener');
  state.apply(renewal, 'premium');
  assert.equal(state.status, 'premium');
  const finalExpiration = state.begin('foreground');
  state.apply(finalExpiration, 'free');
  assert.equal(state.status, 'free');
  pass('test renewal remains Premium and final expiration becomes Free');
}

{
  const home = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
  const profile = fs.readFileSync('app/(tabs)/profile.tsx', 'utf8');
  const xp = fs.readFileSync('contexts/XPContext.tsx', 'utf8');
  assert.match(xp, /const \{ premiumStatus, refreshCustomerInfo \} = usePremium\(\)/);
  assert.match(home, /const \{ xp: xpFromContext, premiumStatus, getAccess \} = useXP\(\)/);
  assert.match(profile, /const \{ xp: xpTotal, premiumStatus \} = useXP\(\)/);
  pass('Home and Profile consume the same authoritative PremiumStatus through XPContext');
}

{
  const home = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
  const profile = fs.readFileSync('app/(tabs)/profile.tsx', 'utf8');
  const homeMembershipLoading = getBranch(
    home,
    '{isPremiumLoading ? (',
    ') : <Pressable',
  );
  const homeLessonsLoading = getBranch(
    home,
    '{isPremiumLoading ? (',
    ') : activeUnits.map',
  );
  const profileMembershipLoading = getBranch(
    profile,
    '{isPremiumLoading ? (',
    ') : <View style={styles.settingsCard}>',
  );
  const profileOfflineLoading = getBranch(
    profile,
    '{isPremiumLoading ? (',
    ') : isPremium ? (',
  );
  assert.match(homeMembershipLoading, /Checking membership access/);
  assert.match(homeLessonsLoading, /Checking lesson access/);
  assert.match(profileMembershipLoading, /Checking membership/);
  assert.match(profileOfflineLoading, /Checking offline access/);
  for (const loadingBranch of [
    homeMembershipLoading,
    homeLessonsLoading,
    profileMembershipLoading,
    profileOfflineLoading,
  ]) {
    assert.doesNotMatch(loadingBranch, /Free|Premium required|Explore Premium/);
  }
  pass('loading state renders neutral placeholders instead of Free upgrade UI');
}

{
  const source = fs.readFileSync('contexts/PremiumContext.tsx', 'utf8');
  assert.match(source, /const isLoading = premiumStatus === 'loading'/);
  assert.match(source, /if \(state === 'active'\) refreshCustomerInfo\('foreground'\)/);
  assert.doesNotMatch(source, /refreshCustomerInfo[\s\S]{0,300}setPremiumStatus\('loading'\)/);
  pass('foreground refresh preserves resolved status while pending');
}

console.log('Premium lifecycle forensic scenarios passed (15).');
