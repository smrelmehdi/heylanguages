import type { Word } from '../constants/words';
import { BASIC_WORDS, GREETINGS_WORDS, INTRO_WORDS } from '../constants/words';
import type { DialogueTurn } from './gulf-dialogues';
import {
  CAFE_DIALOGUE, TAXI_DIALOGUE, HOTEL_DIALOGUE,
  RESTAURANT_DIALOGUE, SUPERMARKET_DIALOGUE, PHARMACY_DIALOGUE,
  BARBERSHOP_DIALOGUE, AIRPORT_DIALOGUE,
  MORNING_ROUTINE_DIALOGUE, GYM_DIALOGUE, COOKING_HOME_DIALOGUE,
  WEATHER_CHAT_DIALOGUE, DOCTOR_VISIT_DIALOGUE, BANK_DIALOGUE,
  FRIDAY_GATHERING_DIALOGUE, NEIGHBOR_VISIT_DIALOGUE,
  LOST_IN_CITY_DIALOGUE, CAR_BREAKDOWN_DIALOGUE, POLICE_STATION_DIALOGUE,
  HOSPITAL_EMERGENCY_DIALOGUE, LOST_WALLET_DIALOGUE, PHONE_STOLEN_DIALOGUE,
  FLIGHT_PROBLEM_DIALOGUE, ASKING_FOR_HELP_DIALOGUE,
  FRIENDS_NEW_NEIGHBOR_DIALOGUE, FRIENDS_FOOTBALL_DIALOGUE, FRIENDS_GAMING_DIALOGUE,
  FRIENDS_WEEKEND_DIALOGUE, FRIENDS_SOCIAL_MEDIA_DIALOGUE, FRIENDS_ROAD_TRIP_DIALOGUE,
  FRIENDS_BIRTHDAY_DIALOGUE, FRIENDS_FAREWELL_DIALOGUE,
} from './gulf-dialogues';
import {
  CAFE_DIALOGUE_EG, TAXI_DIALOGUE_EG, HOTEL_DIALOGUE_EG,
  RESTAURANT_DIALOGUE_EG, SUPERMARKET_DIALOGUE_EG, PHARMACY_DIALOGUE_EG,
  BARBERSHOP_DIALOGUE_EG, AIRPORT_DIALOGUE_EG,
} from './egyptian-dialogues';
import { BASIC_WORDS_EG, GREETINGS_WORDS_EG, INTRO_WORDS_EG } from './egyptian-words';

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
  levantine: 'Levantine',
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
  // Unit 6 — reuse existing Dubai scene images as placeholders
  MorningRoutine:  require('../assets/images/cafe-bg.png'),
  AtGym:           require('../assets/images/dubai-supermarket-interior.png'),
  CookingHome:     require('../assets/images/dubai-restaurant-interior.png'),
  WeatherChat:     require('../assets/images/dubai-taxi-street.png'),
  DoctorVisit:     require('../assets/images/dubai-pharmacy-interior.png'),
  AtBank:          require('../assets/images/dubai-hotel-reception.png'),
  FridayGathering: require('../assets/images/dubai-restaurant-interior.png'),
  NeighborVisit:   require('../assets/images/cafe-bg.png'),
  // Unit 8 — placeholder images
  LostInCity:        require('../assets/images/dubai-taxi-street.png'),
  CarBreakdown:      require('../assets/images/dubai-taxi-street.png'),
  PoliceStation:     require('../assets/images/dubai-hotel-reception.png'),
  HospitalEmergency: require('../assets/images/dubai-pharmacy-interior.png'),
  LostWallet:        require('../assets/images/dubai-supermarket-interior.png'),
  PhoneStolen:       require('../assets/images/dubai-supermarket-entrance.png'),
  FlightProblem:     require('../assets/images/dubai-airport-interior.png'),
  AskingForHelp:     require('../assets/images/cairo-cafe-entrance.png'),
  // Unit 10 — placeholder images
  FriendsNewNeighbor: require('../assets/images/dubai-hotel-reception.png'),
  FriendsFootball:    require('../assets/images/dubai-restaurant-interior.png'),
  FriendsGaming:      require('../assets/images/dubai-restaurant-interior.png'),
  FriendsWeekend:     require('../assets/images/cairo-cafe-entrance.png'),
  FriendsSocialMedia: require('../assets/images/cairo-cafe-interior.png'),
  FriendsRoadTrip:    require('../assets/images/dubai-taxi-street.png'),
  FriendsBirthday:    require('../assets/images/cairo-restaurant-interior.png'),
  FriendsFarewell:    require('../assets/images/dubai-airport-interior.png'),
};

const COMING_SOON_CONTENT: DialectContent = {
  voiceId: 'rUaPbzcZIu8df8iNL9WZ',
  lessons: { basic: [], greetings: [], intro: [] },
  scenarios: {},
  sceneImages: {},
  availableLessons: [],
  availableScenarios: [],
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
      PhoneStolen:       PHONE_STOLEN_DIALOGUE,
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
      'LostWallet', 'PhoneStolen', 'FlightProblem', 'AskingForHelp',
      'FriendsNewNeighbor', 'FriendsFootball', 'FriendsGaming', 'FriendsWeekend',
      'FriendsSocialMedia', 'FriendsRoadTrip', 'FriendsBirthday', 'FriendsFarewell',
    ],
  },
  egyptian: {
    voiceId: 'VMy40598IGgDeaOE8phq',
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
    },
    availableLessons: ['basic', 'greetings', 'intro'],
    availableScenarios: ['Cafe', 'Taxi', 'Hotel', 'Restaurant', 'Supermarket', 'Pharmacy', 'Barbershop', 'Airport'],
  },
};

export function getDialectContent(dialect: string): DialectContent {
  return CONTENT_REGISTRY[dialect] ?? COMING_SOON_CONTENT;
}
