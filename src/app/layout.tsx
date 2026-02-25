import type { Metadata } from 'next';
import { PublicFooter } from '@/src/components/layout/PublicFooter';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgriNews Talent - Plataforma de Empleo Agro',
  description: 'Conectamos talento con empresas del sector agrícola',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <div className="flex-1">{children}</div>
        <PublicFooter />
      </body>
    </html>
  );
}
