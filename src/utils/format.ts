import type { ClothingCategory, Season, StyleLevel, Thickness, WaterproofLevel } from '../types';

export const CATEGORY_LABEL: Record<ClothingCategory, string> = {
  tops: 'トップス',
  bottoms: 'ボトムス',
  outer: 'アウター',
  onepiece: 'ワンピース',
  shoes: '靴',
  bag: 'バッグ',
  accessory: '小物',
};

export const SEASON_LABEL: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
  all: 'オールシーズン',
};

export const THICKNESS_LABEL: Record<Thickness, string> = {
  thin: '薄手',
  normal: '普通',
  thick: '厚手',
};

export const STYLE_LABEL: Record<StyleLevel, string> = {
  casual: 'カジュアル',
  smart: 'きれいめ',
  business: 'ビジネス',
  formal: 'フォーマル',
};

export const WATERPROOF_LABEL: Record<WaterproofLevel, string> = {
  none: '防水なし',
  some: 'やや防水',
  strong: '防水',
};

export const SLOT_LABEL: Record<string, string> = {
  tops: '上半身',
  bottoms: '下半身',
  outer: '羽織り',
  onepiece: 'ワンピース',
  shoes: '靴',
  accessory: '小物',
};

export const QUICK_COLORS: Array<{ label: string; hex: string }> = [
  { label: '黒', hex: '#111111' },
  { label: '白', hex: '#f5f5f5' },
  { label: 'グレー', hex: '#888888' },
  { label: 'ネイビー', hex: '#1f2a44' },
  { label: 'ブルー', hex: '#3b82f6' },
  { label: 'デニム', hex: '#2b4a73' },
  { label: 'ベージュ', hex: '#c9b58c' },
  { label: 'ブラウン', hex: '#7b4a1a' },
  { label: 'カーキ', hex: '#4b5320' },
  { label: '緑', hex: '#2f6d3a' },
  { label: '赤', hex: '#c0392b' },
  { label: 'ピンク', hex: '#e48fb0' },
  { label: '黄', hex: '#f1c40f' },
  { label: 'パープル', hex: '#6c3d9e' },
];

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}/${m}/${day}`;
}

export function todayLabel(): string {
  const d = new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (${days[d.getDay()]})`;
}

export function formatTempC(v: number, unit: 'c' | 'f' = 'c'): string {
  if (unit === 'f') return `${Math.round((v * 9) / 5 + 32)}°F`;
  return `${Math.round(v)}℃`;
}
