import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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
  openGraph: { siteName: '77Imóveis', locale: 'pt_BR', type: 'website' },
};

// Define o tema (claro/escuro) antes da página pintar, evitando o "flash".
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.className}>
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
