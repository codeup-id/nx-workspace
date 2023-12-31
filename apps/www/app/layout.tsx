import '#www/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import clsx from 'clsx';
import Provider from './provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeUP',
  description: 'Fullstack Developer since 2018',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={clsx(inter.className)}>
        <div className="flex flex-col min-h-screen justify-between">
          {children}
        </div>
      </body>
    </html>
  );
}
