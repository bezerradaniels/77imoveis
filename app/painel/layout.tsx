import type { Metadata } from 'next';

// Área logada (painel do anunciante): nunca deve ser indexada por buscadores.
// Definir aqui cobre TODAS as páginas filhas (/painel/*) de uma só vez.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
