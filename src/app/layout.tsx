import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';

export const metadata: Metadata = {
  title: 'Classly — Learn Together. Grow Anywhere.',
  description: 'Online tutoring marketplace connecting K-12 students with rigorously verified, experienced educators for 1-on-1 tutoring and interactive online masterclasses.',
  keywords: ['online tutoring', 'K-12 math tutor', 'AP calculus tutor', 'physics tutor', 'find a tutor', 'US online learning'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col bg-offwhite text-charcoal-800 antialiased">
        <ScrollProgressBar />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
