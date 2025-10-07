import type { Metadata } from 'next';
import './globals.css';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Zero Defect Design Assistant',
  description:
    'AI-помощник для оценки макетов: общее качество, доступность, дизайн-системы и соответствие бизнес-целям.',
};

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

export default RootLayout;
