import type { ClothingCategory, OutfitPiece, UserProfile, WeatherSnapshot } from '../types';
import type { RequiredLayers } from './layers';
import type { WeatherProfile } from './weatherProfile';

/** Produces a generic reference outfit when no (or few) clothes are registered. */
export function buildFallbackPieces(
  required: RequiredLayers,
  wp: WeatherProfile,
): { pieces: OutfitPiece[]; missing: ClothingCategory[] } {
  const pieces: OutfitPiece[] = [];
  const t = wp.effectiveTempC;

  const topsLabel =
    t <= 8
      ? '厚手のニットやスウェット'
      : t <= 13
        ? '長袖シャツ or 薄手ニット'
        : t <= 18
          ? '長袖Tシャツ or シャツ'
          : t <= 23
            ? '長袖Tシャツ'
            : t <= 27
              ? '半袖Tシャツ'
              : '涼しい半袖・リネン素材';
  pieces.push({ slot: 'tops', label: topsLabel });

  const bottomsLabel =
    t <= 8
      ? '厚手パンツ（ウールや裏起毛など）'
      : t <= 18
        ? 'ロングパンツ'
        : t <= 25
          ? '薄手ロングパンツ'
          : '半ズボン or 薄手パンツ';
  pieces.push({ slot: 'bottoms', label: bottomsLabel });

  if (required.needsOuter) {
    const outerLabel =
      required.outerThickness === 'thick'
        ? 'ダウン・厚手コート'
        : required.outerThickness === 'normal'
          ? 'ジャケット・カーディガン'
          : '薄手ジャケット・シャツアウター';
    pieces.push({ slot: 'outer', label: outerLabel });
  } else if (required.needLightCarryOuter) {
    pieces.push({ slot: 'outer', label: '薄手の羽織り（持って出るだけでOK）' });
  }

  const shoesLabel = required.preferWaterproofShoes
    ? '防水シューズ or 濡れてもよい靴'
    : t <= 5
      ? '防寒ブーツ'
      : 'スニーカー';
  pieces.push({ slot: 'shoes', label: shoesLabel });

  if (required.needRainGear) {
    pieces.push({ slot: 'accessory', label: '折りたたみ傘' });
  }
  for (const hint of required.accessoryHints) {
    if (hint === '傘') continue;
    pieces.push({ slot: 'accessory', label: hint });
  }

  const missing: ClothingCategory[] = ['tops', 'bottoms', 'shoes'];
  if (required.needsOuter) missing.push('outer');
  if (required.needRainGear) missing.push('accessory');
  return { pieces, missing };
}

export function detectMissingCategories(
  counts: Record<ClothingCategory, number>,
  required: RequiredLayers,
): ClothingCategory[] {
  const missing: ClothingCategory[] = [];
  if (counts.tops < 2) missing.push('tops');
  if (counts.bottoms < 1) missing.push('bottoms');
  if (counts.shoes < 1) missing.push('shoes');
  if (required.needsOuter && counts.outer < 1) missing.push('outer');
  return missing;
}

/** Friendly message when user has no (or little) wardrobe. */
export function fallbackNote(weather: WeatherSnapshot): string {
  return `まだ服の登録が少ないので、一般的な参考コーデを表示しています。羽織りや靴を登録すると、あなたに合った提案に切り替わります。`;
}
