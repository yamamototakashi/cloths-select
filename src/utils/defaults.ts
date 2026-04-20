import type { UserProfile } from '../types';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'me',
  displayName: '',
  genderStyle: 'unspecified',
  ageRange: 'unspecified',
  thermalPreference: 'normal',
  rainTolerance: 'normal',
  stylePreference: 'balanced',
  commute: false,
  commuteMode: 'walk',
  commuteMinutes: 15,
  favoriteStyles: [],
  location: { mode: 'name', name: '東京', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  temperatureUnit: 'c',
  avoidRecentlyWornDays: 2,
  setupCompleted: false,
};
