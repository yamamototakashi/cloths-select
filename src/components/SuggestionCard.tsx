import { Link } from 'react-router-dom';
import type { OutfitSuggestion } from '../types';
import { CATEGORY_LABEL, SLOT_LABEL } from '../utils/format';

export function SuggestionCard({ suggestion }: { suggestion: OutfitSuggestion }) {
  return (
    <article className={`card suggestion suggestion--${suggestion.kind}`}>
      <header className="suggestion__head">
        <span className={`suggestion__badge suggestion__badge--${suggestion.kind}`}>
          {suggestion.kind === 'today'
            ? 'おすすめ'
            : suggestion.kind === 'warmer'
              ? '暖かめ'
              : suggestion.kind === 'lighter'
                ? '軽め'
                : '参考'}
        </span>
        <h3 className="suggestion__title">{suggestion.title}</h3>
      </header>

      <ul className="suggestion__pieces">
        {suggestion.pieces.map((p, i) => (
          <li key={`${p.slot}-${i}`} className="suggestion__piece">
            <span className="suggestion__slot">{SLOT_LABEL[p.slot] ?? p.slot}</span>
            <span className="suggestion__label">{p.label}</span>
          </li>
        ))}
      </ul>

      {suggestion.reasons.length > 0 && (
        <details className="suggestion__reasons">
          <summary>この提案の根拠</summary>
          <ul>
            {suggestion.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </details>
      )}

      {suggestion.missingCategories.length > 0 && (
        <div className="suggestion__missing">
          <p>
            精度向上のため、
            {suggestion.missingCategories.map((c) => CATEGORY_LABEL[c]).join('・')}
            を登録するとより正確になります。
          </p>
          <Link to="/closet/add" className="btn btn--ghost btn--small">
            服を登録する
          </Link>
        </div>
      )}

      <div className="suggestion__actions">
        <Link to={`/suggestion/${suggestion.id}`} className="btn btn--ghost btn--small">
          詳しく見る
        </Link>
      </div>
    </article>
  );
}
