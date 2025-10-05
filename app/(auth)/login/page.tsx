'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('designer@example.com');
  const [password, setPassword] = useState('design123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
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
