import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos e condições de uso do portal 77Imóveis.',
  alternates: { canonical: '/termos' },
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed text-muted">
      <h1 className="text-2xl font-bold text-text">Termos de Uso</h1>
      <p>
        Ao usar o <strong>77Imóveis</strong>, você concorda com estes termos. O portal é um classificado
        que conecta anunciantes (imobiliárias, corretores e particulares) a interessados em imóveis na
        região do DDD 77, na Bahia.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Anúncios</h2>
      <p>
        O anunciante é o único responsável pela veracidade das informações, fotos e preços do imóvel.
        Anúncios falsos, duplicados ou que violem a lei podem ser removidos sem aviso. Reservamo-nos o
        direito de moderar e recusar conteúdo.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Responsabilidade</h2>
      <p>
        O 77Imóveis não é parte nas negociações entre usuários e não se responsabiliza por acordos,
        pagamentos ou prejuízos decorrentes de transações realizadas entre as partes.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Conta</h2>
      <p>
        Você é responsável por manter a confidencialidade da sua senha e por todas as atividades em sua
        conta. Contas Particulares permitem 1 imóvel ativo; planos profissionais ampliam o limite.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Contato</h2>
      <p>
        <a href="mailto:contato@77imoveis.com.br" className="text-primary">contato@77imoveis.com.br</a>
      </p>
    </main>
  );
}
