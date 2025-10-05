'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import type { Session } from 'next-auth';

interface ProvidersProps {
  session: Session | null;
  children: ReactNode;
}

export function Providers({ session, children }: ProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
