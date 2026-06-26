import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConsentBanner } from '@/components/layout/ConsentBanner';
import { MobileBottomBar } from '@/components/layout/MobileBottomBar';
import { getFeaturedCities, getPropertyTypes } from '@/lib/data';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: '77Imóveis | Imóveis no DDD 77 - Bahia',
    template: '%s | 77Imóveis',
  },
  description:
    'Casas, apartamentos, terrenos e imóveis rurais à venda e para alugar nas cidades do DDD 77, na Bahia.',
  icons: {
    icon: '/logo.svg',
  },
  openGraph: { siteName: '77Imóveis', locale: 'pt_BR', type: 'website' },
};

// Define o tema (claro/escuro) antes da página pintar, evitando o "flash".
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [cities, types] = await Promise.all([getFeaturedCities(), getPropertyTypes()]);
  const cityOpts = cities.map((c: any) => ({ value: c.slug, label: c.name }));
  const typeOpts = types.map((t: any) => ({ value: t.slug, label: t.name }));

  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.className}>
      <body className="font-sans antialiased pb-16 md:pb-0">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Header cities={cityOpts} types={typeOpts} />
        {children}
        <Footer />
        <ConsentBanner />
        <MobileBottomBar />
      </body>
    </html>
  );
}
