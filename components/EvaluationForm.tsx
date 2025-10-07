'use client';

import { FormEvent, useState } from 'react';

interface ToastState {
  message: string;
  tone: 'default' | 'danger' | 'success';
}

export function EvaluationForm() {
  const [designSystemUrl, setDesignSystemUrl] = useState<string>('');
  const [layoutImageUrl, setLayoutImageUrl] = useState<string>('');
  const [structureJson, setStructureJson] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const [businessGoalSuggestion, setBusinessGoalSuggestion] = useState<string | null>(null);
  const [needsGoalConfirmation, setNeedsGoalConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleUpload = async (event: FormEvent<HTMLFormElement>, type: 'design-system' | 'layout') => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return;
    }

    try {
      const endpoint = type === 'design-system' ? '/api/upload/design-system' : '/api/upload/layout';
      const response = await fetch(`${endpoint}?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить файл');
      }

      const result = await response.json();
      if (type === 'design-system') {
        setDesignSystemUrl(result.url);
      } else {
        setLayoutImageUrl(result.url);
      }
      setToast({ message: 'Файл загружен', tone: 'success' });
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setToast({ message: 'Ошибка загрузки файла', tone: 'danger' });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectTitle,
          projectBrief,
          structureJson,
          designSystemUrl,
          layoutImageUrl,
        }),
      });

      if (response.status === 409) {
        setToast({ message: 'JSON и макет не совпадают. Попробуйте снова.', tone: 'danger' });
        return;
      }

      if (response.status === 428) {
        const payload = await response.json();
        setBusinessGoalSuggestion(payload.businessGoal);
        setNeedsGoalConfirmation(true);
        if (payload.businessGoal) {
          setProjectBrief(payload.businessGoal);
        }
        setToast({ message: 'Мы уточнили бизнес-задачу. Подтвердите или исправьте.', tone: 'default' });
        return;
      }

      if (!response.ok) {
        throw new Error('Ошибка при отправке на оценку');
      }

      setToast({ message: 'Оценка запущена. Обновите список через минуту.', tone: 'success' });
      setBusinessGoalSuggestion(null);
      setNeedsGoalConfirmation(false);
      setProjectTitle('');
      setProjectBrief('');
      setStructureJson('');
      setDesignSystemUrl('');
      setLayoutImageUrl('');
    } catch (error) {
      console.error(error);
      setToast({ message: 'Не удалось запустить оценку', tone: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmGoal = async (useSuggestion: boolean) => {
    if (!businessGoalSuggestion && useSuggestion) return;
    setIsSubmitting(true);
    try {
      const briefToUse = useSuggestion && businessGoalSuggestion ? businessGoalSuggestion : projectBrief;
      const response = await fetch('/api/evaluations?confirmGoal=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle,
          projectBrief: briefToUse,
          structureJson,
          designSystemUrl,
          layoutImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при подтверждении цели');
      }

      setToast({ message: 'Оценка запущена. Обновите список через минуту.', tone: 'success' });
      setBusinessGoalSuggestion(null);
      setNeedsGoalConfirmation(false);
      setProjectTitle('');
      setProjectBrief('');
      setStructureJson('');
      setDesignSystemUrl('');
      setLayoutImageUrl('');
    } catch (error) {
      console.error(error);
      setToast({ message: 'Не удалось запустить оценку', tone: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '32px' }}>
      <div className="grid two">
        <form className="card" onSubmit={(event) => handleUpload(event, 'design-system')}
          style={{ display: 'grid', gap: '16px', border: '1px dashed rgba(59, 130, 246, 0.4)' }}>
          <div>
            <h3 style={{ margin: '0 0 4px' }}>Дизайн-система</h3>
            <p style={{ margin: 0, color: 'rgba(15,23,42,0.6)', fontSize: '0.9rem' }}>
              Загрузите файл .md, .txt, .pdf или .doc, если он есть. Это поле опционально.
            </p>
          </div>
          <input name="file" type="file" accept=".md,.txt,.pdf,.doc,.docx" />
          <button className="button secondary" type="submit">
            {designSystemUrl ? 'Заменить дизайн-систему' : 'Загрузить дизайн-систему'}
          </button>
          {designSystemUrl && (
            <a href={designSystemUrl} target="_blank" rel="noreferrer" className="badge">
              Открыть текущий файл
            </a>
          )}
        </form>
        <form className="card" onSubmit={(event) => handleUpload(event, 'layout')}
          style={{ display: 'grid', gap: '16px', border: '1px dashed rgba(59, 130, 246, 0.4)' }}>
          <div>
            <h3 style={{ margin: '0 0 4px' }}>Макет</h3>
            <p style={{ margin: 0, color: 'rgba(15,23,42,0.6)', fontSize: '0.9rem' }}>
              Прикрепите изображение макета (JPEG, PNG, WEBP), можно пропустить на этапе тестирования.
            </p>
          </div>
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp" />
          <button className="button secondary" type="submit">
            {layoutImageUrl ? 'Заменить макет' : 'Загрузить макет'}
          </button>
          {layoutImageUrl && (
            <a href={layoutImageUrl} target="_blank" rel="noreferrer" className="badge">
              Просмотреть изображение
            </a>
          )}
        </form>
      </div>
      <form className="grid" onSubmit={handleSubmit} style={{ gap: '20px' }}>
        <div>
          <label htmlFor="projectTitle">Название или краткий тег</label>
          <input
            id="projectTitle"
            value={projectTitle}
            onChange={(event) => setProjectTitle(event.target.value)}
            placeholder="Например, Лендинг Zero Defect Design"
          />
        </div>
        <div>
          <label htmlFor="projectBrief">Техническое задание (бизнес-задача)</label>
          <textarea
            id="projectBrief"
            value={projectBrief}
            onChange={(event) => setProjectBrief(event.target.value)}
            placeholder="Опишите, что должно решать этот макет. Поле можно оставить пустым."
          />
        </div>
        <div>
          <label htmlFor="structureJson">JSON макета</label>
          <textarea
            id="structureJson"
            value={structureJson}
            onChange={(event) => setStructureJson(event.target.value)}
            placeholder='{"screens": [...], "components": [...]} (можно без JSON)'
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span className={`badge ${designSystemUrl ? 'success' : 'neutral'}`}>
            Дизайн-система {designSystemUrl ? 'готова' : 'не загружена'}
          </span>
          <span className={`badge ${layoutImageUrl ? 'success' : 'neutral'}`}>
            Макет {layoutImageUrl ? 'загружен' : 'не загружен'}
          </span>
        </div>
        <p style={{ margin: 0, color: 'rgba(15,23,42,0.65)', fontSize: '0.85rem' }}>
          Все поля можно заполнить частично или оставить пустыми — это удобно для демонстрации.
        </p>
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Запускаем оценку...' : 'Запустить оценку'}
        </button>
      </form>
      {needsGoalConfirmation && businessGoalSuggestion && (
        <div className="card" style={{ background: 'rgba(59,130,246,0.08)' }}>
          <h3 style={{ marginTop: 0 }}>Мы определили бизнес-задачу</h3>
          <p style={{ marginBottom: '1rem' }}>{businessGoalSuggestion}</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" className="button" onClick={() => handleConfirmGoal(true)} disabled={isSubmitting}>
              Подтвердить
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => handleConfirmGoal(false)}
              disabled={isSubmitting}
            >
              Продолжить с моим текстом
            </button>
          </div>
        </div>
      )}
      {toast && (
        <div className={`toast ${toast.tone === 'danger' ? 'danger' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
