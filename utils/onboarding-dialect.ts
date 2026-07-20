export const ONBOARDING_DIALECTS = ['msa', 'gulf', 'egyptian'] as const;

export type OnboardingDialect = typeof ONBOARDING_DIALECTS[number];

const ONBOARDING_DIALECT_SET = new Set<string>(ONBOARDING_DIALECTS);

export function isEnabledOnboardingDialect(value: unknown): value is OnboardingDialect {
  return typeof value === 'string' && ONBOARDING_DIALECT_SET.has(value);
}

export function resolveOnboardingDialect(value: unknown): OnboardingDialect {
  return isEnabledOnboardingDialect(value) ? value : 'gulf';
}
