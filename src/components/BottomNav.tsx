import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'ホーム', icon: '🌤' },
  { to: '/closet', label: '服一覧', icon: '👕' },
  { to: '/closet/add', label: '追加', icon: '＋', primary: true },
  { to: '/history', label: '履歴', icon: '📅' },
  { to: '/settings', label: '設定', icon: '⚙️' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="主要ナビゲーション">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            [
              'bottom-nav__item',
              item.primary ? 'bottom-nav__item--primary' : '',
              isActive ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')
          }
        >
          <span className="bottom-nav__icon" aria-hidden>
            {item.icon}
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
