import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/appStore';
import { exportAll, importAll, clearWearLogs } from '../db/db';
import { weatherService } from '../hooks/useWeather';
import type { ThermalPreference, UserProfile } from '../types';

const THERMAL_OPTIONS: { value: ThermalPreference; label: string }[] = [
  { value: 'very_cold', label: 'とても寒がり' },
  { value: 'cold', label: '寒がり' },
  { value: 'normal', label: '普通' },
  { value: 'hot', label: '暑がり' },
  { value: 'very_hot', label: 'とても暑がり' },
];

export function SettingsScreen() {
  const profile = useApp((s) => s.profile);
  const updateProfile = useApp((s) => s.updateProfile);
  const refreshWearLogs = useApp((s) => s.refreshWearLogs);
  const hydrate = useApp((s) => s.hydrate);
  const navigate = useNavigate();

  const [cityQuery, setCityQuery] = useState(profile?.location.name ?? '');
  const [results, setResults] = useState<Array<{ id: number | string; name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone?: string }>>([]);
  const [status, setStatus] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  if (!profile) return null;

  const setProfile = (patch: Partial<UserProfile>) => {
    void updateProfile(patch);
  };

  const searchLocation = async () => {
    if (!cityQuery.trim()) return;
    try {
      const r = await weatherService.searchLocation(cityQuery);
      setResults(r);
    } catch {
      setResults([]);
    }
  };

  const onExport = async () => {
    const json = await exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `closet-weather-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('エクスポートしました');
    setTimeout(() => setStatus(null), 2000);
  };

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    try {
      await importAll(text);
      await hydrate();
      setStatus('インポートしました');
    } catch {
      setStatus('インポートに失敗しました');
    }
    setTimeout(() => setStatus(null), 2200);
  };

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>設定</h1>
      </header>

      <section className="card">
        <h2>表示名</h2>
        <input
          type="text"
          value={profile.displayName ?? ''}
          onChange={(e) => setProfile({ displayName: e.target.value })}
          placeholder="任意"
        />
      </section>

      <section className="card">
        <h2>地域</h2>
        <div className="chip-row">
          <button
            className={`chip ${profile.location.mode === 'name' ? 'is-active' : ''}`}
            onClick={() => setProfile({ location: { ...profile.location, mode: 'name' } })}
          >
            地名で指定
          </button>
          <button
            className={`chip ${profile.location.mode === 'gps' ? 'is-active' : ''}`}
            onClick={() => setProfile({ location: { ...profile.location, mode: 'gps' } })}
          >
            現在地
          </button>
        </div>
        {profile.location.mode !== 'gps' && (
          <div className="field">
            <div className="row">
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="都市名"
              />
              <button className="btn btn--ghost" onClick={searchLocation}>
                検索
              </button>
            </div>
            {results.length > 0 && (
              <ul className="search-results">
                {results.map((r) => (
                  <li key={`${r.id}`}>
                    <button
                      className="btn btn--ghost btn--small"
                      onClick={() => {
                        setProfile({
                          location: {
                            mode: 'name',
                            name: r.name,
                            latitude: r.latitude,
                            longitude: r.longitude,
                            timezone: r.timezone,
                          },
                        });
                        setResults([]);
                        setCityQuery(r.name);
                      }}
                    >
                      {r.name}
                      {r.admin1 ? ` / ${r.admin1}` : ''}
                      {r.country ? ` (${r.country})` : ''}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="muted">
              現在: {profile.location.name ?? '—'} ({profile.location.latitude?.toFixed(2)},{' '}
              {profile.location.longitude?.toFixed(2)})
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>気温表示単位</h2>
        <div className="chip-row">
          <button
            className={`chip ${profile.temperatureUnit === 'c' ? 'is-active' : ''}`}
            onClick={() => setProfile({ temperatureUnit: 'c' })}
          >
            ℃
          </button>
          <button
            className={`chip ${profile.temperatureUnit === 'f' ? 'is-active' : ''}`}
            onClick={() => setProfile({ temperatureUnit: 'f' })}
          >
            °F
          </button>
        </div>
      </section>

      <section className="card">
        <h2>暑がり / 寒がり</h2>
        <div className="chip-row">
          {THERMAL_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`chip ${profile.thermalPreference === o.value ? 'is-active' : ''}`}
              onClick={() => setProfile({ thermalPreference: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>雨対策の重視度</h2>
        <div className="chip-row">
          {(
            [
              { v: 'weak', l: '強め（雨に弱い）' },
              { v: 'normal', l: '普通' },
              { v: 'strong', l: '弱め（雨に強い）' },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              className={`chip ${profile.rainTolerance === o.v ? 'is-active' : ''}`}
              onClick={() => setProfile({ rainTolerance: o.v })}
            >
              {o.l}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>スタイル重視度</h2>
        <div className="chip-row">
          {(
            [
              { v: 'casual', l: 'カジュアル' },
              { v: 'balanced', l: 'バランス' },
              { v: 'formal', l: 'きちんと' },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              className={`chip ${profile.stylePreference === o.v ? 'is-active' : ''}`}
              onClick={() => setProfile({ stylePreference: o.v })}
            >
              {o.l}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>最近着た服を避ける度合い</h2>
        <div className="chip-row">
          {[0, 1, 2, 3, 5, 7].map((d) => (
            <button
              key={d}
              className={`chip ${profile.avoidRecentlyWornDays === d ? 'is-active' : ''}`}
              onClick={() => setProfile({ avoidRecentlyWornDays: d })}
            >
              {d === 0 ? '避けない' : `${d}日間避ける`}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>通知</h2>
        <p className="muted">
          通知機能は今後追加予定です。現状UIのみ用意しています。
        </p>
        <label className="row row--between">
          <span>朝の服装通知</span>
          <input type="checkbox" disabled />
        </label>
      </section>

      <section className="card">
        <h2>データ</h2>
        <div className="row row--wrap">
          <button className="btn btn--ghost" onClick={onExport}>
            エクスポート
          </button>
          <button className="btn btn--ghost" onClick={() => importRef.current?.click()}>
            インポート
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={onImportFile}
          />
          <button
            className="btn btn--ghost"
            onClick={async () => {
              if (!confirm('着用履歴をすべて削除しますか？（服の情報は残ります）')) return;
              await clearWearLogs();
              await refreshWearLogs();
              setStatus('履歴をリセットしました');
              setTimeout(() => setStatus(null), 1600);
            }}
          >
            着用履歴をリセット
          </button>
          <button className="btn btn--ghost" onClick={() => navigate('/setup')}>
            初回セットアップをやり直す
          </button>
        </div>
        {status && <p className="muted">{status}</p>}
      </section>
    </div>
  );
}
