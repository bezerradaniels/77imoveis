import type { Metadata } from 'next';

// Páginas de autenticação (entrar/cadastro): sem valor de SEO e exigem ação
// do usuário — marcadas como noindex para não competirem nos resultados.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
