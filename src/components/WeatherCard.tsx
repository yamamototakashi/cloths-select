import type { WeatherSnapshot } from '../types';
import { formatTempC, todayLabel } from '../utils/format';

function weatherEmoji(code: number, rainMm: number): string {
  if (code >= 95) return '⛈';
  if (code >= 71 && code <= 86) return '🌨';
  if (code >= 61 && code <= 65) return '🌧';
  if (code >= 51 && code <= 57) return '🌦';
  if (code >= 45 && code <= 48) return '🌫';
  if (code === 3) return '☁️';
  if (code === 2) return '⛅️';
  if (code === 1) return '🌤';
  if (rainMm >= 1) return '🌧';
  return '☀️';
}

export function WeatherCard({
  weather,
  unit,
  onRefresh,
  loading,
  error,
}: {
  weather?: WeatherSnapshot;
  unit: 'c' | 'f';
  onRefresh?: () => void;
  loading?: boolean;
  error?: string;
}) {
  if (!weather) {
    return (
      <section className="card weather-card">
        <div className="weather-card__date">{todayLabel()}</div>
        {loading ? (
          <p>天気を取得中…</p>
        ) : error ? (
          <div>
            <p className="error-text">{error}</p>
            {onRefresh && (
              <button className="btn btn--ghost" onClick={onRefresh}>
                再取得
              </button>
            )}
          </div>
        ) : (
          <p>まだ天気データがありません</p>
        )}
      </section>
    );
  }

  const emoji = weatherEmoji(weather.weatherCode, weather.precipitationMm);

  return (
    <section className="card weather-card">
      <header className="weather-card__head">
        <div>
          <div className="weather-card__date">{todayLabel()}</div>
          <div className="weather-card__loc">{weather.locationName}</div>
        </div>
        <button
          className="btn btn--ghost btn--small"
          onClick={onRefresh}
          disabled={loading}
          aria-label="天気を更新"
        >
          {loading ? '更新中…' : '更新'}
        </button>
      </header>
      <div className="weather-card__main">
        <div className="weather-card__emoji" aria-hidden>
          {emoji}
        </div>
        <div className="weather-card__temps">
          <div className="weather-card__now">{formatTempC(weather.currentTempC, unit)}</div>
          <div className="weather-card__range">
            最高 {formatTempC(weather.maxTempC, unit)} / 最低 {formatTempC(weather.minTempC, unit)}
          </div>
          <div className="weather-card__apparent">
            体感 {formatTempC(weather.apparentTempC, unit)}
          </div>
        </div>
      </div>
      <dl className="weather-card__metrics">
        <div>
          <dt>天気</dt>
          <dd>{weather.weatherLabel}</dd>
        </div>
        <div>
          <dt>降水</dt>
          <dd>
            {weather.precipitationProbability}% / {weather.precipitationMm.toFixed(1)}mm
          </dd>
        </div>
        <div>
          <dt>風</dt>
          <dd>{weather.windSpeedMs.toFixed(1)} m/s</dd>
        </div>
      </dl>
      {weather.source === 'cache' && (
        <p className="weather-card__note">（キャッシュを表示中。オンラインで更新できます）</p>
      )}
    </section>
  );
}
