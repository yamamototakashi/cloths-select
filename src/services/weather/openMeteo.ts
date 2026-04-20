import type { WeatherSnapshot } from '../../types';
import { labelForWeatherCode, type GeocodingResult, type WeatherService } from './types';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
    weather_code?: number[];
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation?: number[];
    precipitation_probability?: number[];
  };
  timezone?: string;
}

function todayISODate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class OpenMeteoService implements WeatherService {
  async getByCoordinates(
    latitude: number,
    longitude: number,
    locationName?: string,
  ): Promise<WeatherSnapshot> {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code',
      daily:
        'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code',
      hourly: 'temperature_2m,precipitation,precipitation_probability',
      timezone: 'auto',
      forecast_days: '1',
      wind_speed_unit: 'ms',
    });
    const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
    if (!res.ok) throw new Error(`Open-Meteo forecast failed: ${res.status}`);
    const data = (await res.json()) as OpenMeteoResponse;

    const code = data.current?.weather_code ?? data.daily?.weather_code?.[0] ?? 0;
    const todayISO = todayISODate();
    const hourly =
      data.hourly?.time?.map((iso, i) => ({
        iso,
        tempC: data.hourly?.temperature_2m?.[i] ?? 0,
        precipitationMm: data.hourly?.precipitation?.[i] ?? 0,
        precipitationProbability: data.hourly?.precipitation_probability?.[i] ?? 0,
      })) ?? [];
    const todayHourly = hourly
      .filter((h) => h.iso.startsWith(todayISO))
      .map((h) => ({
        hour: new Date(h.iso).getHours(),
        tempC: h.tempC,
        precipitationMm: h.precipitationMm,
        precipitationProbability: h.precipitationProbability,
      }));

    return {
      fetchedAt: Date.now(),
      locationName: locationName ?? '現在地',
      latitude,
      longitude,
      currentTempC: data.current?.temperature_2m ?? 0,
      apparentTempC: data.current?.apparent_temperature ?? data.current?.temperature_2m ?? 0,
      maxTempC: data.daily?.temperature_2m_max?.[0] ?? 0,
      minTempC: data.daily?.temperature_2m_min?.[0] ?? 0,
      precipitationProbability: data.daily?.precipitation_probability_max?.[0] ?? 0,
      precipitationMm: data.daily?.precipitation_sum?.[0] ?? 0,
      windSpeedMs: data.current?.wind_speed_10m ?? 0,
      weatherCode: code,
      weatherLabel: labelForWeatherCode(code),
      hourly: todayHourly,
      source: 'open-meteo',
    };
  }

  async searchLocation(query: string): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];
    const params = new URLSearchParams({
      name: query.trim(),
      count: '8',
      language: 'ja',
      format: 'json',
    });
    const res = await fetch(`${GEOCODING_URL}?${params.toString()}`);
    if (!res.ok) throw new Error(`Open-Meteo geocoding failed: ${res.status}`);
    const data = (await res.json()) as { results?: GeocodingResult[] };
    return data.results ?? [];
  }
}
