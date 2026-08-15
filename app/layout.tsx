import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nurse Quest',
  description: 'A cheerful SNLE and PNLE study companion with original practice questions.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
