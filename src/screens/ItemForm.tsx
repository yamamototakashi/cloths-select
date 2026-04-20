import { useEffect, useRef, useState } from 'react';
import { ColorPicker } from '../components/ColorPicker';
import type { ClothingCategory, ClothingItem, Season, StyleLevel, Thickness, WaterproofLevel } from '../types';
import {
  CATEGORY_LABEL,
  QUICK_COLORS,
  SEASON_LABEL,
  STYLE_LABEL,
  THICKNESS_LABEL,
  WATERPROOF_LABEL,
} from '../utils/format';
import { blobUrl, resizeImageFile } from '../utils/image';

export interface ItemFormProps {
  initial?: Partial<ClothingItem>;
  onSubmit: (item: ClothingItem) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

function toClothing(base: Partial<ClothingItem>): ClothingItem {
  const now = Date.now();
  return {
    id: base.id ?? `item-${Math.random().toString(36).slice(2, 10)}-${now.toString(36)}`,
    name: base.name ?? '',
    category: base.category ?? 'tops',
    subCategory: base.subCategory,
    seasons: base.seasons ?? ['all'],
    thickness: base.thickness ?? 'normal',
    colors: base.colors ?? ['#111111'],
    styleLevel: base.styleLevel ?? 'casual',
    waterproofLevel: base.waterproofLevel ?? 'none',
    favorite: base.favorite ?? false,
    imageBlob: base.imageBlob,
    notes: base.notes,
    createdAt: base.createdAt ?? now,
    updatedAt: now,
    archivedAt: base.archivedAt,
  };
}

function deriveName(category: ClothingCategory, colorHex?: string): string {
  const col = QUICK_COLORS.find((c) => c.hex === colorHex);
  return `${col ? col.label : ''} ${CATEGORY_LABEL[category]}`.trim();
}

const CATEGORIES: ClothingCategory[] = ['tops', 'bottoms', 'outer', 'onepiece', 'shoes', 'bag', 'accessory'];
const SEASONS: Season[] = ['all', 'spring', 'summer', 'autumn', 'winter'];
const THICKNESSES: Thickness[] = ['thin', 'normal', 'thick'];
const STYLES: StyleLevel[] = ['casual', 'smart', 'business', 'formal'];
const WATERPROOFS: WaterproofLevel[] = ['none', 'some', 'strong'];

export function ItemForm({ initial, onSubmit, onCancel, submitLabel = '保存' }: ItemFormProps) {
  const [item, setItem] = useState<ClothingItem>(toClothing(initial ?? {}));
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameWasAutoRef = useRef<boolean>(!initial?.name);

  useEffect(() => {
    if (nameWasAutoRef.current) {
      const auto = deriveName(item.category, item.colors[0]);
      setItem((i) => ({ ...i, name: i.name && !nameWasAutoRef.current ? i.name : auto }));
    }
  }, [item.category, item.colors]);

  const set = <K extends keyof ClothingItem>(key: K, value: ClothingItem[K]) => {
    setItem((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSeason = (s: Season) => {
    const has = item.seasons.includes(s);
    const next = has ? item.seasons.filter((x) => x !== s) : [...item.seasons, s];
    if (s === 'all' && !has) set('seasons', ['all']);
    else set('seasons', next.filter((x) => (s === 'all' ? true : x !== 'all')));
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const blob = await resizeImageFile(f);
      set('imageBlob', blob);
    } catch {
      // fallback to raw file
      set('imageBlob', f);
    }
  };

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    const final = toClothing({ ...item, name: item.name || deriveName(item.category, item.colors[0]) });
    await onSubmit(final);
    setSaving(false);
  };

  const preview = blobUrl(item.imageBlob);

  return (
    <form
      className="item-form"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <section className="card">
        <div className="item-form__image-row">
          <div className="item-form__preview">
            {preview ? (
              <img src={preview} alt="preview" />
            ) : (
              <span className="muted">写真なし</span>
            )}
          </div>
          <div className="item-form__image-actions">
            <button type="button" className="btn btn--ghost btn--small" onClick={() => fileInputRef.current?.click()}>
              写真を選ぶ
            </button>
            {item.imageBlob && (
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => set('imageBlob', undefined)}
              >
                写真を外す
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={onFileChange}
            />
          </div>
        </div>
        <label className="field">
          <span>名前</span>
          <input
            type="text"
            value={item.name}
            placeholder="例: 黒パーカー"
            onChange={(e) => {
              nameWasAutoRef.current = false;
              set('name', e.target.value);
            }}
          />
        </label>
      </section>

      <section className="card">
        <fieldset className="field">
          <legend>カテゴリ</legend>
          <div className="chip-row chip-row--scroll">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip chip--big ${item.category === c ? 'is-active' : ''}`}
                onClick={() => set('category', c)}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>季節</legend>
          <div className="chip-row">
            {SEASONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${item.seasons.includes(s) ? 'is-active' : ''}`}
                onClick={() => toggleSeason(s)}
              >
                {SEASON_LABEL[s]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>厚み</legend>
          <div className="chip-row">
            {THICKNESSES.map((t) => (
              <button
                key={t}
                type="button"
                className={`chip ${item.thickness === t ? 'is-active' : ''}`}
                onClick={() => set('thickness', t)}
              >
                {THICKNESS_LABEL[t]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>色</legend>
          <ColorPicker value={item.colors} onChange={(next) => set('colors', next.length ? next : ['#111111'])} />
        </fieldset>

        <fieldset className="field">
          <legend>スタイル</legend>
          <div className="chip-row">
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${item.styleLevel === s ? 'is-active' : ''}`}
                onClick={() => set('styleLevel', s)}
              >
                {STYLE_LABEL[s]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>防水</legend>
          <div className="chip-row">
            {WATERPROOFS.map((w) => (
              <button
                key={w}
                type="button"
                className={`chip ${item.waterproofLevel === w ? 'is-active' : ''}`}
                onClick={() => set('waterproofLevel', w)}
              >
                {WATERPROOF_LABEL[w]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="row row--between field">
          <span>お気に入り</span>
          <input
            type="checkbox"
            checked={item.favorite}
            onChange={(e) => set('favorite', e.target.checked)}
          />
        </label>

        <label className="field">
          <span>メモ</span>
          <textarea
            value={item.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="購入時期や合わせるアイテムなど（任意）"
          />
        </label>
      </section>

      <div className="screen__footer screen__footer--split">
        {onCancel && (
          <button type="button" className="btn btn--ghost btn--wide" onClick={onCancel}>
            キャンセル
          </button>
        )}
        <button type="submit" className="btn btn--primary btn--wide" disabled={saving}>
          {saving ? '保存中…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
