import type { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { ReactQueryProvider } from '@/app/components/react-query-provider';
import { ThemeProvider } from '@/app/components/theme-provider';

export const metadata: Metadata = {
  title: 'Sprint Rating System',
  description: 'Frontend for Sprint Rating System'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint to avoid theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark')}catch(e){}`
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
