import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SuggestionCard } from '../components/SuggestionCard';
import { WeatherCard } from '../components/WeatherCard';
import { useWeather } from '../hooks/useWeather';
import { useSuggestions } from '../hooks/useSuggestions';
import { useApp } from '../store/appStore';

export function HomeScreen() {
  const profile = useApp((s) => s.profile);
  const items = useApp((s) => s.items);
  const logWorn = useApp((s) => s.logWorn);
  const { weather, loading, error, refresh } = useWeather();
  const suggestions = useSuggestions();
  const [confirmSlot, setConfirmSlot] = useState<string | null>(null);

  const mainSuggestion = suggestions.find((s) => s.kind === 'today' || s.kind === 'fallback');

  const quickLog = async () => {
    if (!mainSuggestion) return;
    const ids = mainSuggestion.pieces
      .map((p) => p.itemId)
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) {
      setConfirmSlot('none');
      return;
    }
    await logWorn(ids, `${mainSuggestion.title}`);
    setConfirmSlot('done');
    setTimeout(() => setConfirmSlot(null), 1600);
  };

  return (
    <div className="screen home">
      <header className="screen__header">
        <h1>こんにちは{profile?.displayName ? `, ${profile.displayName}` : ''}</h1>
        <Link to="/closet/summary" className="btn btn--ghost btn--small">
          登録状況
        </Link>
      </header>

      <WeatherCard
        weather={weather}
        unit={profile?.temperatureUnit ?? 'c'}
        onRefresh={refresh}
        loading={loading}
        error={error}
      />

      {items.length === 0 && (
        <section className="card info-card">
          <h2>まだ服が未登録です</h2>
          <p>下の「追加」から服を登録すると、あなたの手持ちに合わせた提案に切り替わります。</p>
          <Link to="/closet/add" className="btn btn--primary">
            服を追加する
          </Link>
        </section>
      )}

      <h2 className="section-title">今日の服装提案</h2>
      <div className="suggestion-list">
        {suggestions.length === 0 && <p className="muted">天気データを取得すると提案が表示されます。</p>}
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} />
        ))}
      </div>

      {mainSuggestion && (
        <div className="wear-today">
          <button className="btn btn--primary btn--wide" onClick={quickLog}>
            今日はこれ着た
          </button>
          {confirmSlot === 'done' && <div className="toast">履歴に記録しました</div>}
          {confirmSlot === 'none' && <div className="toast">この提案は登録服を含みません</div>}
        </div>
      )}
    </div>
  );
}
