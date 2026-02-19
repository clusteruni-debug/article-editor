'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from './ThemeProvider';
import { GlobalNav } from './GlobalNav';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <GlobalNav />
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
