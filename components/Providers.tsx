'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './auth';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
