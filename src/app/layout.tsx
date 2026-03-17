import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgriNews Talent',
  description: 'Agricultural Employment Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

