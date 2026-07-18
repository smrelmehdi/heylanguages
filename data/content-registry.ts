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
} from './msa-dialogues';
import { BASIC_WORDS_MSA, GREETINGS_WORDS_MSA, INTRO_WORDS_MSA } from './msa-words';

export type { DialogueTurn };

export interface DialectContent {
  voiceId: string;
  lessons: {
    basic: Word[];
    greetings: Word[];
    intro: Word[];
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
  Taxi:            require('../assets/images/dubai-taxi-interior.png'),
  Hotel:           require('../assets/images/dubai-hotel-reception.png'),
  Restaurant:      require('../assets/images/dubai-restaurant-interior.png'),
  Supermarket:     require('../assets/images/dubai-supermarket-interior.png'),
  Pharmacy:        require('../assets/images/dubai-pharmacy-interior.png'),
  Barbershop:      require('../assets/images/dubai-barbershop-interior.png'),
  Airport:         require('../assets/images/dubai-airport-interior.png'),
  // Unit 6 — interior + entrance image pairs
  MorningRoutine:          require('../assets/images/dubai-morning-routine-interior.png'),
  MorningRoutineEntrance:  require('../assets/images/dubai-morning-routine-entrance.png'),
  AtGym:                   require('../assets/images/dubai-gym-interior.png'),
  AtGymEntrance:           require('../assets/images/dubai-gym-entrance.png'),
  CookingHome:             require('../assets/images/dubai-cooking-home-interior.png'),
  CookingHomeEntrance:     require('../assets/images/dubai-cooking-home-entrance.png'),
  WeatherChat:             require('../assets/images/dubai-weather-chat-interior.png'),
  WeatherChatEntrance:     require('../assets/images/dubai-weather-chat-entrance.png'),
  DoctorVisit:             require('../assets/images/dubai-doctor-visit-interior.png'),
  DoctorVisitEntrance:     require('../assets/images/dubai-doctor-visit-entrance.png'),
  AtBank:                  require('../assets/images/dubai-bank-interior.png'),
  AtBankEntrance:          require('../assets/images/dubai-bank-entrance.png'),
  FridayGathering:         require('../assets/images/dubai-friday-gathering-interior.png'),
  FridayGatheringEntrance: require('../assets/images/dubai-friday-gathering-entrance.png'),
  NeighborVisit:           require('../assets/images/dubai-neighbor-visit-interior.png'),
  NeighborVisitEntrance:   require('../assets/images/dubai-neighbor-visit-entrance.png'),
  // Unit 8 — interior + entrance image pairs
  LostInCity:                require('../assets/images/dubai-lost-in-city-interior.png'),
  LostInCityEntrance:        require('../assets/images/dubai-lost-in-city-entrance.png'),
  CarBreakdown:              require('../assets/images/dubai-car-breakdown-interior.png'),
  CarBreakdownEntrance:      require('../assets/images/dubai-car-breakdown-entrance.png'),
  PoliceStation:             require('../assets/images/dubai-police-station-interior.png'),
  PoliceStationEntrance:     require('../assets/images/dubai-police-station-entrance.png'),
  HospitalEmergency:         require('../assets/images/dubai-hospital-emergency-interior.png'),
  HospitalEmergencyEntrance: require('../assets/images/dubai-hospital-emergency-entrance.png'),
  LostWallet:                require('../assets/images/dubai-lost-wallet-interior.png'),
  LostWalletEntrance:        require('../assets/images/dubai-lost-wallet-entrance.png'),
  FlightProblem:             require('../assets/images/dubai-flight-problem-interior.png'),
  FlightProblemEntrance:     require('../assets/images/dubai-flight-problem-entrance.png'),
  AskingForHelp:             require('../assets/images/dubai-asking-for-help-interior.png'),
  AskingForHelpEntrance:     require('../assets/images/dubai-asking-for-help-entrance.png'),
  // Unit 10 — interior + entrance image pairs
  FriendsNewNeighbor:         require('../assets/images/dubai-friends-new-neighbor-interior.png'),
  FriendsNewNeighborEntrance: require('../assets/images/dubai-friends-new-neighbor-entrance.png'),
  FriendsFootball:            require('../assets/images/dubai-friends-football-interior.png'),
  FriendsFootballEntrance:    require('../assets/images/dubai-friends-football-entrance.png'),
  FriendsGaming:              require('../assets/images/dubai-friends-gaming-interior.png'),
  FriendsGamingEntrance:      require('../assets/images/dubai-friends-gaming-entrance.png'),
  FriendsWeekend:             require('../assets/images/dubai-friends-weekend-interior.png'),
  FriendsWeekendEntrance:     require('../assets/images/dubai-friends-weekend-entrance.png'),
  FriendsSocialMedia:         require('../assets/images/dubai-friends-social-media-interior.png'),
  FriendsSocialMediaEntrance: require('../assets/images/dubai-friends-social-media-entrance.png'),
  FriendsRoadTrip:            require('../assets/images/dubai-friends-road-trip-interior.png'),
  FriendsRoadTripEntrance:    require('../assets/images/dubai-friends-road-trip-entrance.png'),
  FriendsBirthday:            require('../assets/images/dubai-friends-birthday-interior.png'),
  FriendsBirthdayEntrance:    require('../assets/images/dubai-friends-birthday-entrance.png'),
  FriendsFarewell:            require('../assets/images/dubai-friends-farewell-interior.png'),
  FriendsFarewellEntrance:    require('../assets/images/dubai-friends-farewell-entrance.png'),
};

const MSA_SCENE_IMAGES = GULF_SCENE_IMAGES; // reuse Dubai images for MSA

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
  },
  sceneImages: MSA_SCENE_IMAGES,
  availableLessons: ['basic', 'greetings', 'intro'],
  availableScenarios: ['Cafe', 'Taxi', 'Hotel', 'Restaurant', 'Supermarket', 'Pharmacy', 'Barbershop', 'Airport'],
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
    },
    sceneImages: {
      // ── Cairo (real images) ───────────────────────────────────────────────
      Cafe:               require('../assets/images/cairo-cafe-interior.png'),
      CafeEntrance:       require('../assets/images/cairo-cafe-entrance.png'),
      Taxi:               require('../assets/images/cairo-taxi-interior.png'),
      TaxiEntrance:       require('../assets/images/cairo-taxi-entrance.png'),
      Hotel:              require('../assets/images/cairo-hotel-interior.png'),
      HotelEntrance:      require('../assets/images/cairo-hotel-entrance.png'),
      // ── Cairo (real images) ───────────────────────────────────────────────
      Restaurant:         require('../assets/images/cairo-restaurant-interior.png'),
      RestaurantEntrance: require('../assets/images/cairo-restaurant-entrance.png'),
      Supermarket:        require('../assets/images/cairo-supermarket-interior.png'),
      SupermarketEntrance: require('../assets/images/cairo-supermarket-entrance.png'),
      // ── Dubai placeholders — TODO: swap with cairo-* images when available ─
      Pharmacy:           require('../assets/images/dubai-pharmacy-interior.png'),
      PharmacyEntrance:   require('../assets/images/dubai-pharmacy-entrance.png'),
      Barbershop:         require('../assets/images/dubai-barbershop-interior.png'),
      BarbershopEntrance: require('../assets/images/dubai-barbershop-entrance.png'),
      Airport:            require('../assets/images/dubai-airport-interior.png'),
      AirportEntrance:    require('../assets/images/dubai-airport-entrance.png'),
      // Unit 6 reuses only confirmed Cairo assets. Missing Cairo scenes stay unset.
      EgyptianCafeOrder:          require('../assets/images/cairo-cafe-interior.png'),
      EgyptianRestaurantOrder:    require('../assets/images/cairo-restaurant-interior.png'),
      EgyptianEverydaySupermarket: require('../assets/images/cairo-supermarket-interior.png'),
      EgyptianEverydayTaxi:       require('../assets/images/cairo-taxi-interior.png'),
      EgyptianEverydayHotel:      require('../assets/images/cairo-hotel-interior.png'),
    },
    availableLessons: [
      'basic', 'greetings', 'intro',
      'numbers-1-5', 'numbers-6-10', 'numbers-11-20', 'numbers-tens', 'numbers-100-1000',
      'numbers-phone', 'numbers-prices', 'numbers-time', 'numbers-age', 'numbers-together',
      'grammar-pronouns', 'grammar-this-that', 'grammar-possessives', 'grammar-questions',
      'grammar-negation', 'grammar-present', 'grammar-past', 'grammar-future',
      'grammar-adjectives', 'grammar-prepositions', 'grammar-sentences',
      ...EGYPTIAN_UNIT7_LESSONS.map(item => item.contentId),
    ],
    availableScenarios: [
      'Cafe', 'Taxi', 'Hotel', 'Restaurant', 'Supermarket', 'Pharmacy', 'Barbershop', 'Airport',
      ...EGYPTIAN_UNIT6_SCENARIOS.map(item => item.scenarioName),
    ],
  },
};

export function getDialectContent(dialect: string): DialectContent {
  return CONTENT_REGISTRY[dialect] ?? COMING_SOON_CONTENT;
}
