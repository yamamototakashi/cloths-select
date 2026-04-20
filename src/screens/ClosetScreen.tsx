import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import { useApp } from '../store/appStore';
import type { ClothingCategory, Season } from '../types';
import { CATEGORY_LABEL, SEASON_LABEL } from '../utils/format';

type SortMode = 'updated' | 'name' | 'favorite';

const CATEGORY_FILTERS: Array<{ v: 'all' | ClothingCategory; l: string }> = [
  { v: 'all', l: 'すべて' },
  { v: 'tops', l: 'トップス' },
  { v: 'bottoms', l: 'ボトムス' },
  { v: 'outer', l: 'アウター' },
  { v: 'onepiece', l: 'ワンピ' },
  { v: 'shoes', l: '靴' },
  { v: 'bag', l: 'バッグ' },
  { v: 'accessory', l: '小物' },
];

const SEASON_FILTERS: Array<{ v: 'all' | Season; l: string }> = [
  { v: 'all', l: '季節不問' },
  { v: 'spring', l: SEASON_LABEL.spring },
  { v: 'summer', l: SEASON_LABEL.summer },
  { v: 'autumn', l: SEASON_LABEL.autumn },
  { v: 'winter', l: SEASON_LABEL.winter },
];

export function ClosetScreen() {
  const items = useApp((s) => s.items);
  const wearLogs = useApp((s) => s.wearLogs);

  const [category, setCategory] = useState<'all' | ClothingCategory>('all');
  const [season, setSeason] = useState<'all' | Season>('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [rainOnly, setRainOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>('updated');

  const filtered = useMemo(() => {
    const lastWorn: Record<string, number> = {};
    for (const log of wearLogs) {
      for (const id of log.itemIds) {
        lastWorn[id] = Math.max(lastWorn[id] ?? 0, log.createdAt);
      }
    }

    const list = items.filter((i) => {
      if (category !== 'all' && i.category !== category) return false;
      if (season !== 'all' && !i.seasons.includes(season) && !i.seasons.includes('all')) return false;
      if (favoriteOnly && !i.favorite) return false;
      if (rainOnly && i.waterproofLevel === 'none') return false;
      return true;
    });

    const sorted = [...list];
    if (sort === 'updated') sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'favorite')
      sorted.sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt - a.updatedAt);
    return sorted;
  }, [items, wearLogs, category, season, favoriteOnly, rainOnly, sort]);

  return (
    <div className="screen closet">
      <header className="screen__header">
        <h1>手持ちの服</h1>
        <Link to="/closet/add" className="btn btn--primary btn--small">＋ 追加</Link>
      </header>

      <section className="filters">
        <div className="chip-row chip-row--scroll">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.v}
              className={`chip ${category === f.v ? 'is-active' : ''}`}
              onClick={() => setCategory(f.v)}
            >
              {f.l}
            </button>
          ))}
        </div>
        <div className="chip-row chip-row--scroll">
          {SEASON_FILTERS.map((f) => (
            <button
              key={f.v}
              className={`chip ${season === f.v ? 'is-active' : ''}`}
              onClick={() => setSeason(f.v)}
            >
              {f.l}
            </button>
          ))}
          <button
            className={`chip ${favoriteOnly ? 'is-active' : ''}`}
            onClick={() => setFavoriteOnly((v) => !v)}
          >
            ★お気に入り
          </button>
          <button
            className={`chip ${rainOnly ? 'is-active' : ''}`}
            onClick={() => setRainOnly((v) => !v)}
          >
            雨の日向け
          </button>
        </div>
        <div className="chip-row">
          {(
            [
              { v: 'updated', l: '最近更新順' },
              { v: 'name', l: '名前順' },
              { v: 'favorite', l: 'お気に入り順' },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              className={`chip ${sort === o.v ? 'is-active' : ''}`}
              onClick={() => setSort(o.v)}
            >
              {o.l}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="card info-card">
          <p>
            {items.length === 0
              ? 'まだ服が登録されていません。下の「追加」から最初の一着を登録してみましょう。'
              : 'この条件に合う服がありません。フィルタを変えてみてください。'}
          </p>
          <Link to="/closet/add" className="btn btn--primary">
            服を追加
          </Link>
        </div>
      ) : (
        <div className="item-grid">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="screen__footer">
        <Link to="/closet/summary" className="btn btn--ghost btn--wide">
          登録状況のサマリーを見る
        </Link>
      </div>
    </div>
  );
}

// Keep CATEGORY_LABEL re-used for fallback labels elsewhere.
void CATEGORY_LABEL;
