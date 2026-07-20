import assert from 'node:assert/strict';
import {
  isEnabledOnboardingDialect,
  resolveOnboardingDialect,
} from '../utils/onboarding-dialect';

for (const dialect of ['msa', 'gulf', 'egyptian'] as const) {
  assert.equal(isEnabledOnboardingDialect(dialect), true);
  assert.equal(resolveOnboardingDialect(dialect), dialect);
}

for (const unsupported of ['maghrebi', '', 'MSA', 'unknown', null, undefined]) {
  assert.equal(isEnabledOnboardingDialect(unsupported), false);
  assert.equal(resolveOnboardingDialect(unsupported), 'gulf');
}

console.log('Onboarding dialect tests passed.');
