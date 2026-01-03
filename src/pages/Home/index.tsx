import { Link } from "react-router-dom";
import Container from "../../components/common/Container";
import { useEffect, useMemo, useState, useCallback } from "react";
import Seo from "../../components/common/Seo";
import { Button } from "../../components/ui/button";
import { paths } from "../../routes/paths";
import aluguelImage from "../../assets/images/aluguel.png";
import vendaImage from "../../assets/images/venda.webp";
import lancamentosImage from "../../assets/images/lancamentos.png";
import { fetchListings } from "../../features/properties/api";
import type { Property } from "../../features/properties/types";

type SectionProperty = {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  link: string;
};

type ExploreSection = {
  id: string;
  title: string;
  subtitle: string;
  linkUrl?: string;
  properties: SectionProperty[];
};

export default function Home() {
  const slides = [
    {
      id: "aluguel",
      label: "Aluguel",
      badge: "Alugue com segurança",
      title: "Imóveis para aluguel",
      highlight: "com contratos flexíveis",
      description: "Escolha entre casas, apartamentos e studios selecionados na região DDD 77 e faça tudo online.",
      ctaLabel: "Ver imóveis de aluguel",
      ctaLink: `${paths.listings}?purpose=aluguel`,
      image: aluguelImage,
      mobilePosition: "70% center",
    },
    {
      id: "venda",
      label: "Vendas",
      badge: "Invista com confiança",
      title: "Encontre os melhores",
      highlight: "imóveis para venda",
      description: "Projetos residenciais completos, prontos ou em construção, com financiamento facilitado.",
      ctaLabel: "Ver imóveis à venda",
      ctaLink: `${paths.listings}?purpose=venda`,
      image: vendaImage,
      mobilePosition: "center center",
    },
    {
      id: "lancamento",
      label: "Lançamentos",
      badge: "Exclusivos 77 Imóveis",
      title: "Melhores oportunidades",
      highlight: "de Lançamentos",
      description: "Empreendimentos modernos com condições especiais de pré-venda e alta valorização.",
      ctaLabel: "Conhecer lançamentos",
      ctaLink: paths.lancamentos,
      image: lancamentosImage,
      mobilePosition: "center center",
    },
  ] as const;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slide = slides[currentSlide];

  const changeSlide = useCallback((newIndex: number) => {
    if (newIndex === currentSlide || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => setCurrentSlide(newIndex), 200);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [currentSlide, isTransitioning]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      changeSlide(nextSlide);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentSlide, slides.length, changeSlide]);


  // DATA FETCHING REAL
  const [sales, setSales] = useState<Property[]>([]);
  const [rents, setRents] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        // Buscamos em paralelo
        const [saleRes, rentRes] = await Promise.all([
          fetchListings({ purpose: 'venda', pageSize: 4, sort: 'recent' }),
          fetchListings({ purpose: 'aluguel', pageSize: 4, sort: 'recent' })
        ]);
        setSales(saleRes.items);
        setRents(rentRes.items);
      } catch (error) {
        console.error("Erro ao carregar imóveis da Home:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const mapToSection = (props: Property[], title: string, subtitle: string, id: string, link: string): ExploreSection => ({
    id,
    title,
    subtitle,
    linkUrl: link, // Used the link parameter here
    properties: props.map(p => {
      const priceFormatted = p.price
        ? `R$ ${p.price.toLocaleString('pt-BR')}`
        : (p.rent ? `R$ ${p.rent.toLocaleString('pt-BR')}/mês` : 'Sob Consulta');

      const addressParts = [p.neighborhood, p.city].filter(Boolean).join(", ");

      return {
        id: p.id,
        title: p.title,
        location: addressParts || "Localização sob consulta",
        price: priceFormatted,
        image: p.property_photos?.[0]?.url || "https://placehold.co/600x400?text=Sem+Foto",
        link: paths.property(p.id)
      };
    })
  });

  const propertySections: ExploreSection[] = useMemo(() => {
    const sections: ExploreSection[] = [];
    if (sales.length > 0) {
      sections.push(mapToSection(sales, "Imóveis à Venda", "Oportunidades recentes de compra", "venda", `${paths.listings}?purpose=venda`));
    }
    if (rents.length > 0) {
      sections.push(mapToSection(rents, "Para Alugar", "Imóveis disponíveis para locação", "aluguel", `${paths.listings}?purpose=aluguel`));
    }
    return sections;
  }, [sales, rents]);


  const renderSectionCard = (property: SectionProperty, isSlider = false) => (
    <Link
      to={property.link}
      key={property.id}
      className={`group block ${isSlider ? 'w-[280px] flex-shrink-0 snap-center' : ''}`}
    >
      <div className="rounded-3xl overflow-hidden bg-gray-100 aspect-4/3 relative">
        <img
          src={property.image}
          alt={property.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent" />
      </div>
      <div className="mt-3 space-y-1">
        <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
        <p className="text-sm text-gray-500 truncate">{property.location}</p>
        <p className="text-sm font-semibold text-gray-900">{property.price}</p>
      </div>
    </Link>
  );

  const renderPropertySection = (section: ExploreSection) => (
    <section key={section.id} className="py-12 border-t border-gray-100">
      <Container>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-56">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{section.subtitle}</p>
              </div>
              <Link to={section.linkUrl || paths.listings} className="hidden md:inline-flex text-sm font-semibold text-lime-600 hover:text-lime-500">
                Ver todos →
              </Link>
            </div>
          </div>
        </div>
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {section.properties.map((property) => renderSectionCard(property, true))}
          </div>
        </div>
        <div className="hidden md:grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {section.properties.map((property) => renderSectionCard(property, false))}
        </div>
      </Container>
    </section>
  );

  return (
    <>
      <Seo title="77 Imóveis | Home" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-8 md:py-12 overflow-hidden">
        <div className="absolute inset-0">
          {slides.map((s, index) => (
            <img
              key={s.id}
              src={s.image}
              alt={s.label}
              className={`absolute inset-0 w-full h-full object-cover hero-slide-image transition-all duration-1000 ease-in-out ${index === currentSlide
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0'
                }`}
              style={{ '--mobile-position': s.mobilePosition } as React.CSSProperties}
            />
          ))}
          <div className="absolute inset-0 z-20 bg-linear-to-tr from-black/95 via-black/70 to-transparent" />
        </div>

        <Container className="relative z-30 pt-10 pb-12 md:pt-12 md:pb-16">
          <div
            key={slide.id}
            className={`max-w-2xl transition-all duration-500 ease-out ${isTransitioning
              ? 'opacity-0 translate-y-8'
              : 'opacity-100 translate-y-0'
              }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-sm font-semibold rounded-full uppercase tracking-wide backdrop-blur-sm">
              {slide.badge}
            </div>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-none">
              {slide.title}{" "}
              <span className="text-lime-400">{slide.highlight}</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-lg">{slide.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={slide.ctaLink}>
                <Button size="lg" className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold px-8 rounded-full">
                  {slide.ctaLabel}
                </Button>
              </Link>
            </div>
          </div>
        </Container>

        <div className="absolute bottom-28 left-0 right-0 z-30">
          <Container>
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-lime-400 rounded-full transition-all ${index === currentSlide
                      ? 'animate-progress-bar'
                      : index < currentSlide
                        ? 'w-full'
                        : 'w-0'
                      }`}
                  />
                </div>
              ))}
            </div>
          </Container>
        </div>

        <div className="absolute bottom-14 left-0 right-0 z-30">
          <Container>
            <div className="flex gap-3 rounded-2xl">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => changeSlide(index)}
                  className={`flex-1 py-3 px-6 text-sm font-semibold uppercase tracking-wide transition-all duration-300 rounded-2xl border ${currentSlide === index
                    ? "bg-white text-gray-900 border-transparent shadow-lg scale-105"
                    : "text-white/80 border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 hover:scale-102"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Container>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-lime-500">500+</div>
              <div className="mt-1 text-sm text-gray-600">Imóveis Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-lime-500">50+</div>
              <div className="mt-1 text-sm text-gray-600">Cidades</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-lime-500">100+</div>
              <div className="mt-1 text-sm text-gray-600">Corretores</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-lime-500">1000+</div>
              <div className="mt-1 text-sm text-gray-600">Clientes Satisfeitos</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Dynamic Explore Sections */}
      <div className="bg-white">
        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Carregando destaques...
          </div>
        ) : propertySections.length > 0 ? (
          propertySections.map(renderPropertySection)
        ) : (
          <div className="py-20 text-center text-gray-500 italic">
            Nenhum imóvel em destaque no momento.
          </div>
        )}
      </div>

      {/* Features e Categories Sections mantidos (são estáticos/institucionais) */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Por que escolher a 77 Imóveis?</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Tudo que você precisa para encontrar ou anunciar seu imóvel na região</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Features Cards... */}
            {/* Simplified for brevity in this replace, keeping the structure generic */}
            <FeatureCard icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} title="Busca Inteligente" description="Filtros avançados para encontrar exatamente o que você procura." />
            <FeatureCard icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} title="Anúncio Grátis" description="Publique seus imóveis sem custo e alcance milhares de pessoas." />
            <FeatureCard icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>} title="Foco Regional" description="Especialistas na região DDD 77 da Bahia." />
          </div>
        </Container>
      </section>

      {/* Categories Links (Keep static) */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Explore por Categoria</h2>
          </div>
          {/* ... Categories Grid ... Keep as is or simplified */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard type="casa" label="Casas" />
            <CategoryCard type="apartamento" label="Apartamentos" />
            <CategoryCard type="terreno" label="Terrenos" />
            <CategoryCard type="loja" label="Comercial" />
          </div>
        </Container>
      </section>

      <section className="py-20 bg-lime-500">
        <Container>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Pronto para começar?</h2>
              <p className="mt-3 text-lime-100 text-lg">Cadastre-se agora e encontre ou anuncie seu imóvel gratuitamente</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to={paths.listings}>
                <Button size="lg" className="bg-white text-lime-600 hover:bg-gray-100 font-semibold rounded-full px-8">Explorar Imóveis</Button>
              </Link>
              <Link to={paths.registerImobiliaria}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">Anunciar Grátis</Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

// Helpers
function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow card-shadow">
      <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center mb-6 text-lime-600">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function CategoryCard({ type, label }: any) {
  return (
    <Link to={`${paths.listings}?type=${type}`} className="group">
      <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-lime-50 hover:shadow-lg transition-all">
        <h3 className="font-semibold text-gray-900">{label}</h3>
      </div>
    </Link>
  )
}
