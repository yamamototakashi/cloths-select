import { QUICK_COLORS } from '../utils/format';

export function ColorPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (hex: string) => {
    if (value.includes(hex)) onChange(value.filter((v) => v !== hex));
    else onChange([...value, hex]);
  };
  return (
    <div className="color-picker">
      {QUICK_COLORS.map((c) => {
        const active = value.includes(c.hex);
        return (
          <button
            key={c.hex}
            type="button"
            className={`color-picker__chip${active ? ' is-active' : ''}`}
            onClick={() => toggle(c.hex)}
            aria-pressed={active}
            aria-label={c.label}
            title={c.label}
          >
            <span className="color-picker__swatch" style={{ background: c.hex }} />
            <span className="color-picker__name">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
