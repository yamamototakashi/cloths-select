import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSuggestions } from '../hooks/useSuggestions';
import { useApp } from '../store/appStore';
import { CATEGORY_LABEL, SLOT_LABEL } from '../utils/format';
import { blobUrl } from '../utils/image';

export function SuggestionDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const suggestions = useSuggestions();
  const items = useApp((s) => s.items);
  const logWorn = useApp((s) => s.logWorn);

  const suggestion = useMemo(() => suggestions.find((s) => s.id === id), [suggestions, id]);

  if (!suggestion) {
    return (
      <div className="screen">
        <header className="screen__header">
          <h1>コーデ詳細</h1>
        </header>
        <p>提案が見つかりませんでした。再度ホームから確認してください。</p>
        <button className="btn btn--ghost" onClick={() => navigate('/')}>
          ホームへ
        </button>
      </div>
    );
  }

  const markWorn = async () => {
    const ids = suggestion.pieces.map((p) => p.itemId).filter((v): v is string => Boolean(v));
    if (ids.length === 0) return;
    await logWorn(ids, suggestion.title);
    navigate('/history');
  };

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>{suggestion.title}</h1>
      </header>

      <section className="card">
        <ul className="suggestion-detail__pieces">
          {suggestion.pieces.map((p, i) => {
            const linked = p.itemId ? items.find((x) => x.id === p.itemId) : undefined;
            const img = linked ? blobUrl(linked.imageBlob) : undefined;
            return (
              <li key={`${p.slot}-${i}`} className="suggestion-detail__piece">
                <div
                  className="suggestion-detail__thumb"
                  style={{ background: linked?.colors[0] ?? '#e1e5ea' }}
                >
                  {img ? <img src={img} alt={p.label} /> : <span>{SLOT_LABEL[p.slot]}</span>}
                </div>
                <div>
                  <div className="suggestion-detail__slot">{SLOT_LABEL[p.slot] ?? p.slot}</div>
                  <div className="suggestion-detail__label">{p.label}</div>
                  {linked && (
                    <Link
                      to={`/closet/${linked.id}`}
                      className="btn btn--ghost btn--small"
                      style={{ marginTop: 6 }}
                    >
                      このアイテムを見る
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2>この提案の根拠</h2>
        <ul>
          {suggestion.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

      {suggestion.missingCategories.length > 0 && (
        <section className="card info-card">
          <h2>登録を増やすとより正確に</h2>
          <p>
            未登録カテゴリ: {suggestion.missingCategories.map((c) => CATEGORY_LABEL[c]).join('・')}
          </p>
          <Link to="/closet/add" className="btn btn--primary">
            服を追加する
          </Link>
        </section>
      )}

      <div className="screen__footer">
        <button className="btn btn--primary btn--wide" onClick={markWorn}>
          今日はこれ着た
        </button>
      </div>
    </div>
  );
}
