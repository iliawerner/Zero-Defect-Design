'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      setError('Введите email и пароль.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Не удалось войти. Проверьте email и пароль.');
      return;
    }

    router.push('/dashboard');
  };

  const authError = searchParams?.get('error');

  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: 'min(420px, 90vw)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Zero Defect Design</h1>
        <p style={{ marginBottom: '1.5rem', color: 'rgba(15, 23, 42, 0.7)' }}>
          Войдите, чтобы управлять оценками макетов.
        </p>
        <form className="grid" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue="designer@example.com"
              autoComplete="email"
              inputMode="email"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              defaultValue="design123"
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>
          {(error || authError) && (
            <div className="badge danger" role="alert" style={{ justifyContent: 'center' }}>
              {error || 'Не удалось войти. Проверьте email и пароль.'}
            </div>
          )}
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(15, 23, 42, 0.6)' }}>
          Демо-аккаунт: designer@example.com / design123
        </p>
      </div>
    </main>
  );
}
