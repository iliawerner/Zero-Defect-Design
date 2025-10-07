'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { EvaluationSummary } from '../lib/types';

export function ChatList() {
  const [items, setItems] = useState<EvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/evaluations', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Не удалось загрузить список оценок');
        }
        return (await response.json()) as EvaluationSummary[];
      })
      .then(setItems)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  if (loading) {
    return <p style={{ color: 'rgba(15,23,42,0.6)' }}>Загрузка...</p>;
  }

  if (error) {
    return (
      <div className="badge danger" role="alert">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return <p style={{ color: 'rgba(15,23,42,0.6)' }}>Пока нет оценок. Создайте новую.</p>;
  }

  return (
    <div className="grid">
      {items.map((item) => (
        <Link key={item.id} href={`/dashboard/${item.id}`} className="card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title}</h3>
              <p style={{ margin: '4px 0 12px', color: 'rgba(15,23,42,0.6)' }}>{item.projectSummary}</p>
            </div>
            <span className={`badge ${item.status === 'complete' ? 'success' : 'neutral'}`}>
              {item.status === 'complete' ? 'Готово' : 'В обработке'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {item.scores.map((score) => (
              <span key={score.label} className="badge neutral">
                {score.label}: {score.value}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
