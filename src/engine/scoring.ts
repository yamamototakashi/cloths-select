import type { ClothingItem, StyleLevel, UserProfile, WearLog } from '../types';
import { thicknessOrder, type RequiredLayers } from './layers';
import type { WeatherProfile } from './weatherProfile';

const STYLE_ORDER: Record<StyleLevel, number> = {
  casual: 0,
  smart: 1,
  business: 2,
  formal: 3,
};

const USER_STYLE_TARGET = {
  casual: 0,
  balanced: 1.2,
  formal: 2.3,
} as const;

export interface ScoringContext {
  profile: UserProfile;
  weather: WeatherProfile;
  required: RequiredLayers;
  wearLogs: WearLog[];
}

export function scoreItem(item: ClothingItem, slotThickness: 'tops' | 'bottoms' | 'outer' | 'shoes' | 'accessory', ctx: ScoringContext): number {
  let score = 50;
  const { required, profile, wearLogs, weather } = ctx;

  // Thickness fit
  const target = slotThickness === 'tops'
    ? required.topsThickness
    : slotThickness === 'bottoms'
      ? required.bottomsThickness
      : slotThickness === 'outer'
        ? required.outerThickness
        : 'normal';

  const diff = Math.abs(thicknessOrder(item.thickness) - thicknessOrder(target));
  score -= diff * 14;

  // Season fit
  const month = new Date().getMonth() + 1;
  const currentSeason =
    month <= 2 || month === 12 ? 'winter' : month <= 5 ? 'spring' : month <= 8 ? 'summer' : 'autumn';
  if (item.seasons.includes('all')) score += 3;
  else if (item.seasons.includes(currentSeason as never)) score += 8;
  else score -= 10;

  // Style fit
  const userTarget = USER_STYLE_TARGET[profile.stylePreference];
  const styleDiff = Math.abs(STYLE_ORDER[item.styleLevel] - userTarget);
  score -= styleDiff * 6;

  // Rain adaptation
  if (required.needRainGear && (slotThickness === 'outer' || slotThickness === 'shoes')) {
    if (item.waterproofLevel === 'strong') score += 18;
    else if (item.waterproofLevel === 'some') score += 8;
    else score -= 5;
  }

  // Favorite boost
  if (item.favorite) score += 6;

  // Avoid recently worn
  if (profile.avoidRecentlyWornDays > 0) {
    const cutoff = Date.now() - profile.avoidRecentlyWornDays * 24 * 60 * 60 * 1000;
    const recentlyWorn = wearLogs.some(
      (log) => log.itemIds.includes(item.id) && log.createdAt >= cutoff,
    );
    if (recentlyWorn) score -= 15;
  }

  // Short sleeve preference for hot weather (tops only)
  if (slotThickness === 'tops' && required.preferShortSleeve) {
    if (item.thickness === 'thin') score += 6;
  }

  // Archived items should never surface
  if (item.archivedAt) score -= 1000;

  // Light dampening based on wind
  if (weather.veryWindy && slotThickness === 'outer' && item.thickness === 'thin') {
    score -= 6;
  }

  return score;
}

export interface SlotBest {
  item?: ClothingItem;
  score: number;
}

export function pickBest(items: ClothingItem[], ctx: ScoringContext, slot: 'tops' | 'bottoms' | 'outer' | 'shoes'): SlotBest {
  const categoryMatch = (c: ClothingItem['category']) => {
    if (slot === 'tops') return c === 'tops' || c === 'onepiece';
    if (slot === 'bottoms') return c === 'bottoms';
    if (slot === 'outer') return c === 'outer';
    if (slot === 'shoes') return c === 'shoes';
    return false;
  };

  const candidates = items.filter((i) => !i.archivedAt && categoryMatch(i.category));
  if (candidates.length === 0) return { score: 0 };

  let best: SlotBest = { score: -Infinity };
  for (const item of candidates) {
    const s = scoreItem(item, slot, ctx);
    if (s > best.score) best = { item, score: s };
  }
  return best;
}
