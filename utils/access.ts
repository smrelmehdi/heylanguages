export type AccessResult = 'free' | 'premium' | 'locked';

export const TESTING_UNLOCK_ALL =
  __DEV__ && process.env.EXPO_PUBLIC_TESTING_UNLOCK_ALL === 'true';

export const FREE_CONTENT = new Set([
  // Unit 1
  'basic-words', 'basic_words', 'greetings', 'intro', 'quiz_u1',

  // Unit 2
  'cafe', 'taxi', 'hotel', 'quiz_u2_p1',
  'restaurant', 'supermarket', 'pharmacy', 'quiz_u2_p2',
  'barbershop', 'airport',

  // Unit 3
  'writing',
  'alif_family', 'ba_family', 'jeem_family', 'dal_family', 'ra_family',
  'seen_family', 'sad_family', 'taa_family', 'ayn_family', 'fa_family',
  'kaf_family', 'meem_family', 'ha_family', 'ya_family', 'quiz_u3',

  // Unit 4 preview
  'numbers-1-5', 'numbers-6-10', 'numbers-11-20',

  // Unit 5 preview
  'grammar-pronouns', 'grammar-this-that', 'grammar-possessives',
]);

export const PREMIUM_CONTENT = new Set([
  // Unit 4
  'numbers-tens', 'numbers-age', 'numbers-prices', 'numbers-phone',
  'numbers-hours', 'numbers-minutes', 'numbers-days', 'numbers-months',
  'numbers-dates', 'numbers-ordering', 'numbers-together', 'quiz_u4',

  // Unit 5
  'grammar-present-verbs', 'grammar-past-verbs', 'grammar-want-need',
  'grammar-questions', 'grammar-negation', 'grammar-adjectives',
  'grammar-sentences', 'quiz_u5',

  // Unit 6
  'morningroutine', 'atgym', 'cookinghome', 'weatherchat', 'doctorvisit',
  'atbank', 'fridaygathering', 'neighborvisit', 'quiz_u6',

  // Unit 7
  'work-office', 'work-greetings', 'work-meeting', 'work-phone', 'work-email',
  'work-schedule', 'work-problems', 'work-smalltalk', 'work-salary',
  'work-leaving', 'quiz_u7',

  // Unit 8
  'lostincity', 'carbreakdown', 'policestation', 'hospitalemergency',
  'lostwallet', 'flightproblem', 'askingforhelp', 'quiz_u8',

  // Unit 9
  'social-greetings', 'social-family', 'social-invitations', 'social-ramadan',
  'social-compliments', 'social-emotions', 'social-weddings',
  'social-condolences', 'social-religion', 'social-manners', 'quiz_u9',

  // Unit 10
  'friendsnewneighbor', 'friendsfootball', 'friendsgaming', 'friendsweekend',
  'friendssocialmedia', 'friendsroadtrip', 'friendsbirthday',
  'friendsfarewell', 'quiz_u10',
]);

export const KNOWN_CONTENT = new Set([...FREE_CONTENT, ...PREMIUM_CONTENT]);

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

export function isKnownContent(contentId: string | null | undefined) {
  return Boolean(contentId && KNOWN_CONTENT.has(contentId));
}

export function isContentFree(contentId: string | null | undefined) {
  return Boolean(contentId && FREE_CONTENT.has(contentId));
}

export function canAccessContent(contentId: string | null | undefined, isPremium: boolean) {
  if (!contentId || !isKnownContent(contentId)) return false;
  if (TESTING_UNLOCK_ALL) return true;
  return isPremium || isContentFree(contentId);
}

export function getLessonContentId(type: string | undefined) {
  if (!type) return null;
  return isKnownContent(type) ? type : null;
}

export function getScenarioContentId(type: string | undefined) {
  if (!type) return null;
  return SCENARIO_TYPE_TO_CONTENT_ID[type] ?? null;
}

export function getWritingContentId(family: string | undefined) {
  const normalizedFamily = family ?? 'ba';
  return WRITING_FAMILY_TO_CONTENT_ID[normalizedFamily] ?? null;
}

export function getQuizContentId(unit: string | undefined) {
  if (!unit) return 'quiz_u1';
  if (unit === '2p1') return 'quiz_u2_p1';
  if (unit === '2p2') return 'quiz_u2_p2';
  if (/^\d+$/.test(unit)) return `quiz_u${unit}`;
  return null;
}

export async function checkAccess(contentId: string, isPremium: boolean): Promise<AccessResult> {
  if (!isKnownContent(contentId)) return 'locked';
  if (isContentFree(contentId)) return 'free';
  return isPremium ? 'premium' : 'locked';
}
