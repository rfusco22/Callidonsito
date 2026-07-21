import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Callidonsito - Asistente de Equipos Pesados',
  description: 'Encuentra la máquina de equipos pesados perfecta con Callidonsito, tu asistente inteligente',
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
    <html lang="es">
      <body className="bg-dark text-light">{children}</body>
    </html>
  );
}