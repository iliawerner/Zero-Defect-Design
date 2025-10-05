'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export function Header() {
  const { data } = useSession();

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(148, 163, 184, 0.35)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0' }}>
        <Link href="/dashboard" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          Zero Defect Design
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {data?.user?.name && <span style={{ fontSize: '0.9rem', color: 'rgba(15,23,42,0.7)' }}>{data.user.name}</span>}
          <button className="button secondary" onClick={() => signOut({ callbackUrl: '/login' })}>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
