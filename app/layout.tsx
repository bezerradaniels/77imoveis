import type { Metadata } from 'next';
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
