import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SNLE Study Compass',
  description: 'Original Saudi Nursing Licensure Examination revision practice.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
