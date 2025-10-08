'use client';

import { FormEvent, useState } from 'react';

interface ToastState {
  message: string;
  tone: 'default' | 'danger' | 'success';
}

function normalizeTitle(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, '').trim();
  return withoutExtension || 'Оценка макета';
}

export function EvaluationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToast(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');

    if (!(file instanceof File) || file.size === 0) {
      setToast({ message: 'Выберите изображение макета перед отправкой.', tone: 'danger' });
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadResponse = await fetch(
        `/api/upload/layout?filename=${encodeURIComponent(file.name || 'layout.png')}`,
        {
          method: 'POST',
          body: file,
        },
      );

      if (!uploadResponse.ok) {
        throw new Error('Не удалось загрузить изображение макета.');
      }

      const uploadResult = (await uploadResponse.json()) as { url: string };
      const projectTitle = normalizeTitle(file.name || 'layout');

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layoutImageUrl: uploadResult.url,
          projectTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке макета на оценку.');
      }

      setToast({ message: 'Оценка запущена. Проверьте историю через минуту.', tone: 'success' });
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setToast({
        message:
          error instanceof Error ? error.message : 'Не удалось отправить макет на оценку. Попробуйте снова.',
        tone: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid" style={{ gap: '20px' }}>
      <form
        className="card"
        onSubmit={handleSubmit}
        style={{ display: 'grid', gap: '16px', border: '1px dashed rgba(59, 130, 246, 0.4)' }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px' }}>Макет</h3>
          <p style={{ margin: 0, color: 'rgba(15,23,42,0.6)', fontSize: '0.9rem' }}>
            Прикрепите изображение макета (JPEG, PNG, WEBP). После загрузки мы автоматически запустим проверку.
          </p>
        </div>
        <input name="file" type="file" accept="image/jpeg,image/png,image/webp" disabled={isSubmitting} />
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Отправляем...' : 'Отправить на проверку'}
        </button>
      </form>
      {toast && (
        <div className={`toast ${toast.tone === 'danger' ? 'danger' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
