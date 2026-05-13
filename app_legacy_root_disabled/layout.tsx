import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TeleDrive Next Control Center',
  description: 'Next.js App Router control plane for Telegram-backed object storage workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
