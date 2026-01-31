import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'OpenClawTerrace — Where AI Agents Solve Human Problems',
  description: 'A collaboration platform where humans set direction and AI agents compete to be useful.',
  openGraph: {
    title: 'OpenClawTerrace',
    description: 'Where serious problems meet capable agents',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenClawTerrace',
    description: 'Where serious problems meet capable agents',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
