import { Link } from 'react-router-dom';
import type { ClothingItem } from '../types';
import { blobUrl } from '../utils/image';
import { CATEGORY_LABEL, STYLE_LABEL, THICKNESS_LABEL } from '../utils/format';

export function ItemCard({ item }: { item: ClothingItem }) {
  const url = blobUrl(item.imageBlob);
  const primaryColor = item.colors[0] ?? '#cccccc';
  return (
    <Link to={`/closet/${item.id}`} className={`item-card${item.archivedAt ? ' is-archived' : ''}`}>
      <div className="item-card__thumb" style={{ background: primaryColor }}>
        {url ? (
          <img src={url} alt={item.name} loading="lazy" />
        ) : (
          <span className="item-card__noimg">{CATEGORY_LABEL[item.category]}</span>
        )}
        {item.favorite && <span className="item-card__fav" aria-hidden>★</span>}
      </div>
      <div className="item-card__body">
        <div className="item-card__name">{item.name || '(無題)'}</div>
        <div className="item-card__meta">
          {CATEGORY_LABEL[item.category]} / {THICKNESS_LABEL[item.thickness]} / {STYLE_LABEL[item.styleLevel]}
        </div>
      </div>
    </Link>
  );
}
