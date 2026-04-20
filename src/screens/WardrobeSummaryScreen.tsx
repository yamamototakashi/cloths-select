import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/appStore';
import type { ClothingCategory } from '../types';
import { CATEGORY_LABEL } from '../utils/format';

const CATEGORIES: ClothingCategory[] = ['tops', 'bottoms', 'outer', 'onepiece', 'shoes', 'bag', 'accessory'];

export function WardrobeSummaryScreen() {
  const items = useApp((s) => s.items);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    let rainOk = 0;
    let archived = 0;
    let favorites = 0;
    for (const i of items) {
      counts[i.category] = (counts[i.category] ?? 0) + 1;
      if (i.waterproofLevel !== 'none') rainOk++;
      if (i.archivedAt) archived++;
      if (i.favorite) favorites++;
    }
    return { counts, rainOk, archived, favorites, total: items.length };
  }, [items]);

  const hints: string[] = [];
  if ((stats.counts.tops ?? 0) < 3) hints.push('トップスが少なめ（3点以上あると提案が安定します）');
  if ((stats.counts.bottoms ?? 0) < 2) hints.push('ボトムスを2点以上登録するとローテしやすいです');
  if ((stats.counts.outer ?? 0) < 1) hints.push('アウター未登録。寒い日の提案が弱くなります');
  if ((stats.counts.shoes ?? 0) < 1) hints.push('靴が未登録です');
  if (stats.rainOk < 1) hints.push('防水アイテムが未登録。雨の日向け提案が弱くなります');

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>登録状況</h1>
      </header>

      <section className="card">
        <h2>全体</h2>
        <dl className="summary-grid">
          <div>
            <dt>登録数</dt>
            <dd>{stats.total}</dd>
          </div>
          <div>
            <dt>お気に入り</dt>
            <dd>{stats.favorites}</dd>
          </div>
          <div>
            <dt>雨に強い</dt>
            <dd>{stats.rainOk}</dd>
          </div>
          <div>
            <dt>アーカイブ</dt>
            <dd>{stats.archived}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>カテゴリ別</h2>
        <ul className="summary-list">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <span>{CATEGORY_LABEL[c]}</span>
              <span className="muted">{stats.counts[c] ?? 0} 点</span>
            </li>
          ))}
        </ul>
      </section>

      {hints.length > 0 && (
        <section className="card info-card">
          <h2>アドバイス</h2>
          <ul>
            {hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
          <Link to="/closet/add" className="btn btn--primary">
            足りないカテゴリを追加
          </Link>
        </section>
      )}
    </div>
  );
}
