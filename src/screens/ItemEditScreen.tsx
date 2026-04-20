import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ItemForm } from './ItemForm';
import { useApp } from '../store/appStore';

export function ItemEditScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = useApp((s) => s.items.find((i) => i.id === id));
  const updateItem = useApp((s) => s.updateItem);
  const deleteItem = useApp((s) => s.deleteItem);
  const duplicateItem = useApp((s) => s.duplicateItem);
  const archiveItem = useApp((s) => s.archiveItem);

  const initial = useMemo(() => item, [item]);

  if (!item || !initial) {
    return (
      <div className="screen">
        <header className="screen__header">
          <h1>見つかりません</h1>
        </header>
        <p>指定された服が見つかりませんでした。</p>
        <button className="btn btn--ghost" onClick={() => navigate('/closet')}>
          一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>服を編集</h1>
      </header>
      <ItemForm
        initial={initial}
        submitLabel="更新する"
        onSubmit={async (updated) => {
          await updateItem({ ...updated, id: item.id });
          navigate('/closet', { replace: true });
        }}
        onCancel={() => navigate(-1)}
      />

      <section className="card">
        <h2>その他の操作</h2>
        <div className="row row--wrap">
          <button
            className="btn btn--ghost"
            onClick={async () => {
              await duplicateItem(item.id);
            }}
          >
            似た服を追加（複製）
          </button>
          <button
            className="btn btn--ghost"
            onClick={async () => {
              await archiveItem(item.id, !item.archivedAt);
            }}
          >
            {item.archivedAt ? 'アーカイブ解除' : 'アーカイブ'}
          </button>
          <button
            className="btn btn--danger"
            onClick={async () => {
              if (!confirm('この服を削除しますか？')) return;
              await deleteItem(item.id);
              navigate('/closet', { replace: true });
            }}
          >
            削除
          </button>
        </div>
      </section>
    </div>
  );
}
