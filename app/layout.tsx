import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import './globals.css';
import { authOptions } from '../lib/auth-options';
import { ReactNode } from 'react';
import { Providers } from '../components/Providers';

export const metadata: Metadata = {
  title: 'Zero Defect Design Assistant',
  description:
    'AI-помощник для оценки макетов: общее качество, доступность, дизайн-системы и соответствие бизнес-целям.',
};

async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ru">
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}

export default RootLayout;
