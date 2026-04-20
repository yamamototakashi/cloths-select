import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/appStore';
import { DEFAULT_PROFILE } from '../utils/defaults';
import { weatherService } from '../hooks/useWeather';
import type { ThermalPreference, UserProfile } from '../types';

const THERMAL_OPTIONS: { value: ThermalPreference; label: string }[] = [
  { value: 'very_cold', label: 'とても寒がり' },
  { value: 'cold', label: '寒がり' },
  { value: 'normal', label: '普通' },
  { value: 'hot', label: '暑がり' },
  { value: 'very_hot', label: 'とても暑がり' },
];

export function SetupScreen() {
  const navigate = useNavigate();
  const completeSetup = useApp((s) => s.completeSetup);
  const existing = useApp((s) => s.profile);

  const [profile, setProfile] = useState<UserProfile>(
    existing ? { ...existing, setupCompleted: false } : { ...DEFAULT_PROFILE },
  );
  const [locationMode, setLocationMode] = useState<'gps' | 'name'>(profile.location.mode === 'gps' ? 'gps' : 'name');
  const [cityQuery, setCityQuery] = useState(profile.location.name ?? '東京');
  const [searchResults, setSearchResults] = useState<Array<{ id: number | string; name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone?: string }>>([]);
  const [seedDemo, setSeedDemo] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const updateProfile = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const searchLocation = async () => {
    try {
      const results = await weatherService.searchLocation(cityQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    const next: UserProfile = { ...profile };
    if (locationMode === 'gps') {
      next.location = { ...next.location, mode: 'gps' };
    } else if (next.location.latitude == null || next.location.longitude == null) {
      next.location = { ...next.location, mode: 'name', name: cityQuery };
    } else {
      next.location = { ...next.location, mode: 'name' };
    }
    await completeSetup(next, { seedDemo });
    setSubmitting(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="screen setup">
      <header className="screen__header">
        <h1>はじめに設定</h1>
        <p className="muted">あとから何度でも編集できます。全部スキップしてもOKです。</p>
      </header>

      <section className="card">
        <label className="field">
          <span>表示名（任意）</span>
          <input
            type="text"
            value={profile.displayName ?? ''}
            onChange={(e) => updateProfile('displayName', e.target.value)}
            placeholder="例: ゆき"
          />
        </label>

        <fieldset className="field">
          <legend>暑がり / 寒がり</legend>
          <div className="chip-row">
            {THERMAL_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`chip ${profile.thermalPreference === o.value ? 'is-active' : ''}`}
                onClick={() => updateProfile('thermalPreference', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>雨への強さ</legend>
          <div className="chip-row">
            {(
              [
                { v: 'weak', l: '雨に弱い' },
                { v: 'normal', l: '普通' },
                { v: 'strong', l: '雨に平気' },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                className={`chip ${profile.rainTolerance === o.v ? 'is-active' : ''}`}
                onClick={() => updateProfile('rainTolerance', o.v)}
              >
                {o.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>スタイル傾向</legend>
          <div className="chip-row">
            {(
              [
                { v: 'casual', l: 'カジュアル' },
                { v: 'balanced', l: 'きれいめ寄り' },
                { v: 'formal', l: 'フォーマル寄り' },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                className={`chip ${profile.stylePreference === o.v ? 'is-active' : ''}`}
                onClick={() => updateProfile('stylePreference', o.v)}
              >
                {o.l}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>通勤</legend>
          <div className="chip-row">
            <button
              type="button"
              className={`chip ${!profile.commute ? 'is-active' : ''}`}
              onClick={() => updateProfile('commute', false)}
            >
              通勤なし
            </button>
            <button
              type="button"
              className={`chip ${profile.commute ? 'is-active' : ''}`}
              onClick={() => updateProfile('commute', true)}
            >
              通勤あり
            </button>
          </div>
          {profile.commute && (
            <div className="chip-row" style={{ marginTop: 8 }}>
              {(
                [
                  { v: 'walk', l: '徒歩' },
                  { v: 'bike', l: '自転車' },
                  { v: 'car', l: '車' },
                  { v: 'train', l: '電車' },
                  { v: 'mixed', l: '複合' },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  className={`chip ${profile.commuteMode === o.v ? 'is-active' : ''}`}
                  onClick={() => updateProfile('commuteMode', o.v)}
                >
                  {o.l}
                </button>
              ))}
            </div>
          )}
        </fieldset>
      </section>

      <section className="card">
        <h2>地域設定</h2>
        <div className="chip-row">
          <button
            type="button"
            className={`chip ${locationMode === 'name' ? 'is-active' : ''}`}
            onClick={() => setLocationMode('name')}
          >
            地名で指定
          </button>
          <button
            type="button"
            className={`chip ${locationMode === 'gps' ? 'is-active' : ''}`}
            onClick={() => setLocationMode('gps')}
          >
            現在地（GPS）
          </button>
        </div>

        {locationMode === 'name' && (
          <div className="field">
            <label>
              <span>都市名（例: Tokyo, 大阪, Kyoto）</span>
              <div className="row">
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="都市名"
                />
                <button type="button" className="btn btn--ghost" onClick={searchLocation}>
                  検索
                </button>
              </div>
            </label>
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((r) => (
                  <li key={`${r.id}`}>
                    <button
                      type="button"
                      className="btn btn--ghost btn--small"
                      onClick={() => {
                        updateProfile('location', {
                          mode: 'name',
                          name: r.name,
                          latitude: r.latitude,
                          longitude: r.longitude,
                          timezone: r.timezone,
                        });
                        setCityQuery(r.name);
                        setSearchResults([]);
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
              選択中: {profile.location.name ?? '—'} ({profile.location.latitude?.toFixed(2)},{' '}
              {profile.location.longitude?.toFixed(2)})
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <label className="row row--between">
          <span>サンプル服を少し入れておく</span>
          <input
            type="checkbox"
            checked={seedDemo}
            onChange={(e) => setSeedDemo(e.target.checked)}
          />
        </label>
        <p className="muted">チェックすると、白Tシャツ/デニム/スニーカーなどが数点登録されます。いつでも削除できます。</p>
      </section>

      <div className="screen__footer">
        <button className="btn btn--primary btn--wide" disabled={submitting} onClick={submit}>
          {submitting ? '保存中…' : 'はじめる'}
        </button>
      </div>
    </div>
  );
}
