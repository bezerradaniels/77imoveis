import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como o 77Imóveis coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
  alternates: { canonical: '/privacidade' },
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed text-muted">
      <h1 className="text-2xl font-bold text-text">Política de Privacidade</h1>
      <p>
        Esta política descreve como o <strong>77Imóveis</strong> trata seus dados pessoais, em conformidade
        com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Dados que coletamos</h2>
      <p>
        Coletamos dados que você fornece ao criar conta (nome, e-mail, telefone), ao anunciar imóveis,
        e ao entrar em contato com anunciantes (nome, telefone, e-mail e mensagem). Também registramos
        dados técnicos (endereço IP, navegador) para segurança e prevenção de spam.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Como usamos</h2>
      <p>
        Usamos seus dados para operar o portal, conectar interessados e anunciantes, melhorar o serviço
        e cumprir obrigações legais. Não vendemos seus dados. Mensagens de contato são compartilhadas
        apenas com o anunciante do imóvel correspondente.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Seus direitos</h2>
      <p>
        Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados, bem como revogar
        consentimentos, a qualquer momento, pelo e-mail de contato abaixo.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Cookies</h2>
      <p>
        Utilizamos cookies essenciais para o funcionamento do site e para lembrar suas preferências
        (como o tema claro/escuro). Você pode gerenciar cookies nas configurações do seu navegador.
      </p>

      <h2 className="pt-2 text-lg font-semibold text-text">Contato</h2>
      <p>
        Dúvidas sobre privacidade: <a href="mailto:contato@77imoveis.com.br" className="text-primary">contato@77imoveis.com.br</a>.
      </p>
    </main>
  );
}
