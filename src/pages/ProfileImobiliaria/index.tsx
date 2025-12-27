import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo";
import Container from "../../components/common/Container";
import { Button } from "../../components/ui/button";
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
        id: "luxo",
        title: "Residenciais de Alto Padrão",
        subtitle: "Imóveis exclusivos da carteira da 77 Prime",
        properties: [
            {
                id: "prime-1",
                title: "Cobertura Skyline Jardins",
                location: "Barreiras • 320m² • 4 suítes",
                price: "R$ 2.950.000",
                image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("prime-1"),
            },
            {
                id: "prime-2",
                title: "Casa com rooftop e piscina olímpica",
                location: "Vitória da Conquista • Horto",
                price: "R$ 4.200.000",
                image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("prime-2"),
            },
            {
                id: "prime-3",
                title: "Mansão Vista Lagoa",
                location: "Bom Jesus da Lapa • Cond. Rio Azul",
                price: "R$ 3.450.000",
                image: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("prime-3"),
            },
            {
                id: "prime-4",
                title: "Penthouse Duplex Aurora",
                location: "Barreiras • Centro",
                price: "R$ 2.380.000",
                image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("prime-4"),
            },
        ],
    },
    {
        id: "corporativo",
        title: "Carteira Comercial",
        subtitle: "Galpões, salas e lojas com gestão exclusiva",
        properties: [
            {
                id: "corp-1",
                title: "Helios Tower Corporate",
                location: "Barreiras • 950m² • 18 vagas",
                price: "R$ 18.500/mês",
                image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("corp-1"),
            },
            {
                id: "corp-2",
                title: "Loja flagship Morada Nobre",
                location: "Vitória da Conquista • 420m²",
                price: "R$ 28.000/mês",
                image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("corp-2"),
            },
            {
                id: "corp-3",
                title: "Galpão logístico BR-242",
                location: "Barreiras • 3.600m²",
                price: "R$ 65.000/mês",
                image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("corp-3"),
            },
            {
                id: "corp-4",
                title: "Centro Médico São Lucas",
                location: "Bom Jesus da Lapa • 12 consultórios",
                price: "R$ 2.800.000",
                image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("corp-4"),
            },
        ],
    },
    {
        id: "aluguel",
        title: "Locação Premium",
        subtitle: "Contratos digitais com vistoria e concierge",
        properties: [
            {
                id: "rent-imob-1",
                title: "Garden com spa privativo",
                location: "Barreiras • Vila Rica",
                price: "R$ 9.200/mês",
                image: "https://images.unsplash.com/photo-1489154208520-5e33f17fe126?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("rent-imob-1"),
            },
            {
                id: "rent-imob-2",
                title: "Loft industrial mobiliado",
                location: "Vitória da Conquista • Candeias",
                price: "R$ 6.700/mês",
                image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("rent-imob-2"),
            },
            {
                id: "rent-imob-3",
                title: "Casa smart Morada dos Pássaros",
                location: "Vitoria da Conquista",
                price: "R$ 8.500/mês",
                image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("rent-imob-3"),
            },
            {
                id: "rent-imob-4",
                title: "Townhouse Jardim Barcelona",
                location: "Barreiras",
                price: "R$ 7.100/mês",
                image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
                link: paths.property("rent-imob-4"),
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
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
            </div>
            <div className="mt-3 space-y-1">
                <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
                <p className="text-sm text-gray-500 truncate">{property.location}</p>
                <p className="text-sm font-semibold text-gray-900">{property.price}</p>
            </div>
        </Link>
    );
}

export default function ProfileImobiliaria() {
    return (
        <>
            <Seo title="77 Imóveis | Perfil da Imobiliária" />

            <section className="relative bg-slate-950 text-white">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80"
                        alt="Fachada"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/90 to-transparent" />
                </div>
                <Container className="relative py-16 lg:py-24">
                    <div className="max-w-3xl space-y-6">
                        <p className="text-xs uppercase tracking-[0.35em] text-lime-300">
                            Perfil Imobiliária
                        </p>
                        <h1 className="text-4xl lg:text-5xl font-bold">
                            77 Prime • Especialista em Imóveis de Alto Padrão
                        </h1>
                        <p className="text-lg text-white/80">
                            Portfólio curado com mais de 180 imóveis ativos, concierge exclusivo e
                            atendimento com consultores certificados pelo CRECI.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button className="bg-lime-400 text-slate-900 hover:bg-lime-300">
                                Agendar visita guiada
                            </Button>
                            <Button variant="outline" className="text-white border-white hover:bg-white/10">
                                Baixar catálogo
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                        {[
                            { label: "Imóveis ativos", value: "180+" },
                            { label: "Cidades atendidas", value: "15" },
                            { label: "Consultores", value: "22" },
                            { label: "Clientes premium", value: "320" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/10 rounded-2xl p-4 text-center">
                                <div className="text-3xl font-semibold text-lime-300">{stat.value}</div>
                                <p className="text-sm text-white/70 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="py-16 bg-white">
                <Container className="space-y-10">
                    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-gray-900">Sobre a 77 Prime</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Somos uma boutique imobiliária focada em imóveis de alto padrão na Bahia.
                                Atuamos desde a curadoria e precificação até estratégia comercial digital,
                                com acompanhamento jurídico completo.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                {[
                                    {
                                        title: "Serviços completos",
                                        desc: "Produção audiovisual, staging e tour virtual 360º.",
                                    },
                                    {
                                        title: "Conexão internacional",
                                        desc: "Rede de investidores no Brasil, Portugal e EUA.",
                                    },
                                    {
                                        title: "Marketing exclusivo",
                                        desc: "Campanhas de mídia segmentada com relatórios semanais.",
                                    },
                                    {
                                        title: "Time especializado",
                                        desc: "Corretores credenciados com foco em negociação consultiva.",
                                    },
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
                                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Contato</p>
                                <p className="text-lg font-semibold text-gray-900 mt-2">77 Prime Consultoria</p>
                                <p className="text-sm text-gray-500">imobiliaria@77prime.com • (77) 99999-1010</p>
                            </div>
                            <div className="space-y-3 text-sm text-gray-600">
                                <p>Av. ACM, 1515 - Barreiras • Escritórios em VCA e BJL.</p>
                                <p>Horário exclusivo para clientes premium: seg a sab, 8h às 22h.</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" className="text-gray-600">
                                    Enviar proposta
                                </Button>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                    Falar no WhatsApp
                                </Button>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <div className="bg-white">
                {sections.map((section) => (
                    <section key={section.id} className="py-12 border-t border-gray-100">
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
