import './globals.css';
import type { Metadata } from 'next';
import { Shippori_Mincho } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const shippori = Shippori_Mincho({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-shippori',
});

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
    <html lang="ja" className={shippori.variable}>
      <body className="font-serif min-h-screen bg-stone-50 text-stone-800">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
