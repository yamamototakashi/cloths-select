import type { ClothingItem } from '../types';

function nowId(prefix: string, n: number): string {
  return `${prefix}-seed-${n.toString(36)}`;
}

export function buildSeedItems(): ClothingItem[] {
  const now = Date.now();
  const base = (i: number, overrides: Partial<ClothingItem>): ClothingItem => ({
    id: nowId('item', i),
    name: '',
    category: 'tops',
    seasons: ['all'],
    thickness: 'normal',
    colors: ['#000000'],
    styleLevel: 'casual',
    waterproofLevel: 'none',
    favorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as ClothingItem);

  return [
    base(1, {
      name: '白Tシャツ',
      category: 'tops',
      seasons: ['spring', 'summer'],
      thickness: 'thin',
      colors: ['#ffffff'],
      styleLevel: 'casual',
    }),
    base(2, {
      name: '黒パーカー',
      category: 'tops',
      seasons: ['spring', 'autumn'],
      thickness: 'normal',
      colors: ['#111111'],
      styleLevel: 'casual',
    }),
    base(3, {
      name: '長袖シャツ（ネイビー）',
      category: 'tops',
      seasons: ['spring', 'autumn'],
      thickness: 'normal',
      colors: ['#1f2a44'],
      styleLevel: 'smart',
    }),
    base(4, {
      name: 'デニムパンツ',
      category: 'bottoms',
      seasons: ['all'],
      thickness: 'normal',
      colors: ['#2b4a73'],
      styleLevel: 'casual',
    }),
    base(5, {
      name: 'チノパン（ベージュ）',
      category: 'bottoms',
      seasons: ['spring', 'autumn'],
      thickness: 'normal',
      colors: ['#c9b58c'],
      styleLevel: 'smart',
    }),
    base(6, {
      name: '薄手ジャケット',
      category: 'outer',
      seasons: ['spring', 'autumn'],
      thickness: 'thin',
      colors: ['#2f2f2f'],
      styleLevel: 'smart',
      waterproofLevel: 'some',
    }),
    base(7, {
      name: 'ダウンジャケット',
      category: 'outer',
      seasons: ['winter'],
      thickness: 'thick',
      colors: ['#1c1c1c'],
      styleLevel: 'casual',
      waterproofLevel: 'some',
    }),
    base(8, {
      name: '白スニーカー',
      category: 'shoes',
      seasons: ['all'],
      thickness: 'normal',
      colors: ['#f5f5f5'],
      styleLevel: 'casual',
    }),
    base(9, {
      name: '折りたたみ傘',
      category: 'accessory',
      seasons: ['all'],
      thickness: 'thin',
      colors: ['#444444'],
      styleLevel: 'casual',
      waterproofLevel: 'strong',
    }),
  ];
}
