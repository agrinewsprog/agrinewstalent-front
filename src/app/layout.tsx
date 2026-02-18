import type { Metadata } from 'next';
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
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
