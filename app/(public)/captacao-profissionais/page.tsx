import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CircleDollarSign,
  House,
  KeyRound,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqLd } from '@/lib/seo/jsonld';
import { absoluteUrl, pageMetadata } from '@/lib/seo/meta';

const PAGE_PATH = '/captacao-profissionais';
const PAGE_DESCRIPTION =
  'Crie sua vitrine no 77Imóveis, publique sua carteira e receba contatos diretos. Para imobiliárias, corretores, construtoras e proprietários.';

export const metadata: Metadata = pageMetadata({
  title: 'Anuncie imóveis no Oeste da Bahia',
  description: PAGE_DESCRIPTION,
  path: PAGE_PATH,
  images: ['/hero-captacao-imobiliarias.png'],
});

const signupHref = (content: string) =>
  `/cadastro?utm_source=landing_page&utm_medium=site&utm_campaign=captacao_profissionais&utm_content=${content}`;

const benefits = [
  {
    icon: House,
    title: 'Anúncios completos',
    description: 'Apresente fotos, características, preços e diferentes modalidades de negociação com clareza.',
  },
  {
    icon: MessageCircle,
    title: 'Contato direto',
    description: 'O interessado pode iniciar a conversa pelo WhatsApp ou enviar o formulário do anúncio.',
  },
  {
    icon: Sparkles,
    title: 'Mais visibilidade',
    description: 'Use destaques para reforçar a divulgação dos imóveis mais estratégicos da sua carteira.',
  },
  {
    icon: Building2,
    title: 'Vitrine profissional',
    description: 'Reúna sua marca, seus dados e seus imóveis ativos em uma página fácil de compartilhar.',
  },
  {
    icon: Users,
    title: 'Equipe organizada',
    description: 'Nos planos compatíveis, associe corretores e centralize a operação em um único painel.',
  },
  {
    icon: Search,
    title: 'Busca regional',
    description: 'Páginas por cidade, tipo e negociação ajudam o público certo a encontrar cada imóvel.',
  },
];

const audiences = [
  {
    icon: Building2,
    label: 'Empresas',
    title: 'Imobiliárias e construtoras',
    description: 'Divulgue uma carteira maior, organize sua equipe e fortaleça a presença regional da marca.',
  },
  {
    icon: KeyRound,
    label: 'Profissionais',
    title: 'Corretores autônomos',
    description: 'Tenha perfil profissional, vitrine própria e canais diretos para conversar com interessados.',
  },
  {
    icon: House,
    label: 'Particulares',
    title: 'Proprietários',
    description: 'Publique 1 imóvel ativo gratuitamente e receba contatos diretamente pelo anúncio.',
  },
];

const proofs = [
  { icon: MapPin, title: 'Foco regional', description: 'Imóveis e profissionais do Oeste da Bahia' },
  { icon: MessageCircle, title: 'Contato direto', description: 'O interessado fala com você' },
  { icon: BadgeCheck, title: 'Presença profissional', description: 'Sua marca e sua carteira em um só lugar' },
];

const faqs = [
  {
    q: 'Quem pode anunciar no 77Imóveis?',
    a: 'Imobiliárias, construtoras, incorporadoras, corretores autônomos e proprietários podem criar uma conta e anunciar.',
  },
  {
    q: 'Como funciona o período grátis?',
    a: 'Os planos profissionais começam com 60 dias grátis. Ao fim do período, você escolhe se quer concluir o pagamento para manter os limites e recursos do plano.',
  },
  {
    q: 'O interessado fala direto comigo?',
    a: 'Sim. Você define no anúncio se quer receber contatos por WhatsApp, telefone e formulário.',
  },
  {
    q: 'Posso anunciar o mesmo imóvel em mais de uma modalidade?',
    a: 'Sim. Um imóvel pode ser anunciado para venda, aluguel, temporada, romaria ou lançamento, com um preço específico para cada modalidade.',
  },
  {
    q: 'Proprietário particular paga para anunciar?',
    a: 'Não pelo primeiro anúncio ativo. A conta particular pode manter 1 imóvel ativo gratuitamente e migrar para um plano profissional se precisar de mais anúncios.',
  },
];

export default function CaptacaoProfissionaisPage() {
  const pageUrl = absoluteUrl(PAGE_PATH);

  return (
    <main className="bg-bg" data-captacao-page>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${pageUrl}#webpage`,
          name: 'Anuncie imóveis no Oeste da Bahia',
          description: PAGE_DESCRIPTION,
          url: pageUrl,
          inLanguage: 'pt-BR',
          isPartOf: { '@id': `${absoluteUrl()}#website` },
        }}
      />
      <JsonLd data={faqLd(faqs)} />

      <section className="relative overflow-hidden border-b border-border bg-surface" aria-labelledby="captacao-title">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(14,165,233,.12),transparent_28rem),radial-gradient(circle_at_90%_5%,rgba(34,197,94,.10),transparent_24rem)]" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-[clamp(48px,7vw,88px)]">
          <nav aria-label="Navegação estrutural" className="mb-8 flex items-center gap-2 text-sm font-medium text-muted">
            <Link href="/" className="inline-flex min-h-11 items-center rounded text-link hover:text-link-hover">Início</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Para quem anuncia</span>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-border bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[.08em] text-link">
                <MapPin size={14} aria-hidden="true" /> Portal imobiliário regional
              </p>
              <h1 id="captacao-title" className="mt-5 max-w-3xl text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05] tracking-tight text-text">
                Seus imóveis diante de quem busca no <span className="text-primary">Oeste da Bahia</span>
              </h1>
              <p className="mt-5 max-w-2xl text-[clamp(16px,2vw,19px)] font-medium leading-relaxed text-muted">
                Publique sua carteira, fortaleça sua presença digital e receba contatos diretos. Uma vitrine para imobiliárias, corretores, construtoras e proprietários da região.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TrackedLink
                  href={signupHref('hero')}
                  buttonId="captacao_signup_hero"
                  buttonText="Criar conta grátis"
                  buttonLocation="captacao_hero"
                  section="hero"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-action px-6 py-3 text-sm font-bold text-on-action transition-colors hover:bg-action-hover"
                >
                  Criar conta grátis <ArrowRight size={17} aria-hidden="true" />
                </TrackedLink>
                <Link
                  href="/planos-e-precos"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 text-sm font-bold text-text transition-colors hover:border-primary-border hover:bg-primary-soft"
                >
                  Ver planos e preços
                </Link>
              </div>

              <ul className="mt-5 flex flex-col gap-2 text-sm font-medium text-muted sm:flex-row sm:flex-wrap sm:gap-x-5" aria-label="Condições para começar">
                <li className="flex items-center gap-2"><Check size={17} className="text-success" aria-hidden="true" /> 60 dias grátis nos planos profissionais</li>
                <li className="flex items-center gap-2"><Check size={17} className="text-success" aria-hidden="true" /> 1 imóvel ativo grátis para particular</li>
              </ul>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[28px] border border-border bg-surface p-2 shadow-[0_24px_70px_rgba(15,23,42,.14)]">
                <Image
                  src="/hero-captacao-imobiliarias.png"
                  alt="Profissional do mercado imobiliário entregando as chaves de um imóvel"
                  width={800}
                  height={450}
                  priority
                  sizes="(max-width: 1023px) 100vw, 48vw"
                  className="aspect-[16/9] w-full rounded-[22px] object-cover"
                />
              </div>
              <div className="absolute -bottom-5 left-4 right-4 flex items-center gap-3 rounded-2xl border border-primary-border bg-surface/95 p-4 shadow-lg backdrop-blur sm:left-auto sm:right-5 sm:w-[290px]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-link"><MessageCircle size={21} aria-hidden="true" /></span>
                <span><strong className="block text-sm text-text">Contato sem intermediário</strong><span className="mt-0.5 block text-xs text-muted">A conversa começa no seu canal</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface" aria-label="Diferenciais principais">
        <div className="mx-auto grid max-w-[1200px] divide-y divide-border px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {proofs.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex min-h-28 items-center gap-4 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-link"><Icon size={21} aria-hidden="true" /></span>
              <span><strong className="block text-sm text-text">{title}</strong><span className="mt-1 block text-xs font-medium leading-relaxed text-muted">{description}</span></span>
            </div>
          ))}
        </div>
      </section>

      <section id="recursos" className="scroll-mt-24 bg-bg py-[clamp(56px,7vw,88px)]" aria-labelledby="recursos-title">
        <div className="mx-auto max-w-[1200px] px-6">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-link">Mais presença, menos complicação</p>
          <h2 id="recursos-title" className="mt-3 max-w-3xl text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-text">
            Recursos para transformar sua carteira em uma vitrine ativa
          </h2>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-muted">
            Organize e divulgue seus imóveis em um portal construído para a realidade das cidades da região.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-border bg-surface p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-link"><Icon size={21} aria-hidden="true" /></span>
                <h3 className="mt-5 text-lg font-extrabold text-text">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-[clamp(56px,7vw,88px)]" aria-labelledby="publicos-title">
        <div className="mx-auto max-w-[1200px] px-6">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-link">Feito para quem anuncia</p>
          <h2 id="publicos-title" className="mt-3 text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-text">Um caminho para cada perfil</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {audiences.map(({ icon: Icon, label, title, description }) => (
              <article key={title} className="rounded-2xl border border-border bg-bg p-6">
                <Icon size={24} className="text-link" aria-hidden="true" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[.08em] text-link">{label}</p>
                <h3 className="mt-2 text-xl font-extrabold text-text">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg py-[clamp(56px,7vw,88px)]" aria-labelledby="passos-title">
        <div className="mx-auto max-w-[1200px] px-6">
          <p className="text-xs font-bold uppercase tracking-[.1em] text-link">Simples para começar</p>
          <h2 id="passos-title" className="mt-3 text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-text">Sua vitrine no ar em três etapas</h2>
          <ol className="mt-10 grid gap-7 md:grid-cols-3">
            {[
              ['Crie sua conta', 'Informe seus dados e escolha o perfil que representa sua atuação.'],
              ['Monte seu anúncio', 'Adicione fotos, localização, características, preço e formas de negociação.'],
              ['Receba interessados', 'Depois da publicação, seu imóvel entra na busca e pode gerar contatos diretos.'],
            ].map(([title, description], index) => (
              <li key={title} className="relative border-l border-primary-border pl-16 md:border-l-0 md:border-t md:pl-0 md:pt-12">
                <span className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-on-primary md:-top-[22px]">{index + 1}</span>
                <h3 className="text-lg font-extrabold text-text">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-[clamp(40px,6vw,72px)]" aria-labelledby="oferta-title">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="overflow-hidden rounded-[28px] bg-[#0b2733] px-6 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-14">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#75def3]"><CircleDollarSign size={15} aria-hidden="true" /> Oferta de lançamento</p>
              <h2 id="oferta-title" className="mt-3 text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight">Experimente um plano profissional por 60 dias grátis</h2>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-[#c4d3da] sm:text-base">Crie o perfil, escolha o plano e comece a publicar. Ao fim do teste, você decide se quer continuar.</p>
            </div>
            <div className="mt-7 shrink-0 lg:mt-0 lg:w-60">
              <TrackedLink
                href={signupHref('oferta')}
                buttonId="captacao_signup_offer"
                buttonText="Começar teste grátis"
                buttonLocation="captacao_offer"
                section="offer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-bold text-on-action transition-colors hover:bg-action-hover"
              >
                Começar teste grátis <ArrowRight size={17} aria-hidden="true" />
              </TrackedLink>
              <p className="mt-3 text-center text-xs font-medium text-[#c4d3da]">Sem cobrança automática ao fim do teste</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg py-[clamp(56px,7vw,88px)]" aria-labelledby="faq-title">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.1em] text-link">Dúvidas frequentes</p>
            <h2 id="faq-title" className="mt-3 text-[clamp(28px,4vw,42px)] font-extrabold leading-tight tracking-tight text-text">Antes de começar</h2>
            <p className="mt-4 text-sm font-medium leading-relaxed text-muted">Veja como funcionam os anúncios, os contatos e o período grátis.</p>
          </div>
          <div className="border-t border-border">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group border-b border-border">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-bold text-text focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                  {q}<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-lg text-link group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="max-w-3xl pb-5 pr-10 text-sm font-medium leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
