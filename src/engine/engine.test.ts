import { describe, expect, it } from 'vitest';
import { buildSuggestions } from './engine';
import { buildWeatherProfile } from './weatherProfile';
import { getRequiredLayers } from './layers';
import type { ClothingItem, UserProfile, WeatherSnapshot } from '../types';

const baseProfile: UserProfile = {
  id: 'me',
  displayName: 'Test',
  thermalPreference: 'normal',
  rainTolerance: 'normal',
  stylePreference: 'balanced',
  commute: false,
  commuteMode: 'walk',
  favoriteStyles: [],
  location: { mode: 'name', name: 'Tokyo', latitude: 35.68, longitude: 139.69 },
  temperatureUnit: 'c',
  avoidRecentlyWornDays: 2,
  setupCompleted: true,
};

const sampleWeather = (overrides: Partial<WeatherSnapshot> = {}): WeatherSnapshot => ({
  fetchedAt: Date.now(),
  locationName: 'Tokyo',
  latitude: 35.68,
  longitude: 139.69,
  currentTempC: 15,
  apparentTempC: 15,
  maxTempC: 17,
  minTempC: 10,
  precipitationProbability: 10,
  precipitationMm: 0,
  windSpeedMs: 2,
  weatherCode: 1,
  weatherLabel: 'ほぼ晴れ',
  source: 'open-meteo',
  ...overrides,
});

describe('getRequiredLayers', () => {
  it('recommends thick outer when cold', () => {
    const wp = buildWeatherProfile(
      sampleWeather({ apparentTempC: 3, minTempC: 1, maxTempC: 5 }),
      baseProfile,
    );
    const req = getRequiredLayers(wp);
    expect(req.needsOuter).toBe(true);
    expect(req.outerThickness).toBe('thick');
  });

  it('recommends short sleeve when hot', () => {
    const wp = buildWeatherProfile(
      sampleWeather({ apparentTempC: 29, minTempC: 24, maxTempC: 31 }),
      baseProfile,
    );
    const req = getRequiredLayers(wp);
    expect(req.preferShortSleeve).toBe(true);
    expect(req.needsOuter).toBe(false);
  });

  it('flags rain gear when precipitation is likely', () => {
    const wp = buildWeatherProfile(
      sampleWeather({ precipitationProbability: 80, precipitationMm: 4 }),
      baseProfile,
    );
    const req = getRequiredLayers(wp);
    expect(req.needRainGear).toBe(true);
  });
});

describe('buildSuggestions', () => {
  it('returns a fallback suggestion when no clothes registered', () => {
    const suggestions = buildSuggestions({
      weather: sampleWeather(),
      profile: baseProfile,
      items: [],
      wearLogs: [],
    });
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].kind).toBe('fallback');
    expect(suggestions[0].pieces.length).toBeGreaterThan(0);
  });

  it('prefers favorite items when scores are close', () => {
    const plain: ClothingItem = {
      id: 'a',
      name: 'plain tee',
      category: 'tops',
      seasons: ['all'],
      thickness: 'normal',
      colors: ['#ffffff'],
      styleLevel: 'casual',
      waterproofLevel: 'none',
      favorite: false,
      createdAt: 0,
      updatedAt: 0,
    };
    const favorite: ClothingItem = { ...plain, id: 'b', name: 'fav tee', favorite: true };
    const bottoms: ClothingItem = {
      id: 'c',
      name: 'pants',
      category: 'bottoms',
      seasons: ['all'],
      thickness: 'normal',
      colors: ['#000'],
      styleLevel: 'casual',
      waterproofLevel: 'none',
      favorite: false,
      createdAt: 0,
      updatedAt: 0,
    };
    const shoes: ClothingItem = { ...bottoms, id: 'd', category: 'shoes', name: 'sneakers' };

    const suggestions = buildSuggestions({
      weather: sampleWeather({ apparentTempC: 22, maxTempC: 23, minTempC: 19 }),
      profile: baseProfile,
      items: [plain, favorite, bottoms, shoes],
      wearLogs: [],
    });
    const today = suggestions.find((s) => s.kind === 'today');
    expect(today).toBeTruthy();
    const topPiece = today!.pieces.find((p) => p.slot === 'tops');
    expect(topPiece?.label).toBe('fav tee');
  });

  it('picks a waterproof outer on rainy days when available', () => {
    const dryOuter: ClothingItem = {
      id: 'o1',
      name: 'wool coat',
      category: 'outer',
      seasons: ['all'],
      thickness: 'normal',
      colors: ['#000'],
      styleLevel: 'smart',
      waterproofLevel: 'none',
      favorite: false,
      createdAt: 0,
      updatedAt: 0,
    };
    const rainCoat: ClothingItem = {
      ...dryOuter,
      id: 'o2',
      name: 'rain jacket',
      waterproofLevel: 'strong',
    };
    const tops: ClothingItem = { ...dryOuter, id: 't', name: 'shirt', category: 'tops' };
    const bottoms: ClothingItem = { ...dryOuter, id: 'b', name: 'pants', category: 'bottoms' };
    const shoes: ClothingItem = { ...dryOuter, id: 's', name: 'sneakers', category: 'shoes' };

    const suggestions = buildSuggestions({
      weather: sampleWeather({
        apparentTempC: 14,
        maxTempC: 15,
        minTempC: 12,
        precipitationProbability: 85,
        precipitationMm: 4,
      }),
      profile: baseProfile,
      items: [dryOuter, rainCoat, tops, bottoms, shoes],
      wearLogs: [],
    });

    const today = suggestions.find((s) => s.kind === 'today')!;
    const outerPiece = today.pieces.find((p) => p.slot === 'outer');
    expect(outerPiece?.label).toBe('rain jacket');
  });

  it('adjusts for cold-sensitive users', () => {
    const coldProfile: UserProfile = { ...baseProfile, thermalPreference: 'very_cold' };
    const wp = buildWeatherProfile(
      sampleWeather({ apparentTempC: 16, maxTempC: 18, minTempC: 12 }),
      coldProfile,
    );
    const req = getRequiredLayers(wp);
    expect(req.needsOuter).toBe(true);
  });
});
