import { Link } from "react-router-dom";
import Container from "../../components/common/Container";
import { useEffect, useMemo, useState, useCallback } from "react";
import Seo from "../../components/common/Seo";
import { Button } from "../../components/ui/button";
import { paths } from "../../routes/paths";
import aluguelImage from "../../assets/images/aluguel.png";
import vendaImage from "../../assets/images/venda.png";
import lancamentosImage from "../../assets/images/lancamentos.png";

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
      mobilePosition: "70% center", // Foca na mulher à direita
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

  // Função para mudar slide com animação
  const changeSlide = useCallback((newIndex: number) => {
    if (newIndex === currentSlide || isTransitioning) return;
    setIsTransitioning(true);

    // Pequeno delay para a animação de saída do texto
    setTimeout(() => {
      setCurrentSlide(newIndex);
    }, 200);

    // Reseta o estado de transição após a animação completar
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  }, [currentSlide, isTransitioning]);

  // Auto-play: alterna slides a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length;
      changeSlide(nextSlide);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentSlide, slides.length, changeSlide]);

  const propertySections: ExploreSection[] = useMemo(
    () => [
      {
        id: "destaques",
        title: "Destaques da semana",
        subtitle: "Seleção premium com visitas agendadas em até 24h",
        properties: [
          {
            id: "dest-1",
            title: "Cobertura vista lagoa",
            location: "Centro, Barreiras",
            price: "R$ 950 mil",
            image: "https://images.unsplash.com/photo-1505692794400-0d9b1f1c1c90?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?type=apartamento`,
          },
          {
            id: "dest-2",
            title: "Casa com área gourmet",
            location: "Morada Nobre, Vitória da Conquista",
            price: "R$ 1,35 mi",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?type=casa`,
          },
          {
            id: "dest-3",
            title: "Studio assinado",
            location: "Jardim Europa, Barreiras",
            price: "R$ 4.500/mês",
            image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=aluguel`,
          },
          {
            id: "dest-4",
            title: "Duplex com rooftop",
            location: "Horto, Vitória da Conquista",
            price: "R$ 6.200/mês",
            image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=aluguel`,
          },
        ],
      },
      {
        id: "direto",
        title: "Direto com o proprietário",
        subtitle: "Negocie condições especiais falando com o dono",
        properties: [
          {
            id: "dir-1",
            title: "Casa térrea com jardim",
            location: "Alto da Colina, Barreiras",
            price: "R$ 2.900/mês",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=aluguel`,
          },
          {
            id: "dir-2",
            title: "Chácara urbana mobiliada",
            location: "Morada da Nova, Bom Jesus da Lapa",
            price: "R$ 780 mil",
            image: "https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=venda`,
          },
          {
            id: "dir-3",
            title: "Apartamento garden",
            location: "Candeias, Vitória da Conquista",
            price: "R$ 4.100/mês",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=aluguel`,
          },
          {
            id: "dir-4",
            title: "Cobertura pé-direito duplo",
            location: "Vila Rica, Barreiras",
            price: "R$ 1,18 mi",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=venda`,
          },
        ],
      },
      {
        id: "aluguel",
        title: "Para alugar agora",
        subtitle: "Imóveis com contrato digital e vistoria online",
        properties: [
          {
            id: "rent-1",
            title: "Studio mobiliado",
            location: "Centro, Vitória da Conquista",
            price: "R$ 2.200/mês",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=aluguel`,
          },
          {
            id: "rent-2",
            title: "Casa 4 suítes",
            location: "Recanto dos Pássaros, Barreiras",
            price: "R$ 7.500/mês",
            image: "https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=aluguel`,
          },
          {
            id: "rent-3",
            title: "Garden com piscina",
            location: "Boa Vista, Bom Jesus da Lapa",
            price: "R$ 3.900/mês",
            image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=aluguel`,
          },
          {
            id: "rent-4",
            title: "Loft industrial",
            location: "Morada Nobre, Barreiras",
            price: "R$ 4.300/mês",
            image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=aluguel`,
          },
        ],
      },
      {
        id: "vendas",
        title: "Para comprar",
        subtitle: "Opções com financiamento aprovado",
        properties: [
          {
            id: "sale-1",
            title: "Residencial Horizonte",
            location: "Bela Vista, Barreiras",
            price: "R$ 890 mil",
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=venda`,
          },
          {
            id: "sale-2",
            title: "Casa com rooftop",
            location: "Morada dos Pássaros, VCA",
            price: "R$ 1,45 mi",
            image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=venda`,
          },
          {
            id: "sale-3",
            title: "Townhouse compacta",
            location: "Centro, Bom Jesus da Lapa",
            price: "R$ 590 mil",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=venda`,
          },
          {
            id: "sale-4",
            title: "Cobertura skyline",
            location: "Jardim Barcelona, Barreiras",
            price: "R$ 1,9 mi",
            image: "https://images.unsplash.com/photo-1468234847176-28606331216a?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?purpose=venda`,
          },
        ],
      },
      {
        id: "lancamentos",
        title: "Lançamentos em pré-venda",
        subtitle: "Condições especiais e unidades decoradas",
        properties: [
          {
            id: "launch-1",
            title: "Skyline Residence",
            location: "VCA | 2-4 suítes",
            price: "A partir de R$ 680 mil",
            image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=900&q=80",
            link: paths.lancamentos,
          },
          {
            id: "launch-2",
            title: "Vista Lagoa",
            location: "Barreiras | 1-3 quartos",
            price: "A partir de R$ 420 mil",
            image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
            link: paths.lancamentos,
          },
          {
            id: "launch-3",
            title: "Reserva do Rio",
            location: "Bom Jesus da Lapa",
            price: "A partir de R$ 510 mil",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: paths.lancamentos,
          },
          {
            id: "launch-4",
            title: "Aurora Living",
            location: "Barreiras | studios",
            price: "A partir de R$ 320 mil",
            image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
            link: paths.lancamentos,
          },
        ],
      },
      {
        id: "vca",
        title: "Vitória da Conquista",
        subtitle: "Os bairros mais desejados da capital do sudoeste",
        properties: [
          {
            id: "vca-1",
            title: "Apartamento iluminado",
            location: "Candeias",
            price: "R$ 3.200/mês",
            image: "https://images.unsplash.com/photo-1486304873000-235643847519?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Vit%C3%B3ria%20da%20Conquista`,
          },
          {
            id: "vca-2",
            title: "Casa com varanda gourmet",
            location: "Morada dos Pássaros",
            price: "R$ 1,1 mi",
            image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Vit%C3%B3ria%20da%20Conquista`,
          },
          {
            id: "vca-3",
            title: "Studio compacto",
            location: "Centro",
            price: "R$ 2.100/mês",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Vit%C3%B3ria%20da%20Conquista`,
          },
          {
            id: "vca-4",
            title: "Penthouse com vista",
            location: "Horto",
            price: "R$ 2,2 mi",
            image: "https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Vit%C3%B3ria%20da%20Conquista`,
          },
        ],
      },
      {
        id: "barreiras",
        title: "Barreiras para morar agora",
        subtitle: "Casas e apartamentos prontos para mudança",
        properties: [
          {
            id: "bar-1",
            title: "Casa com piscina",
            location: "Morada Nobre",
            price: "R$ 980 mil",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Barreiras`,
          },
          {
            id: "bar-2",
            title: "Apartamento rooftop",
            location: "Centro",
            price: "R$ 4.900/mês",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Barreiras`,
          },
          {
            id: "bar-3",
            title: "Garden 3 suítes",
            location: "Jardim Barcelona",
            price: "R$ 1,15 mi",
            image: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Barreiras`,
          },
          {
            id: "bar-4",
            title: "Studio com varanda",
            location: "Flamboyant",
            price: "R$ 2.400/mês",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Barreiras`,
          },
        ],
      },
      {
        id: "bjl",
        title: "Bom Jesus da Lapa",
        subtitle: "Imóveis próximos ao Rio São Francisco",
        properties: [
          {
            id: "bjl-1",
            title: "Casa beira-rio",
            location: "Centro Histórico",
            price: "R$ 780 mil",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Bom%20Jesus%20da%20Lapa`,
          },
          {
            id: "bjl-2",
            title: "Apartamento compacto",
            location: "Bairro Nova Brasília",
            price: "R$ 1.900/mês",
            image: "https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Bom%20Jesus%20da%20Lapa`,
          },
          {
            id: "bjl-3",
            title: "Casa com quintal",
            location: "Morada Nova",
            price: "R$ 430 mil",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Bom%20Jesus%20da%20Lapa`,
          },
          {
            id: "bjl-4",
            title: "Duplex com escritório",
            location: "Portal da Lapa",
            price: "R$ 3.400/mês",
            image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80",
            link: `${paths.listings}?city=Bom%20Jesus%20da%20Lapa`,
          },
        ],
      },
      {
        id: "recentes",
        title: "Últimos postados",
        subtitle: "Novos anúncios entrando todos os dias",
        properties: [
          {
            id: "new-1",
            title: "Studio minimalista",
            location: "Centro, Barreiras",
            price: "R$ 2.000/mês",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: paths.listings,
          },
          {
            id: "new-2",
            title: "Casa smart com energia solar",
            location: "VCA",
            price: "R$ 920 mil",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: paths.listings,
          },
          {
            id: "new-3",
            title: "Kitnet mobiliada",
            location: "Bom Jesus da Lapa",
            price: "R$ 1.500/mês",
            image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
            link: paths.listings,
          },
          {
            id: "new-4",
            title: "Cobertura duplex",
            location: "Barreiras",
            price: "R$ 1,7 mi",
            image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80",
            link: paths.listings,
          },
        ],
      },
    ],
    []
  );

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
        <button
          type="button"
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
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
              <Link to={paths.listings} className="hidden md:inline-flex text-sm font-semibold text-lime-600 hover:text-lime-500">
                Ver todos →
              </Link>
            </div>
          </div>
        </div>
        {/* Mobile: Horizontal Slider | Desktop: Grid */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {section.properties.map((property) => renderSectionCard(property, true))}
          </div>
        </div>
        <div className="hidden md:grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {section.properties.map((property) => renderSectionCard(property, false))}
        </div>
        <div className="mt-6 flex justify-end">
          <Link to={paths.listings} className="text-sm font-semibold text-lime-600 hover:text-lime-500">
            Ver todos os imóveis →
          </Link>
        </div>
      </Container>
    </section>
  );

  return (
    <>
      <Seo title="77 Imóveis | Home" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-8 md:py-12 overflow-hidden">
        {/* Background Images - All stacked for smooth crossfade */}
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
          {/* Gradiente diagonal: canto inferior esquerdo para superior direito */}
          <div className="absolute inset-0 z-20 bg-linear-to-tr from-black/95 via-black/70 to-transparent" />
        </div>

        {/* Content */}
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

        {/* Progress Bar */}
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

        {/* Bottom Categories Bar */}
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

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Por que escolher a 77 Imóveis?</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Tudo que você precisa para encontrar ou anunciar seu imóvel na região</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow card-shadow">
              <div className="w-14 h-14 rounded-2xl bg-lime-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Busca Inteligente</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Filtros avançados para encontrar exatamente o que você procura. Por cidade, tipo, preço e muito mais.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow card-shadow">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Anúncio Grátis</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Publique seus imóveis sem custo e alcance milhares de pessoas interessadas na região.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow card-shadow">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Foco Regional</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Especialistas na região DDD 77 da Bahia. Conhecemos o mercado local como ninguém.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Explore Sections */}
      <div className="bg-white">
        {propertySections.map(renderPropertySection)}
      </div>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Explore por Categoria</h2>
            <p className="mt-3 text-gray-600">Encontre o tipo de imóvel ideal para você</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link to={`${paths.listings}?type=casa`} className="group">
              <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-lime-50 hover:shadow-lg transition-all">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-lime-500 transition-colors">
                  <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Casas</h3>
              </div>
            </Link>

            <Link to={`${paths.listings}?type=apartamento`} className="group">
              <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-lime-50 hover:shadow-lg transition-all">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-lime-500 transition-colors">
                  <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Apartamentos</h3>
              </div>
            </Link>

            <Link to={`${paths.listings}?type=terreno`} className="group">
              <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-lime-50 hover:shadow-lg transition-all">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-lime-500 transition-colors">
                  <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Terrenos</h3>
              </div>
            </Link>

            <Link to={`${paths.listings}?type=loja`} className="group">
              <div className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-lime-50 hover:shadow-lg transition-all">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-lime-500 transition-colors">
                  <svg className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Comercial</h3>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-lime-500">
        <Container>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Pronto para começar?</h2>
              <p className="mt-3 text-lime-100 text-lg">Cadastre-se agora e encontre ou anuncie seu imóvel gratuitamente</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to={paths.listings}>
                <Button size="lg" className="bg-white text-lime-600 hover:bg-gray-100 font-semibold rounded-full px-8">
                  Explorar Imóveis
                </Button>
              </Link>
              <Link to={paths.registerImobiliaria}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                  Anunciar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
