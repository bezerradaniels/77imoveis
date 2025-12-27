import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo";
import Container from "../../components/common/Container";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { paths } from "../../routes/paths";
import { cn } from "../../lib/utils";

type SectionProperty = {
    id: string;
    title: string;
    location: string;
    price: string;
    image: string;
    link: string;
};

type ProfileSection = {
    id: string;
    title: string;
    subtitle: string;
    properties: SectionProperty[];
};

const sections: ProfileSection[] = [
    {
        id: "ativos",
        title: "Imóveis em destaque",
        subtitle: "Carteira exclusiva atendida pelo corretor",
        properties: [
            {
                id: "cor-1",
                title: "Apartamento minimalista",
                location: "Centro • Barreiras",
                price: "R$ 780.000",
                image: "https://images.unsplash.com/photo-1505692794400-0d9b1f1c1c90?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("cor-1"),
            },
            {
                id: "cor-2",
                title: "Casa com rooftop gourmet",
                location: "Jardim Europa • VCA",
                price: "R$ 1.180.000",
                image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("cor-2"),
            },
            {
                id: "cor-3",
                title: "Studio mobiliado",
                location: "Bom Jesus da Lapa",
                price: "R$ 2.300/mês",
                image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("cor-3"),
            },
            {
                id: "cor-4",
                title: "Cobertura duplex skyline",
                location: "Barreiras",
                price: "R$ 1.950.000",
                image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("cor-4"),
            },
        ],
    },
    {
        id: "compradores",
        title: "Clientes compradores",
        subtitle: "Famílias e investidores assessorados",
        properties: [
            {
                id: "cor-client-1",
                title: "Residencial Buena Vista",
                location: "Morada dos Pássaros",
                price: "Vendido em 45 dias",
                image: "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("cor-client-1"),
            },
            {
                id: "cor-client-2",
                title: "Casa térrea Morada Nobre",
                location: "Barreiras",
                price: "Negociado abaixo da tabela",
                image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("cor-client-2"),
            },
            {
                id: "cor-client-3",
                title: "Sala comercial Vista Sul",
                location: "Vitória da Conquista",
                price: "Locação corporativa",
                image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("cor-client-3"),
            },
            {
                id: "cor-client-4",
                title: "Townhouse Jardim Barcelona",
                location: "Barreiras",
                price: "Fechada em 30 dias",
                image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("cor-client-4"),
            },
        ],
    },
];

function renderCard(property: SectionProperty, isSlider?: boolean) {
    return (
        <Link
            to={property.link}
            key={property.id}
            className={cn("group block", isSlider && "w-65 shrink-0 snap-center")}
        >
            <div className="rounded-3xl overflow-hidden bg-gray-100 aspect-4/3 relative">
                <img
                    src={property.image}
                    alt={property.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />
            </div>
            <div className="mt-3 space-y-1">
                <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
                <p className="text-sm text-gray-500 truncate">{property.location}</p>
                <p className="text-sm font-semibold text-gray-900">{property.price}</p>
            </div>
        </Link>
    );
}

export default function ProfileCorretor() {
    return (
        <>
            <Seo title="77 Imóveis | Perfil do Corretor" />

            <section className="relative bg-slate-900 text-white">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=1600&q=80"
                        alt="Corretor"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/90 to-transparent" />
                </div>
                <Container className="relative py-16 lg:py-20">
                    <div className="max-w-2xl space-y-6">
                        <p className="text-xs uppercase tracking-[0.35em] text-lime-300">
                            Perfil Corretor
                        </p>
                        <h1 className="text-4xl font-bold">João Amaral • CRECI 12345</h1>
                        <p className="text-lg text-white/80">
                            Especialista em negociações em Barreiras, Vitória da Conquista e Bom Jesus da Lapa.
                            Mais de 60 transações concluídas em 2024 com NPS 96.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button className="bg-lime-400 text-slate-900 hover:bg-lime-300">
                                Agendar reunião
                            </Button>
                            <Button variant="outline" className="text-white border-white hover:bg-white/10">
                                Portfólio completo
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        {[
                            { label: "Transações 2024", value: "62" },
                            { label: "Tempo médio", value: "28 dias" },
                            { label: "Carteira ativa", value: "34 imóveis" },
                            { label: "Clientes recorrentes", value: "18" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                                <div className="text-3xl font-semibold text-lime-300">{stat.value}</div>
                                <p className="text-sm text-white/70 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="py-12 bg-white">
                <Container className="space-y-8">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Sobre o profissional</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Corretor credenciado com foco em imóveis residenciais e comerciais. Utiliza
                                processos digitais end-to-end, desde tours virtuais até assinatura eletrônica.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                {[
                                    { title: "Especialidades", desc: "Imóveis premium e locação corporativa." },
                                    { title: "Ferramentas", desc: "CRM próprio, funil de leads e campanhas 77 Ads." },
                                    { title: "Atendimento", desc: "Suporte 7 dias com concierge pós-venda." },
                                    { title: "Parcerias", desc: "Fintechs de crédito e arquitetos para retrofit." },
                                ].map((item) => (
                                    <div key={item.title} className="p-4 rounded-2xl border border-gray-100">
                                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 space-y-5">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Contato direto</p>
                                <p className="text-lg font-semibold text-gray-900 mt-2">João Amaral</p>
                                <p className="text-sm text-gray-500">joao@77imoveis.com • (77) 98888-4455</p>
                            </div>
                            <Textarea
                                placeholder="Escreva sua mensagem..."
                                className="min-h-32"
                            />
                            <div className="flex flex-wrap gap-3">
                                <Button className="bg-lime-500 hover:bg-lime-600 text-white">
                                    Enviar mensagem
                                </Button>
                                <Button variant="outline" className="text-emerald-600 border-emerald-200">
                                    Falar no WhatsApp
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <div className="bg-white">
                {sections.map((section) => (
                    <section key={section.id} className="py-10 border-t border-gray-100">
                        <Container>
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <div className="flex-1 min-w-56">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{section.subtitle}</p>
                                        </div>
                                        <Link
                                            to={paths.listings}
                                            className="hidden md:inline-flex text-sm font-semibold text-lime-600 hover:text-lime-500"
                                        >
                                            Ver todos →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="md:hidden -mx-4 px-4">
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                                    {section.properties.map((property) => renderCard(property, true))}
                                </div>
                            </div>
                            <div className="hidden md:grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {section.properties.map((property) => renderCard(property))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Link to={paths.listings} className="text-sm font-semibold text-lime-600 hover:text-lime-500">
                                    Ver todos os imóveis →
                                </Link>
                            </div>
                        </Container>
                    </section>
                ))}
            </div>
        </>
    );
}
