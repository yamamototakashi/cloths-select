import type {
  ClothingCategory,
  ClothingItem,
  OutfitPiece,
  OutfitSuggestion,
  UserProfile,
  WearLog,
  WeatherSnapshot,
} from '../types';
import { buildFallbackPieces, detectMissingCategories } from './fallback';
import { explainSuggestion } from './explain';
import { getRequiredLayers } from './layers';
import { pickBest, type ScoringContext } from './scoring';
import { buildWeatherProfile, type WeatherProfile } from './weatherProfile';

export interface EngineInputs {
  weather: WeatherSnapshot;
  profile: UserProfile;
  items: ClothingItem[];
  wearLogs: WearLog[];
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function countByCategory(items: ClothingItem[]): Record<ClothingCategory, number> {
  const c: Record<ClothingCategory, number> = {
    tops: 0,
    bottoms: 0,
    outer: 0,
    onepiece: 0,
    shoes: 0,
    bag: 0,
    accessory: 0,
  };
  for (const i of items) {
    if (i.archivedAt) continue;
    c[i.category] = (c[i.category] ?? 0) + 1;
  }
  return c;
}

function buildSuggestionFromWeather(
  kind: OutfitSuggestion['kind'],
  title: string,
  effectiveShift: number,
  inputs: EngineInputs,
): OutfitSuggestion {
  const wp: WeatherProfile = {
    ...buildWeatherProfile(inputs.weather, inputs.profile),
  };
  wp.effectiveTempC = wp.effectiveTempC + effectiveShift;
  const required = getRequiredLayers(wp);
  const counts = countByCategory(inputs.items);

  const ctx: ScoringContext = {
    profile: inputs.profile,
    weather: wp,
    required,
    wearLogs: inputs.wearLogs,
  };

  const pieces: OutfitPiece[] = [];
  const reasons = explainSuggestion(inputs.weather, wp, required, inputs.profile);
  if (effectiveShift < 0) reasons.push('体感を下げた想定：少し暖かめの提案です');
  if (effectiveShift > 0) reasons.push('体感を上げた想定：少し軽めの提案です');

  const missing = detectMissingCategories(counts, required);

  // tops
  const tops = pickBest(inputs.items, ctx, 'tops');
  if (tops.item) {
    pieces.push({ slot: 'tops', label: tops.item.name, itemId: tops.item.id });
  } else {
    const fb = buildFallbackPieces(required, wp);
    const top = fb.pieces.find((p) => p.slot === 'tops');
    if (top) pieces.push(top);
  }

  // bottoms
  const bottoms = pickBest(inputs.items, ctx, 'bottoms');
  if (bottoms.item) {
    pieces.push({ slot: 'bottoms', label: bottoms.item.name, itemId: bottoms.item.id });
  } else if (!(tops.item && tops.item.category === 'onepiece')) {
    const fb = buildFallbackPieces(required, wp);
    const b = fb.pieces.find((p) => p.slot === 'bottoms');
    if (b) pieces.push(b);
  }

  // outer
  if (required.needsOuter) {
    const outer = pickBest(inputs.items, ctx, 'outer');
    if (outer.item) {
      pieces.push({ slot: 'outer', label: outer.item.name, itemId: outer.item.id });
    } else {
      const fb = buildFallbackPieces(required, wp);
      const o = fb.pieces.find((p) => p.slot === 'outer');
      if (o) pieces.push(o);
    }
  } else if (required.needLightCarryOuter) {
    pieces.push({ slot: 'outer', label: '薄手の羽織り（持って出るだけでOK）' });
  }

  // shoes
  const shoes = pickBest(inputs.items, ctx, 'shoes');
  if (shoes.item) {
    pieces.push({ slot: 'shoes', label: shoes.item.name, itemId: shoes.item.id });
  } else {
    const fb = buildFallbackPieces(required, wp);
    const s = fb.pieces.find((p) => p.slot === 'shoes');
    if (s) pieces.push(s);
  }

  // Accessories (rain / cold gear) — always include as reminders.
  for (const hint of required.accessoryHints) {
    pieces.push({ slot: 'accessory', label: hint });
  }
  if (required.needRainGear && !required.accessoryHints.includes('傘')) {
    pieces.push({ slot: 'accessory', label: '折りたたみ傘' });
  }

  const baseScore =
    (tops.item ? tops.score : 0) +
    (bottoms.item ? bottoms.score : 0) +
    (required.needsOuter ? (pickBest(inputs.items, ctx, 'outer').score ?? 0) : 0) +
    (shoes.item ? shoes.score : 0);

  return {
    id: uid('sug'),
    kind,
    title,
    pieces,
    reasons,
    missingCategories: missing,
    score: baseScore,
  };
}

export function buildSuggestions(inputs: EngineInputs): OutfitSuggestion[] {
  const main = buildSuggestionFromWeather('today', 'きょうのおすすめ', 0, inputs);
  const warmer = buildSuggestionFromWeather('warmer', '少し暖かめに', -2, inputs);
  const lighter = buildSuggestionFromWeather('lighter', '少し軽めに', +2, inputs);

  const counts = countByCategory(inputs.items);
  const totalOwned = Object.values(counts).reduce((a, b) => a + b, 0);

  if (totalOwned < 3) {
    const wp = buildWeatherProfile(inputs.weather, inputs.profile);
    const required = getRequiredLayers(wp);
    const fb = buildFallbackPieces(required, wp);
    const reasons = explainSuggestion(inputs.weather, wp, required, inputs.profile);
    reasons.push('まだ登録が少ないため、一般的な参考コーデを優先表示しています');
    const fallback: OutfitSuggestion = {
      id: uid('fb'),
      kind: 'fallback',
      title: '参考コーデ',
      pieces: fb.pieces,
      reasons,
      missingCategories: fb.missing,
      score: 0,
    };
    return [fallback, main, warmer, lighter];
  }

  return [main, warmer, lighter];
}
