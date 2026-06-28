import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConsentBanner } from '@/components/layout/ConsentBanner';
import { MobileBottomBar } from '@/components/layout/MobileBottomBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { websiteLd, organizationLd } from '@/lib/seo/jsonld';
import { SITE_URL, SITE_NAME, REGION, DEFAULT_OG_IMAGE } from '@/lib/seo/meta';

const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
});

const HOME_TITLE = `Imóveis no ${REGION} | ${SITE_NAME}`;
const HOME_DESC =
  `Casas, apartamentos, terrenos e imóveis comerciais à venda e para alugar no ${REGION}. Anúncios de imobiliárias, corretores e particulares da região.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    'imóveis Oeste da Bahia', 'casas à venda', 'apartamentos para alugar',
    'terrenos', 'imóveis comerciais', 'imobiliárias', 'corretores',
    'Vitória da Conquista', 'Barreiras', 'Luís Eduardo Magalhães', 'Guanambi',
  ],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: 'pt_BR',
    type: 'website',
    url: SITE_URL,
    title: HOME_TITLE,
    description: HOME_DESC,
    images: [{ url: DEFAULT_OG_IMAGE, alt: `${SITE_NAME} — imóveis no ${REGION}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESC,
    images: [DEFAULT_OG_IMAGE],
  },
};

// Define o tema (claro/escuro) antes da página pintar, evitando o "flash".
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={interTight.variable}>
      <body className="font-sans antialiased pb-16 pt-[65px] md:pb-0">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <JsonLd data={websiteLd()} />
        <JsonLd data={organizationLd()} />
        <Header />
        {children}
        <Footer />
        <ConsentBanner />
        <MobileBottomBar />
      </body>
    </html>
  );
}
