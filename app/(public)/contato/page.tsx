import { Mail, MessageCircle } from 'lucide-react';
import { pageMetadata, REGION } from '@/lib/seo/meta';

export const metadata = pageMetadata({
  title: 'Contato',
  description: `Fale com a equipe do 77Imóveis, o portal imobiliário do ${REGION}. Tire dúvidas, envie sugestões ou peça suporte por e-mail ou WhatsApp.`,
  path: '/contato',
});

export default function ContatoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">Contato</h1>
      <p className="mb-6 text-muted">Dúvidas, sugestões ou suporte? Fale com a gente.</p>
      <div className="space-y-3">
        <a href="mailto:contato@77imoveis.com.br" className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:bg-bg">
          <Mail size={20} className="text-primary" />
          <span>contato@77imoveis.com.br</span>
        </a>
        <a href="https://wa.me/5577999999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:bg-bg">
          <MessageCircle size={20} className="text-[#1FA855]" />
          <span>WhatsApp</span>
        </a>
      </div>
    </main>
  );
}
