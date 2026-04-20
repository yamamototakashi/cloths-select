import type { UserProfile, WeatherSnapshot } from '../types';
import type { RequiredLayers } from './layers';
import type { WeatherProfile } from './weatherProfile';

export function explainSuggestion(
  weather: WeatherSnapshot,
  wp: WeatherProfile,
  required: RequiredLayers,
  user: UserProfile,
): string[] {
  const reasons: string[] = [];

  reasons.push(
    `今日は最低${Math.round(weather.minTempC)}℃ / 最高${Math.round(weather.maxTempC)}℃ (${weather.weatherLabel})`,
  );

  if (wp.bigTempSwing) {
    reasons.push(`朝晩と日中で${Math.round(wp.tempRange)}℃差があり、脱ぎ着できる構成がおすすめ`);
  }

  if (wp.needsRainGear) {
    reasons.push(
      wp.strongRain
        ? `降水${weather.precipitationProbability}% / ${weather.precipitationMm}mmで本降り`
        : `降水${weather.precipitationProbability}%で雨対策があると安心`,
    );
  }

  if (wp.windy) {
    reasons.push(wp.veryWindy ? '風が強い（目安9m/s以上）' : 'やや風あり');
  }

  if (user.thermalPreference === 'very_cold' || user.thermalPreference === 'cold') {
    reasons.push('寒がり設定のため、普段より1段階暖かめに');
  } else if (user.thermalPreference === 'hot' || user.thermalPreference === 'very_hot') {
    reasons.push('暑がり設定のため、普段より軽めに');
  }

  if (user.commute && user.commuteMode === 'walk') {
    reasons.push('徒歩通勤のため、歩きやすさと防寒を少し強めに');
  }

  if (required.preferShortSleeve) reasons.push('日中はかなり暑くなる見込み');
  if (required.needsOuter && required.outerThickness === 'thick') {
    reasons.push('厚手のアウターが必要な気温帯');
  } else if (required.needsOuter) {
    reasons.push('羽織りがあると安心な気温帯');
  }

  return reasons;
}
