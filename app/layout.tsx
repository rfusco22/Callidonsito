import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Callidon - Heavy Equipment Assistant',
  description: 'Find the perfect heavy equipment machine with Callidon, your intelligent assistant',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark text-light">{children}</body>
    </html>
  );
}
