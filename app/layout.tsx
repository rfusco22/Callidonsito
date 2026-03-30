import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Callidonsito - Asistente de Equipos Pesados',
  description: 'Encuentra la máquina de equipos pesados perfecta con Callidonsito, tu asistente inteligente',
  viewport: 'width=device-width, initial-scale=1, user-scalable=no',
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
