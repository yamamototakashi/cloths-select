// Core domain types for Closet Weather.
// Kept in a single file for easy refactoring during MVP.

export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'outer'
  | 'onepiece'
  | 'shoes'
  | 'bag'
  | 'accessory';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
export type Thickness = 'thin' | 'normal' | 'thick';
export type StyleLevel = 'casual' | 'smart' | 'business' | 'formal';
export type WaterproofLevel = 'none' | 'some' | 'strong';

export type ThermalPreference = 'very_cold' | 'cold' | 'normal' | 'hot' | 'very_hot';
export type RainTolerance = 'weak' | 'normal' | 'strong';
export type StylePreference = 'casual' | 'balanced' | 'formal';
export type CommuteMode = 'walk' | 'bike' | 'car' | 'train' | 'mixed' | 'none';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subCategory?: string;
  seasons: Season[];
  thickness: Thickness;
  colors: string[]; // hex values like "#000000"
  styleLevel: StyleLevel;
  waterproofLevel: WaterproofLevel;
  favorite: boolean;
  imageBlob?: Blob; // stored locally in IndexedDB
  notes?: string;
  createdAt: number;
  updatedAt: number;
  archivedAt?: number;
}

export interface LocationSetting {
  mode: 'gps' | 'name' | 'manual';
  latitude?: number;
  longitude?: number;
  name?: string; // e.g. "Tokyo"
  timezone?: string;
}

export interface UserProfile {
  id: 'me'; // single user MVP
  displayName?: string;
  genderStyle?: 'mens' | 'womens' | 'unisex' | 'unspecified';
  ageRange?: '10s' | '20s' | '30s' | '40s' | '50s' | '60s+' | 'unspecified';
  thermalPreference: ThermalPreference;
  rainTolerance: RainTolerance;
  stylePreference: StylePreference;
  commute: boolean;
  commuteMode: CommuteMode;
  commuteMinutes?: number;
  favoriteStyles: string[]; // free-form tags like "casual", "minimal"
  location: LocationSetting;
  temperatureUnit: 'c' | 'f';
  avoidRecentlyWornDays: number; // e.g. 2
  setupCompleted: boolean;
}

export interface WeatherSnapshot {
  fetchedAt: number;
  locationName: string;
  latitude?: number;
  longitude?: number;
  currentTempC: number;
  apparentTempC: number;
  maxTempC: number;
  minTempC: number;
  precipitationProbability: number; // 0..100
  precipitationMm: number;
  windSpeedMs: number;
  weatherCode: number;
  weatherLabel: string;
  hourly?: Array<{
    hour: number;
    tempC: number;
    precipitationMm: number;
    precipitationProbability: number;
  }>;
  source: 'open-meteo' | 'manual' | 'cache';
}

export interface WearLog {
  id: string;
  date: string; // YYYY-MM-DD
  itemIds: string[];
  note?: string;
  createdAt: number;
}

export interface OutfitPiece {
  slot: 'tops' | 'bottoms' | 'outer' | 'onepiece' | 'shoes' | 'accessory';
  itemId?: string; // undefined => suggestion only
  label: string;
  note?: string;
}

export interface OutfitSuggestion {
  id: string;
  kind: 'today' | 'warmer' | 'lighter' | 'fallback';
  title: string;
  pieces: OutfitPiece[];
  reasons: string[];
  missingCategories: ClothingCategory[];
  score: number;
}

export interface AppSettings {
  lastWeather?: WeatherSnapshot;
  seedInjected?: boolean;
}
