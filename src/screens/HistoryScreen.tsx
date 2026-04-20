import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/appStore';

export function HistoryScreen() {
  const items = useApp((s) => s.items);
  const wearLogs = useApp((s) => s.wearLogs);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof wearLogs>();
    for (const log of wearLogs) {
      const list = map.get(log.date) ?? [];
      list.push(log);
      map.set(log.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [wearLogs]);

  const freq = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of wearLogs) {
      for (const id of log.itemIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const arr = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    return arr.slice(0, 8);
  }, [wearLogs]);

  const itemName = (id: string) => items.find((i) => i.id === id)?.name ?? '(削除済み)';

  return (
    <div className="screen">
      <header className="screen__header">
        <h1>着用履歴</h1>
      </header>

      {wearLogs.length === 0 ? (
        <section className="card info-card">
          <p>まだ履歴はありません。ホームの「今日はこれ着た」ボタンから記録できます。</p>
          <Link to="/" className="btn btn--primary">
            ホームへ
          </Link>
        </section>
      ) : (
        <>
          <section className="card">
            <h2>よく着ている服</h2>
            <ol className="freq-list">
              {freq.map(([id, count]) => (
                <li key={id}>
                  <span>{itemName(id)}</span>
                  <span className="muted">{count}回</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card">
            <h2>日別の記録</h2>
            <ul className="history-list">
              {byDay.map(([date, logs]) => (
                <li key={date}>
                  <div className="history-list__date">{date}</div>
                  <ul>
                    {logs.map((l) => (
                      <li key={l.id} className="history-list__entry">
                        {l.itemIds.map((id) => itemName(id)).join(' / ')}
                        {l.note ? <span className="muted"> — {l.note}</span> : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
