import type { WeatherSnapshot } from '../../types';

export interface WeatherService {
  getByCoordinates(latitude: number, longitude: number, locationName?: string): Promise<WeatherSnapshot>;
  searchLocation(query: string): Promise<GeocodingResult[]>;
}

export interface GeocodingResult {
  id: number | string;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export const WEATHER_CODE_LABELS: Record<number, string> = {
  0: '快晴',
  1: 'ほぼ晴れ',
  2: '曇りときどき晴れ',
  3: '曇り',
  45: '霧',
  48: '濃い霧',
  51: '弱い霧雨',
  53: '霧雨',
  55: '強い霧雨',
  61: '弱い雨',
  63: '雨',
  65: '強い雨',
  66: '弱い凍雨',
  67: '強い凍雨',
  71: '弱い雪',
  73: '雪',
  75: '強い雪',
  77: '霧雪',
  80: 'にわか雨',
  81: '強いにわか雨',
  82: '非常に強いにわか雨',
  85: 'にわか雪',
  86: '強いにわか雪',
  95: '雷雨',
  96: '雷雨と弱いひょう',
  99: '雷雨と強いひょう',
};

export function labelForWeatherCode(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? '天気情報';
}
