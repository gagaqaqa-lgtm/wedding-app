import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'THE GRAND GARDEN',
  description: 'Guest Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
