import type { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { ReactQueryProvider } from '@/app/components/react-query-provider';

export const metadata: Metadata = {
  title: 'Sprint Rating System',
  description: 'Frontend for Sprint Rating System'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
