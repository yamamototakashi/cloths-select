import type { UserProfile, WeatherSnapshot } from '../types';

export interface WeatherProfile {
  effectiveTempC: number; // temperature after subjective adjustments
  minTempC: number;
  maxTempC: number;
  tempRange: number;
  needsRainGear: boolean;
  strongRain: boolean;
  windy: boolean;
  veryWindy: boolean;
  bigTempSwing: boolean;
  timeOfDay: 'morning' | 'day' | 'evening' | 'night';
  commuteBoost: boolean;
}

const THERMAL_OFFSET: Record<UserProfile['thermalPreference'], number> = {
  very_cold: -3,
  cold: -1.5,
  normal: 0,
  hot: 1.5,
  very_hot: 3,
};

export function buildWeatherProfile(
  weather: WeatherSnapshot,
  user: UserProfile,
): WeatherProfile {
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay: WeatherProfile['timeOfDay'] =
    hour < 5 ? 'night' : hour < 10 ? 'morning' : hour < 17 ? 'day' : hour < 20 ? 'evening' : 'night';

  const tempRange = Math.max(0, weather.maxTempC - weather.minTempC);
  const thermalOffset = THERMAL_OFFSET[user.thermalPreference];
  // Effective temp: apparent temp shifted by user thermal preference.
  // For cold-sensitive users the offset is negative, lowering effective temp
  // so the engine picks a warmer band of suggestions.
  const effectiveTempC = weather.apparentTempC + thermalOffset;

  const rainProb = weather.precipitationProbability;
  const rainMm = weather.precipitationMm;
  const rainBias = user.rainTolerance === 'weak' ? -10 : user.rainTolerance === 'strong' ? 10 : 0;
  const effectiveRainProb = rainProb - rainBias;

  return {
    effectiveTempC,
    minTempC: weather.minTempC,
    maxTempC: weather.maxTempC,
    tempRange,
    needsRainGear: effectiveRainProb >= 40 || rainMm >= 1,
    strongRain: rainMm >= 5 || rainProb >= 80,
    windy: weather.windSpeedMs >= 5,
    veryWindy: weather.windSpeedMs >= 9,
    bigTempSwing: tempRange >= 8,
    timeOfDay,
    commuteBoost: user.commute,
  };
}
