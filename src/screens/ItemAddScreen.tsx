import { useNavigate } from 'react-router-dom';
import { ItemForm } from './ItemForm';
import { useApp } from '../store/appStore';

export function ItemAddScreen() {
  const navigate = useNavigate();
  const addItem = useApp((s) => s.addItem);
  return (
    <div className="screen">
      <header className="screen__header">
        <h1>服を追加</h1>
      </header>
      <ItemForm
        onSubmit={async (item) => {
          await addItem(item);
          navigate('/closet', { replace: true });
        }}
        onCancel={() => navigate(-1)}
        submitLabel="登録する"
      />
    </div>
  );
}
