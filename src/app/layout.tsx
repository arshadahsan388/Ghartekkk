
import type { Metadata } from 'next';
import './globals.css';
import { PT_Sans } from 'next/font/google';
import AppLayout from './AppLayout';


const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Pak Delivers',
  description: 'Your favorite food and groceries, delivered.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ptSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-background flex flex-col">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
