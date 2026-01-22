import './globals.css';
import Providers from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Spectral, Montserrat } from 'next/font/google';

const spectral = Spectral({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-spectral',
  weight: ['500', '600', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600'],
});

export const metadata = {
  title: 'Scrylytics',
  description: 'Where data becomes destiny.',
  icons: {
    icon: [
      { url: '/icons/fire-favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/earth-favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/water-favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/air-favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icons/fire-favicon.svg',
    apple: '/icons/fire-favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body style={{ backgroundColor: '#0F1114', color: '#FFFFFF' }}>
        <Providers>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
