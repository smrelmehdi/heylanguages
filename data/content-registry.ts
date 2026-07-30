import type { Word } from '../constants/words';
import { BASIC_WORDS, GREETINGS_WORDS, INTRO_WORDS } from '../constants/words';
import {
    AIRPORT_DIALOGUE_EG,
    BARBERSHOP_DIALOGUE_EG,
    CAFE_DIALOGUE_EG,
    HOTEL_DIALOGUE_EG,
    PHARMACY_DIALOGUE_EG,
    RESTAURANT_DIALOGUE_EG, SUPERMARKET_DIALOGUE_EG,
    TAXI_DIALOGUE_EG,
} from './egyptian-dialogues';
import { BASIC_WORDS_EG, GREETINGS_WORDS_EG, INTRO_WORDS_EG } from './egyptian-words';
import { EGYPTIAN_UNIT6_SCENARIOS, EGYPTIAN_UNIT6_SCENARIOS_BY_NAME } from './egyptian-unit6';
import { EGYPTIAN_UNIT7_LESSONS } from './egyptian-work';
import { EGYPTIAN_UNIT8_SCENARIOS, EGYPTIAN_UNIT8_SCENARIOS_BY_NAME } from './egyptian-emergencies';
import { EGYPTIAN_UNIT9_LESSONS } from './egyptian-social';
import { EGYPTIAN_UNIT10_SCENARIOS, EGYPTIAN_UNIT10_SCENARIOS_BY_NAME } from './egyptian-friends';
import type { DialogueTurn } from './gulf-dialogues';
import {
    AIRPORT_DIALOGUE,
    ASKING_FOR_HELP_DIALOGUE,
    BANK_DIALOGUE,
    BARBERSHOP_DIALOGUE,
    CAFE_DIALOGUE,
    CAR_BREAKDOWN_DIALOGUE,
    COOKING_HOME_DIALOGUE,
    DOCTOR_VISIT_DIALOGUE,
    FLIGHT_PROBLEM_DIALOGUE,
    FRIDAY_GATHERING_DIALOGUE,
    FRIENDS_BIRTHDAY_DIALOGUE, FRIENDS_FAREWELL_DIALOGUE,
    FRIENDS_FOOTBALL_DIALOGUE, FRIENDS_GAMING_DIALOGUE,
    FRIENDS_NEW_NEIGHBOR_DIALOGUE,
    FRIENDS_ROAD_TRIP_DIALOGUE,
    FRIENDS_SOCIAL_MEDIA_DIALOGUE,
    FRIENDS_WEEKEND_DIALOGUE,
    GYM_DIALOGUE,
    HOSPITAL_EMERGENCY_DIALOGUE,
    HOTEL_DIALOGUE,
    LOST_IN_CITY_DIALOGUE,
    LOST_WALLET_DIALOGUE,
    MORNING_ROUTINE_DIALOGUE,
    NEIGHBOR_VISIT_DIALOGUE,
    PHARMACY_DIALOGUE,
    POLICE_STATION_DIALOGUE,
    RESTAURANT_DIALOGUE, SUPERMARKET_DIALOGUE,
    TAXI_DIALOGUE,
    WEATHER_CHAT_DIALOGUE,
} from './gulf-dialogues';
import {
    AIRPORT_DIALOGUE_MSA,
    BARBERSHOP_DIALOGUE_MSA,
    CAFE_DIALOGUE_MSA,
    HOTEL_DIALOGUE_MSA,
    PHARMACY_DIALOGUE_MSA,
    RESTAURANT_DIALOGUE_MSA,
    SUPERMARKET_DIALOGUE_MSA,
    TAXI_DIALOGUE_MSA,
    DIRECTIONS_DIALOGUE_MSA,
    PHONE_CALL_DIALOGUE_MSA,
} from './msa-dialogues';
import { BASIC_WORDS_MSA, GREETINGS_WORDS_MSA, INTRO_WORDS_MSA } from './msa-words';
import { MSA_UNIT4_LESSONS } from './msa-numbers';
import { MSA_UNIT5_LESSONS } from './msa-grammar';
import { MSA_UNIT6_SCENARIOS, MSA_UNIT6_SCENARIOS_BY_NAME } from './msa-unit6';
import { MSA_UNIT7_LESSONS } from './msa-work';
import { MSA_UNIT8_SCENARIOS, MSA_UNIT8_SCENARIOS_BY_NAME } from './msa-emergencies';
import { MSA_UNIT9_LESSONS } from './msa-social';
import { MSA_UNIT10_SCENARIOS, MSA_UNIT10_SCENARIOS_BY_NAME } from './msa-friends';

export type { DialogueTurn };

export interface DialectContent {
  voiceId: string;
  lessons: {
    basic: Word[];
    greetings: Word[];
    intro: Word[];
    [lessonId: string]: Word[];
  };
  scenarios: Record<string, DialogueTurn[]>;
  sceneImages: Record<string, any>;
  availableLessons: string[];
  availableScenarios: string[];
}

export const DIALECT_LABELS: Record<string, string> = {
  gulf: 'Gulf Arabic',
  egyptian: 'Egyptian Arabic',
  msa: 'Modern Standard',
  maghrebi: 'Maghrebi',
};

const GULF_SCENE_IMAGES: Record<string, any> = {
  Cafe:            require('../assets/images/cafe-bg.png'),
  CafeEntrance:    require('../assets/images/arabic-cafe-entrance.png'),
  Taxi:            require('../assets/images/dubai-taxi-interior.png'),
  TaxiEntrance:    require('../assets/images/dubai-taxi-street.png'),
  Hotel:           require('../assets/images/dubai-hotel-reception.webp'),
  HotelEntrance:   require('../assets/images/dubai-hotel-entrance.webp'),
  Restaurant:      require('../assets/images/dubai-restaurant-interior.webp'),
  RestaurantEntrance: require('../assets/images/dubai-restaurant-entrance.webp'),
  Supermarket:     require('../assets/images/dubai-supermarket-interior.webp'),
  SupermarketEntrance: require('../assets/images/dubai-supermarket-entrance.webp'),
  Pharmacy:        require('../assets/images/dubai-pharmacy-interior.webp'),
  PharmacyEntrance: require('../assets/images/dubai-pharmacy-entrance.webp'),
  Barbershop:      require('../assets/images/dubai-barbershop-interior.webp'),
  BarbershopEntrance: require('../assets/images/dubai-barbershop-entrance.webp'),
  Airport:         require('../assets/images/dubai-airport-interior.webp'),
  AirportEntrance: require('../assets/images/dubai-airport-entrance.webp'),
  // Unit 6 — interior + entrance image pairs
  MorningRoutine:          require('../assets/images/dubai-morning-routine-interior.webp'),
  MorningRoutineEntrance:  require('../assets/images/dubai-morning-routine-entrance.webp'),
  AtGym:                   require('../assets/images/dubai-gym-interior.webp'),
  AtGymEntrance:           require('../assets/images/dubai-gym-entrance.webp'),
  CookingHome:             require('../assets/images/dubai-cooking-home-interior.webp'),
  CookingHomeEntrance:     require('../assets/images/dubai-cooking-home-entrance.webp'),
  WeatherChat:             require('../assets/images/dubai-weather-chat-interior.png'),
  WeatherChatEntrance:     require('../assets/images/dubai-weather-chat-entrance.png'),
  DoctorVisit:             require('../assets/images/dubai-doctor-visit-interior.png'),
  DoctorVisitEntrance:     require('../assets/images/dubai-doctor-visit-entrance.png'),
  AtBank:                  require('../assets/images/dubai-bank-interior.png'),
  AtBankEntrance:          require('../assets/images/dubai-bank-entrance.png'),
  FridayGathering:         require('../assets/images/dubai-friday-gathering-interior.webp'),
  FridayGatheringEntrance: require('../assets/images/dubai-friday-gathering-entrance.webp'),
  NeighborVisit:           require('../assets/images/dubai-neighbor-visit-interior.png'),
  NeighborVisitEntrance:   require('../assets/images/dubai-neighbor-visit-entrance.png'),
  // Unit 8 — interior + entrance image pairs
  LostInCity:                require('../assets/images/dubai-lost-in-city-interior.webp'),
  LostInCityEntrance:        require('../assets/images/dubai-lost-in-city-entrance.webp'),
  CarBreakdown:              require('../assets/images/dubai-car-breakdown-interior.png'),
  CarBreakdownEntrance:      require('../assets/images/dubai-car-breakdown-entrance.png'),
  PoliceStation:             require('../assets/images/dubai-police-station-interior.webp'),
  PoliceStationEntrance:     require('../assets/images/dubai-police-station-entrance.webp'),
  HospitalEmergency:         require('../assets/images/dubai-hospital-emergency-interior.webp'),
  HospitalEmergencyEntrance: require('../assets/images/dubai-hospital-emergency-entrance.webp'),
  LostWallet:                require('../assets/images/dubai-lost-wallet-interior.webp'),
  LostWalletEntrance:        require('../assets/images/dubai-lost-wallet-entrance.webp'),
  FlightProblem:             require('../assets/images/dubai-flight-problem-interior.webp'),
  FlightProblemEntrance:     require('../assets/images/dubai-flight-problem-entrance.webp'),
  AskingForHelp:             require('../assets/images/dubai-asking-for-help-interior.webp'),
  AskingForHelpEntrance:     require('../assets/images/dubai-asking-for-help-entrance.webp'),
  // Unit 10 — interior + entrance image pairs
  FriendsNewNeighbor:         require('../assets/images/dubai-friends-new-neighbor-interior.webp'),
  FriendsNewNeighborEntrance: require('../assets/images/dubai-friends-new-neighbor-entrance.webp'),
  FriendsFootball:            require('../assets/images/dubai-friends-football-interior.webp'),
  FriendsFootballEntrance:    require('../assets/images/dubai-friends-football-entrance.webp'),
  FriendsGaming:              require('../assets/images/dubai-friends-gaming-interior.webp'),
  FriendsGamingEntrance:      require('../assets/images/dubai-friends-gaming-entrance.webp'),
  FriendsWeekend:             require('../assets/images/dubai-friends-weekend-interior.webp'),
  FriendsWeekendEntrance:     require('../assets/images/dubai-friends-weekend-entrance.webp'),
  FriendsSocialMedia:         require('../assets/images/dubai-friends-social-media-interior.webp'),
  FriendsSocialMediaEntrance: require('../assets/images/dubai-friends-social-media-entrance.webp'),
  FriendsRoadTrip:            require('../assets/images/dubai-friends-road-trip-interior.webp'),
  FriendsRoadTripEntrance:    require('../assets/images/dubai-friends-road-trip-entrance.webp'),
  FriendsBirthday:            require('../assets/images/dubai-friends-birthday-interior.webp'),
  FriendsBirthdayEntrance:    require('../assets/images/dubai-friends-birthday-entrance.webp'),
  FriendsFarewell:            require('../assets/images/dubai-friends-farewell-interior.webp'),
  FriendsFarewellEntrance:    require('../assets/images/dubai-friends-farewell-entrance.webp'),
};

// MSA has no single geographic setting. Only imagery is intentionally shared;
// all text, audio metadata, quizzes, and progression remain MSA-owned.
const MSA_SCENE_IMAGES: Record<string, any> = {
  ...GULF_SCENE_IMAGES,
  // Intentional neutral Gulf-image reuse until dedicated non-geographic MSA art exists.
  Directions: GULF_SCENE_IMAGES.AskingForHelp,
  // Temporary semantic approximation: no phone-call image currently exists.
  PhoneCall: require('../assets/images/dubai-hotel-reception.webp'),
  // Neutral shared technology imagery until dedicated phone-repair artwork exists.
  'phone-repair-interior': GULF_SCENE_IMAGES.FriendsSocialMedia,
  'phone-repair-entrance': GULF_SCENE_IMAGES.FriendsSocialMediaEntrance,
  ...Object.fromEntries([...MSA_UNIT6_SCENARIOS, ...MSA_UNIT8_SCENARIOS, ...MSA_UNIT10_SCENARIOS]
    .map(item => [item.scenarioName,
      item.imageKey === 'phone-repair-interior'
        ? GULF_SCENE_IMAGES.FriendsSocialMedia
        : GULF_SCENE_IMAGES[item.imageKey],
    ])),
  // A generic help scene is less misleading than the lost-wallet scene.
  MsaLostPhone: GULF_SCENE_IMAGES.AskingForHelp,
};

const COMING_SOON_CONTENT: DialectContent = {
  voiceId: 'rUaPbzcZIu8df8iNL9WZ',
  lessons: { basic: [], greetings: [], intro: [] },
  scenarios: {},
  sceneImages: {},
  availableLessons: [],
  availableScenarios: [],
};

const MSA_CONTENT: DialectContent = {
  voiceId: 'xvhpbk8otnNHtT3fjCpr',   // Omar
  lessons: {
    basic: BASIC_WORDS_MSA,
    greetings: GREETINGS_WORDS_MSA,
    intro: INTRO_WORDS_MSA,
    ...Object.fromEntries(MSA_UNIT4_LESSONS.map(([id, , words]) => [id, words])),
    ...Object.fromEntries(MSA_UNIT5_LESSONS.map(([id, , words]) => [id, words])),
    ...Object.fromEntries(MSA_UNIT7_LESSONS.map(item => [item.contentId, item.words])),
    ...Object.fromEntries(MSA_UNIT9_LESSONS.map(item => [item.contentId, item.words])),
  },
  scenarios: {
    Cafe:        CAFE_DIALOGUE_MSA,
    Taxi:        TAXI_DIALOGUE_MSA,
    Hotel:       HOTEL_DIALOGUE_MSA,
    Restaurant:  RESTAURANT_DIALOGUE_MSA,
    Supermarket: SUPERMARKET_DIALOGUE_MSA,
    Pharmacy:    PHARMACY_DIALOGUE_MSA,
    Barbershop:  BARBERSHOP_DIALOGUE_MSA,
    Airport:     AIRPORT_DIALOGUE_MSA,
    Directions:  DIRECTIONS_DIALOGUE_MSA,
    PhoneCall:   PHONE_CALL_DIALOGUE_MSA,
    ...MSA_UNIT6_SCENARIOS_BY_NAME,
    ...MSA_UNIT8_SCENARIOS_BY_NAME,
    ...MSA_UNIT10_SCENARIOS_BY_NAME,
  },
  sceneImages: MSA_SCENE_IMAGES,
  availableLessons: [
    'basic', 'greetings', 'intro',
    ...MSA_UNIT4_LESSONS.map(([id]) => id),
    ...MSA_UNIT5_LESSONS.map(([id]) => id),
    ...MSA_UNIT7_LESSONS.map(item => item.contentId),
    ...MSA_UNIT9_LESSONS.map(item => item.contentId),
  ],
  availableScenarios: [
    'Cafe', 'Taxi', 'Hotel', 'Restaurant', 'Supermarket', 'Pharmacy', 'Barbershop', 'Airport', 'Directions', 'PhoneCall',
    ...MSA_UNIT6_SCENARIOS.map(item => item.scenarioName),
    ...MSA_UNIT8_SCENARIOS.map(item => item.scenarioName),
    ...MSA_UNIT10_SCENARIOS.map(item => item.scenarioName),
  ],
};

const CONTENT_REGISTRY: Record<string, DialectContent> = {
  gulf: {
    voiceId: 'rUaPbzcZIu8df8iNL9WZ',
    lessons: {
      basic: BASIC_WORDS,
      greetings: GREETINGS_WORDS,
      intro: INTRO_WORDS,
    },
    scenarios: {
      Cafe:            CAFE_DIALOGUE,
      Taxi:            TAXI_DIALOGUE,
      Hotel:           HOTEL_DIALOGUE,
      Restaurant:      RESTAURANT_DIALOGUE,
      Supermarket:     SUPERMARKET_DIALOGUE,
      Pharmacy:        PHARMACY_DIALOGUE,
      Barbershop:      BARBERSHOP_DIALOGUE,
      Airport:         AIRPORT_DIALOGUE,
      MorningRoutine:  MORNING_ROUTINE_DIALOGUE,
      AtGym:           GYM_DIALOGUE,
      CookingHome:     COOKING_HOME_DIALOGUE,
      WeatherChat:     WEATHER_CHAT_DIALOGUE,
      DoctorVisit:     DOCTOR_VISIT_DIALOGUE,
      AtBank:          BANK_DIALOGUE,
      FridayGathering: FRIDAY_GATHERING_DIALOGUE,
      NeighborVisit:   NEIGHBOR_VISIT_DIALOGUE,
      LostInCity:        LOST_IN_CITY_DIALOGUE,
      CarBreakdown:      CAR_BREAKDOWN_DIALOGUE,
      PoliceStation:     POLICE_STATION_DIALOGUE,
      HospitalEmergency: HOSPITAL_EMERGENCY_DIALOGUE,
      LostWallet:        LOST_WALLET_DIALOGUE,
      FlightProblem:     FLIGHT_PROBLEM_DIALOGUE,
      AskingForHelp:     ASKING_FOR_HELP_DIALOGUE,
      FriendsNewNeighbor: FRIENDS_NEW_NEIGHBOR_DIALOGUE,
      FriendsFootball:    FRIENDS_FOOTBALL_DIALOGUE,
      FriendsGaming:      FRIENDS_GAMING_DIALOGUE,
      FriendsWeekend:     FRIENDS_WEEKEND_DIALOGUE,
      FriendsSocialMedia: FRIENDS_SOCIAL_MEDIA_DIALOGUE,
      FriendsRoadTrip:    FRIENDS_ROAD_TRIP_DIALOGUE,
      FriendsBirthday:    FRIENDS_BIRTHDAY_DIALOGUE,
      FriendsFarewell:    FRIENDS_FAREWELL_DIALOGUE,
    },
    sceneImages: GULF_SCENE_IMAGES,
    availableLessons: ['basic', 'greetings', 'intro'],
    availableScenarios: [
      'Cafe', 'Taxi', 'Hotel', 'Restaurant', 'Supermarket', 'Pharmacy', 'Barbershop', 'Airport',
      'MorningRoutine', 'AtGym', 'CookingHome', 'WeatherChat', 'DoctorVisit', 'AtBank', 'FridayGathering', 'NeighborVisit',
      'LostInCity', 'CarBreakdown', 'PoliceStation', 'HospitalEmergency',
      'LostWallet', 'FlightProblem', 'AskingForHelp',
      'FriendsNewNeighbor', 'FriendsFootball', 'FriendsGaming', 'FriendsWeekend',
      'FriendsSocialMedia', 'FriendsRoadTrip', 'FriendsBirthday', 'FriendsFarewell',
    ],
  },
  msa: MSA_CONTENT,
  egyptian: {
    voiceId: 'LXrTqFIgiubkrMkwvOUr',
    lessons: { basic: BASIC_WORDS_EG, greetings: GREETINGS_WORDS_EG, intro: INTRO_WORDS_EG },
    scenarios: {
      Cafe:        CAFE_DIALOGUE_EG,
      Taxi:        TAXI_DIALOGUE_EG,
      Hotel:       HOTEL_DIALOGUE_EG,
      Restaurant:  RESTAURANT_DIALOGUE_EG,
      Supermarket: SUPERMARKET_DIALOGUE_EG,
      Pharmacy:    PHARMACY_DIALOGUE_EG,
      Barbershop:  BARBERSHOP_DIALOGUE_EG,
      Airport:     AIRPORT_DIALOGUE_EG,
      ...EGYPTIAN_UNIT6_SCENARIOS_BY_NAME,
      ...EGYPTIAN_UNIT8_SCENARIOS_BY_NAME,
      ...EGYPTIAN_UNIT10_SCENARIOS_BY_NAME,
    },
    sceneImages: {
      'cairo-airport-entrance': require('../assets/images/cairo-airport-entrance.webp'),
      'cairo-airport-interior': require('../assets/images/cairo-airport-interior.webp'),
      'cairo-barbershop-entrance': require('../assets/images/cairo-barbershop-entrance.webp'),
      'cairo-barbershop-interior': require('../assets/images/cairo-barbershop-interior.webp'),
      'cairo-birthday-invitation-entrance': require('../assets/images/cairo-birthday-invitation-entrance.webp'),
      'cairo-birthday-invitation-interior': require('../assets/images/cairo-birthday-invitation-interior.webp'),
      'cairo-birthday-party-entrance': require('../assets/images/cairo-birthday-party-entrance.webp'),
      'cairo-birthday-party-interior': require('../assets/images/cairo-birthday-party-interior.webp'),
      'cairo-cafe-entrance': require('../assets/images/cairo-cafe-entrance.webp'),
      'cairo-cafe-interior': require('../assets/images/cairo-cafe-interior.webp'),
      'cairo-calling-ambulance-entrance': require('../assets/images/cairo-calling-ambulance-entrance.webp'),
      'cairo-calling-ambulance-interior': require('../assets/images/cairo-calling-ambulance-interior.webp'),
      'cairo-car-problem-entrance': require('../assets/images/cairo-car-problem-entrance.webp'),
      'cairo-car-problem-interior': require('../assets/images/cairo-car-problem-interior.webp'),
      'cairo-directions-entrance': require('../assets/images/cairo-directions-entrance.webp'),
      'cairo-directions-interior': require('../assets/images/cairo-directions-interior.webp'),
      'cairo-doctor-appointment-entrance': require('../assets/images/cairo-doctor-appointment-entrance.webp'),
      'cairo-doctor-appointment-interior': require('../assets/images/cairo-doctor-appointment-interior.webp'),
      'cairo-giving-a-gift-entrance': require('../assets/images/cairo-giving-a-gift-entrance.webp'),
      'cairo-giving-a-gift-interior': require('../assets/images/cairo-giving-a-gift-interior.webp'),
      'cairo-hotel-entrance': require('../assets/images/cairo-hotel-entrance.webp'),
      'cairo-hotel-interior': require('../assets/images/cairo-hotel-interior.webp'),
      'cairo-hospital-reception-entrance': require('../assets/images/cairo-hospital-reception-entrance.webp'),
      'cairo-hospital-reception-interior': require('../assets/images/cairo-hospital-reception-interior.webp'),
      'cairo-lost-child-entrance': require('../assets/images/cairo-lost-child-entrance.webp'),
      'cairo-lost-child-interior': require('../assets/images/cairo-lost-child-interior.webp'),
      'cairo-lost-phone-entrance': require('../assets/images/cairo-lost-phone-entrance.webp'),
      'cairo-lost-phone-interior': require('../assets/images/cairo-lost-phone-interior.webp'),
      'cairo-neighbor-visit-entrance': require('../assets/images/cairo-neighbor-visit-entrance.webp'),
      'cairo-neighbor-visit-interior': require('../assets/images/cairo-neighbor-visit-interior.webp'),
      'cairo-pharmacy-entrance': require('../assets/images/cairo-pharmacy-entrance.webp'),
      'cairo-pharmacy-interior': require('../assets/images/cairo-pharmacy-interior.webp'),
      'cairo-phone-call-entrance': require('../assets/images/cairo-phone-call-entrance.webp'),
      'cairo-phone-call-interior': require('../assets/images/cairo-phone-call-interior.webp'),
      'cairo-phone-repair-entrance': require('../assets/images/cairo-phone-repair-entrance.webp'),
      'cairo-phone-repair-interior': require('../assets/images/cairo-phone-repair-interior.webp'),
      'cairo-police-help-entrance': require('../assets/images/cairo-police-help-entrance.webp'),
      'cairo-police-help-interior': require('../assets/images/cairo-police-help-interior.webp'),
      'cairo-restaurant-entrance': require('../assets/images/cairo-restaurant-entrance.webp'),
      'cairo-restaurant-interior': require('../assets/images/cairo-restaurant-interior.webp'),
      'cairo-road-trip-entrance': require('../assets/images/cairo-road-trip-entrance.webp'),
      'cairo-road-trip-interior': require('../assets/images/cairo-road-trip-interior.webp'),
      'cairo-saying-goodbye-entrance': require('../assets/images/cairo-saying-goodbye-entrance.webp'),
      'cairo-saying-goodbye-interior': require('../assets/images/cairo-saying-goodbye-interior.webp'),
      'cairo-staying-in-touch-entrance': require('../assets/images/cairo-staying-in-touch-entrance.webp'),
      'cairo-staying-in-touch-interior': require('../assets/images/cairo-staying-in-touch-interior.webp'),
      'cairo-supermarket-entrance': require('../assets/images/cairo-supermarket-entrance.webp'),
      'cairo-supermarket-interior': require('../assets/images/cairo-supermarket-interior.webp'),
      'cairo-taking-photos-entrance': require('../assets/images/cairo-taking-photos-entrance.webp'),
      'cairo-taking-photos-interior': require('../assets/images/cairo-taking-photos-interior.webp'),
      'cairo-taxi-entrance': require('../assets/images/cairo-taxi-entrance.webp'),
      'cairo-taxi-interior': require('../assets/images/cairo-taxi-interior.webp'),
      'cairo-urgent-help-entrance': require('../assets/images/cairo-urgent-help-entrance.webp'),
      'cairo-urgent-help-interior': require('../assets/images/cairo-urgent-help-interior.webp'),
    },
    availableLessons: [
      'basic', 'greetings', 'intro',
      'numbers-1-5', 'numbers-6-10', 'numbers-11-20', 'numbers-tens', 'numbers-100-1000',
      'numbers-phone', 'numbers-prices', 'numbers-time', 'numbers-age', 'numbers-together',
      'grammar-pronouns', 'grammar-this-that', 'grammar-possessives', 'grammar-questions',
      'grammar-negation', 'grammar-present', 'grammar-past', 'grammar-future',
      'grammar-adjectives', 'grammar-prepositions', 'grammar-sentences',
      ...EGYPTIAN_UNIT7_LESSONS.map(item => item.contentId),
      ...EGYPTIAN_UNIT9_LESSONS.map(item => item.contentId),
    ],
    availableScenarios: [
      'Cafe', 'Taxi', 'Hotel', 'Restaurant', 'Supermarket', 'Pharmacy', 'Barbershop', 'Airport',
      ...EGYPTIAN_UNIT6_SCENARIOS.map(item => item.scenarioName),
      ...EGYPTIAN_UNIT8_SCENARIOS.map(item => item.scenarioName),
      ...EGYPTIAN_UNIT10_SCENARIOS.map(item => item.scenarioName),
    ],
  },
};

export function getDialectContent(dialect: string): DialectContent {
  return CONTENT_REGISTRY[dialect] ?? COMING_SOON_CONTENT;
}
