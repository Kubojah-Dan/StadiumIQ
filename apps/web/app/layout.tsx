import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';

export const metadata: Metadata = {
  title: 'StadiumIQ | Realtime Crowd Intelligence',
  description: 'AI-Powered Crowd Intelligence Platform for Large-Scale Sporting Venues',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
