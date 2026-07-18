import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDialectContentMeta, getDialectProgressionItems, isContentAvailableForDialect, normalizePublicContentId } from './content-resolver';
import { getPreviousProgressionContentId, hasCompletedContent } from './progression';

export type ContentType = 'lesson' | 'scenario' | 'writing' | 'quiz';
export type ContentAccessReason =
  | 'free'
  | 'premium'
  | 'testing'
  | 'previous_incomplete'
  | 'unavailable'
  | 'premium_required';

export type ContentAccessResult = {
  allowed: boolean;
  reason: ContentAccessReason;
  requiredPreviousContentId?: string;
};

export type ContentAccessInput = {
  contentId: string | null | undefined;
  unitId?: string;
  contentType?: ContentType;
  dialect?: string;
  isPremium: boolean;
  isTestingUnlocked?: boolean;
  completedContentIds: Iterable<string>;
};

export type PublicAppEnv = 'development' | 'preview' | 'production';

const TESTING_UNLOCK_OVERRIDE_KEY = 'internal_testing_unlock_all_override';
const VALID_APP_ENVS = new Set<PublicAppEnv>(['development', 'preview', 'production']);
const RAW_APP_ENV = process.env.EXPO_PUBLIC_APP_ENV;
const RAW_TESTING_UNLOCK = process.env.EXPO_PUBLIC_TESTING_UNLOCK_ALL;
const IS_LOCAL_DEV = typeof __DEV__ !== 'undefined' && __DEV__;

export const APP_ENV: PublicAppEnv =
  VALID_APP_ENVS.has(RAW_APP_ENV as PublicAppEnv)
    ? (RAW_APP_ENV as PublicAppEnv)
    : IS_LOCAL_DEV
      ? 'development'
      : 'production';

const ENV_TESTING_UNLOCK_ALL =
  RAW_TESTING_UNLOCK === 'true' && APP_ENV !== 'production';

let runtimeTestingUnlockOverride: boolean | null = null;

export const CAN_USE_INTERNAL_TESTING_ACCESS = APP_ENV !== 'production';

export let TESTING_UNLOCK_ALL = ENV_TESTING_UNLOCK_ALL;

function resolveTestingUnlockAll() {
  if (!CAN_USE_INTERNAL_TESTING_ACCESS) return false;
  return runtimeTestingUnlockOverride ?? ENV_TESTING_UNLOCK_ALL;
}

function applyTestingUnlockValue() {
  TESTING_UNLOCK_ALL = resolveTestingUnlockAll();
  if (TESTING_UNLOCK_ALL) {
    console.warn('[access] Internal testing access is active. Do not use this build for production.');
  }
  return TESTING_UNLOCK_ALL;
}

export async function hydrateTestingUnlockAllOverride() {
  if (!CAN_USE_INTERNAL_TESTING_ACCESS) {
    runtimeTestingUnlockOverride = null;
    TESTING_UNLOCK_ALL = false;
    return false;
  }

  try {
    const stored = await AsyncStorage.getItem(TESTING_UNLOCK_OVERRIDE_KEY);
    runtimeTestingUnlockOverride =
      stored === 'true' ? true :
      stored === 'false' ? false :
      null;
  } catch {
    runtimeTestingUnlockOverride = null;
  }

  return applyTestingUnlockValue();
}

export async function setTestingUnlockAllOverride(enabled: boolean) {
  if (!CAN_USE_INTERNAL_TESTING_ACCESS) {
    runtimeTestingUnlockOverride = null;
    TESTING_UNLOCK_ALL = false;
    return false;
  }

  runtimeTestingUnlockOverride = enabled;
  await AsyncStorage.setItem(TESTING_UNLOCK_OVERRIDE_KEY, enabled ? 'true' : 'false');
  return applyTestingUnlockValue();
}

export function getTestingUnlockAllState() {
  return TESTING_UNLOCK_ALL;
}

const CONTENT_ID_ALIASES: Record<string, string> = {
  'basic-words': 'basic_words',
  basic: 'basic_words',
};

export const SCENARIO_TYPE_TO_CONTENT_ID: Record<string, string> = {
  Cafe: 'cafe',
  Taxi: 'taxi',
  Hotel: 'hotel',
  Restaurant: 'restaurant',
  Supermarket: 'supermarket',
  Pharmacy: 'pharmacy',
  Barbershop: 'barbershop',
  Airport: 'airport',
  MorningRoutine: 'morningroutine',
  AtGym: 'atgym',
  CookingHome: 'cookinghome',
  WeatherChat: 'weatherchat',
  DoctorVisit: 'doctorvisit',
  AtBank: 'atbank',
  FridayGathering: 'fridaygathering',
  NeighborVisit: 'neighborvisit',
  LostInCity: 'lostincity',
  CarBreakdown: 'carbreakdown',
  PoliceStation: 'policestation',
  HospitalEmergency: 'hospitalemergency',
  LostWallet: 'lostwallet',
  FlightProblem: 'flightproblem',
  AskingForHelp: 'askingforhelp',
  FriendsNewNeighbor: 'friendsnewneighbor',
  FriendsFootball: 'friendsfootball',
  FriendsGaming: 'friendsgaming',
  FriendsWeekend: 'friendsweekend',
  FriendsSocialMedia: 'friendssocialmedia',
  FriendsRoadTrip: 'friendsroadtrip',
  FriendsBirthday: 'friendsbirthday',
  FriendsFarewell: 'friendsfarewell',
  EgyptianCafeOrder: 'cafe-order',
  EgyptianRestaurantOrder: 'restaurant-order',
  EgyptianEverydaySupermarket: 'everyday-supermarket',
  EgyptianEverydayTaxi: 'everyday-taxi',
  EgyptianDirections: 'directions',
  EgyptianEverydayPharmacy: 'everyday-pharmacy',
  EgyptianEverydayBarber: 'everyday-barber',
  EgyptianEverydayHotel: 'everyday-hotel',
  EgyptianEverydayAirport: 'everyday-airport',
  EgyptianPhoneCall: 'phone-call',
};

export const WRITING_FAMILY_TO_CONTENT_ID: Record<string, string> = {
  alif: 'alif_family',
  ba: 'ba_family',
  jeem: 'jeem_family',
  dal: 'dal_family',
  ra: 'ra_family',
  seen: 'seen_family',
  sad: 'sad_family',
  taa: 'taa_family',
  ayn: 'ayn_family',
  fa: 'fa_family',
  kaf: 'kaf_family',
  meem: 'meem_family',
  ha: 'ha_family',
  ya: 'ya_family',
};

export function normalizeContentId(contentId: string | null | undefined) {
  return normalizePublicContentId(contentId ? CONTENT_ID_ALIASES[contentId] ?? contentId : contentId);
}

export function getContentAccess({
  contentId,
  unitId,
  contentType,
  dialect = 'gulf',
  isPremium,
  isTestingUnlocked = TESTING_UNLOCK_ALL,
  completedContentIds,
}: ContentAccessInput): ContentAccessResult {
  const normalized = normalizeContentId(contentId);
  const meta = getDialectContentMeta(dialect, normalized, contentType);
  if (!normalized || !meta || meta.availability === 'unavailable' || (unitId && meta.unitId !== unitId)) {
    return { allowed: false, reason: 'unavailable' };
  }

  if (isTestingUnlocked && isContentAvailableForDialect(dialect, normalized, contentType)) {
    return { allowed: true, reason: 'testing' };
  }

  const previousContentId = getPreviousProgressionContentId(dialect, normalized);
  if (previousContentId && !hasCompletedContent(dialect, previousContentId, completedContentIds)) {
    return {
      allowed: false,
      reason: 'previous_incomplete',
      requiredPreviousContentId: previousContentId,
    };
  }

  if (meta.commercialAccess === 'free') return { allowed: true, reason: 'free' };
  if (isPremium) return { allowed: true, reason: 'premium' };
  return { allowed: false, reason: 'premium_required' };
}

export function getLessonContentId(type: string | undefined) {
  if (!type) return null;
  const normalized = normalizeContentId(type);
  return normalized;
}

export function getScenarioContentId(type: string | undefined) {
  if (!type) return null;
  return SCENARIO_TYPE_TO_CONTENT_ID[type] ?? null;
}

export function getWritingContentId(family: string | undefined) {
  const normalizedFamily = family ?? 'ba';
  return WRITING_FAMILY_TO_CONTENT_ID[normalizedFamily] ?? null;
}

export function getDialectKnownContentIds(dialect: string) {
  return new Set(getDialectProgressionItems(dialect).map(item => item.contentId));
}

export function getQuizContentId(unit: string | undefined) {
  if (!unit) return 'quiz_u1';
  if (unit === '2p1') return 'quiz_u2_p1';
  if (unit === '2p2') return 'quiz_u2_p2';
  if (/^\d+$/.test(unit)) return `quiz_u${unit}`;
  return null;
}
