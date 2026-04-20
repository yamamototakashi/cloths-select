import type { Thickness } from '../types';
import type { WeatherProfile } from './weatherProfile';

/**
 * Required layers for a given weather profile.
 * Based on effective temperature (adjusted for user thermal preference).
 */
export interface RequiredLayers {
  topsThickness: Thickness;
  needsOuter: boolean;
  outerThickness: Thickness; // only meaningful when needsOuter
  bottomsThickness: Thickness;
  preferShortSleeve: boolean;
  needLightCarryOuter: boolean; // bring a light jacket just in case (big temp swing)
  needRainGear: boolean;
  preferWaterproofShoes: boolean;
  accessoryHints: string[];
}

export function getRequiredLayers(wp: WeatherProfile): RequiredLayers {
  const t = wp.effectiveTempC;
  const hints: string[] = [];

  let topsThickness: Thickness = 'normal';
  let needsOuter = false;
  let outerThickness: Thickness = 'normal';
  let bottomsThickness: Thickness = 'normal';
  let preferShortSleeve = false;

  if (t <= 4) {
    topsThickness = 'thick';
    needsOuter = true;
    outerThickness = 'thick';
    bottomsThickness = 'thick';
    hints.push('マフラー', '手袋');
  } else if (t <= 8) {
    topsThickness = 'thick';
    needsOuter = true;
    outerThickness = 'thick';
    bottomsThickness = 'normal';
    hints.push('マフラー');
  } else if (t <= 13) {
    topsThickness = 'normal';
    needsOuter = true;
    outerThickness = 'normal';
    bottomsThickness = 'normal';
  } else if (t <= 18) {
    topsThickness = 'normal';
    needsOuter = true;
    outerThickness = 'thin';
    bottomsThickness = 'normal';
  } else if (t <= 23) {
    topsThickness = 'normal';
    needsOuter = false;
    bottomsThickness = 'normal';
  } else if (t <= 27) {
    topsThickness = 'thin';
    preferShortSleeve = true;
    needsOuter = false;
    bottomsThickness = 'thin';
    hints.push('水分補給');
  } else {
    topsThickness = 'thin';
    preferShortSleeve = true;
    needsOuter = false;
    bottomsThickness = 'thin';
    hints.push('日焼け対策', '水分補給');
  }

  const needLightCarryOuter = !needsOuter && wp.bigTempSwing && wp.minTempC <= 18;
  const needRainGear = wp.needsRainGear;
  const preferWaterproofShoes = wp.strongRain;

  if (needRainGear) hints.push('傘');
  if (wp.strongRain) hints.push('防水靴');
  if (wp.veryWindy) hints.push('風対策（帽子は飛ばされ注意）');

  return {
    topsThickness,
    needsOuter,
    outerThickness,
    bottomsThickness,
    preferShortSleeve,
    needLightCarryOuter,
    needRainGear,
    preferWaterproofShoes,
    accessoryHints: hints,
  };
}

export function thicknessOrder(t: Thickness): number {
  return t === 'thin' ? 0 : t === 'normal' ? 1 : 2;
}
