import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Share2,
  Heart,
  MessageCircle,
  Phone,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Send
} from "lucide-react";

import Container from "../../components/common/Container";
import Seo from "../../components/common/Seo";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

import { supabase } from "../../components/lib/supabase/client";

function moneyBRL(value: number | null) {
  if (value == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function looksLikeUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function generateMockProperty(id: string) {
  const isRent = id.includes("rent") || id.includes("aluguel") || /dest-[34]/.test(id) || /dir-[13]/.test(id) || /vca-[31]/.test(id) || /bar-[24]/.test(id) || /bjl-[24]/.test(id) || /new-[13]/.test(id);
  const isVca = id.includes("vca") || /dest-[24]/.test(id) || /dir-3/.test(id) || /sale-2/.test(id) || /launch-1/.test(id) || /new-2/.test(id);
  const isBjl = id.includes("bjl") || /dir-2/.test(id) || /rent-3/.test(id) || /sale-3/.test(id) || /launch-3/.test(id) || /new-3/.test(id);
  const city = isVca ? "Vitória da Conquista" : (isBjl ? "Bom Jesus da Lapa" : "Barreiras");

  const titles: Record<string, string> = {
    "dest-1": "Cobertura vista lagoa",
    "dest-2": "Casa com área gourmet",
    "dest-3": "Studio assinado",
    "dest-4": "Duplex com rooftop",
    "dir-1": "Casa térrea com jardim",
    "dir-2": "Chácara urbana mobiliada",
  };

  const advertiser = {
    name: "77 Imóveis Premium",
    phone: "77999887766",
    whatsapp: "5577999887766",
    email: "contato@77imoveis.com.br"
  };

  return {
    id: id,
    title: titles[id] || `Imóvel Exemplo em ${city}`,
    description: "Este imóvel é uma demonstração do layout da plataforma. Na versão final, aqui serão exibidos os detalhes completos cadastrados pelo anunciante, incluindo descrição detalhada dos ambientes, acabamentos e diferenciais.\n\nPossui excelente localização e documentação regularizada.",
    city,
    neighborhood: "Centro",
    state: "BA",
    address: "Rua das Flores, 123",
    price: isRent ? null : 850000,
    rent: isRent ? 2500 : null,
    purpose: isRent ? "aluguel" : "venda",
    type: id.includes("studio") ? "Studio" : "Casa",
    bedrooms: 3,
    bathrooms: 2,
    garage: 2,
    area_m2: 120,
    condominio: isRent ? 400 : 0,
    iptu: 1200,
    advertiser_name: advertiser.name,
    advertiser_email: advertiser.email,
    advertiser_phone: advertiser.phone,
    advertiser_whatsapp: advertiser.whatsapp,
  };
}

export default function Property() {
  const { idOrSlug } = useParams();
  const key = idOrSlug as string;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Gallery State
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("Olá, gostaria de mais informações sobre este imóvel.");
  const [formSending, setFormSending] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        let p: any = null;
        let pPhotos: any[] = [];

        // 1. Try Supabase Slug
        const bySlug = await supabase
          .from("properties")
          .select("*")
          .eq("slug", key)
          .maybeSingle();

        if (bySlug.error) throw bySlug.error;
        p = bySlug.data;

        // 2. Try Supabase ID
        if (!p && looksLikeUuid(key)) {
          const byId = await supabase.from("properties").select("*").eq("id", key).maybeSingle();
          if (byId.error) throw byId.error;
          p = byId.data;
        }

        // 3. Fallback to Mock
        if (!p && !looksLikeUuid(key)) {
          p = generateMockProperty(key);
          // Mock photos
          pPhotos = [
            { id: 1, url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80" },
            { id: 2, url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" },
            { id: 3, url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80" },
            { id: 4, url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
            { id: 5, url: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80" },
          ];
        }

        if (!p) throw new Error("Imóvel não encontrado (ou não publicado).");

        // 4. Load Photos from Supabase if not mock
        if (pPhotos.length === 0) {
          const ph = await supabase
            .from("property_photos")
            .select("id,url,sort_order")
            .eq("property_id", p.id)
            .order("sort_order", { ascending: true });

          if (ph.error) throw ph.error;
          pPhotos = ph.data ?? [];
        }

        if (!alive) return;
        setProperty(p);
        setPhotos(pPhotos);
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Erro ao carregar imóvel.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [key]);

  // Gallery Navigation Functions
  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = useCallback(() => {
    setGalleryOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!galleryOpen) return;
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryOpen, closeGallery, nextImage, prevImage]);

  // Contact Actions
  const handleWhatsApp = () => {
    if (!property?.advertiser_whatsapp) return;
    const text = `Olá, vi o anúncio "${property.title}" na 77 Imóveis e gostaria de mais informações.`;
    window.open(`https://wa.me/${property.advertiser_whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePhone = () => {
    if (!property?.advertiser_phone) return;
    window.href = `tel:${property.advertiser_phone}`;
  };

  const handleFormSubmit = async () => {
    if (!formName || !formEmail || !formPhone) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setFormSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setFormSending(false);
    setFormSuccess(true);
    setFormMessage("");
    // Optional: alert or toast
  };

  if (loading) {
    return (
      <>
        <Seo title="Carregando..." />
        <Container className="py-10">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 rounded-2xl w-full"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </Container>
      </>
    );
  }

  if (errorMsg || !property) {
    return (
      <>
        <Seo title="Erro | 77 Imóveis" />
        <Container className="py-10">
          <div className="rounded-xl border p-12 text-center bg-gray-50">
            <div className="font-semibold text-xl mb-2 text-gray-900">Ops! Algo deu errado.</div>
            <div className="text-gray-500 mb-6">{errorMsg ?? "Imóvel não encontrado."}</div>
            <Button onClick={() => window.history.back()}>Voltar</Button>
          </div>
        </Container>
      </>
    );
  }

  const priceLabel = property.purpose === "aluguel" ? moneyBRL(property.rent) : moneyBRL(property.price);
  const displayPhotos = photos.length > 0 ? photos : [{ id: '1', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80' }];

  return (
    <>
      <Seo title={`77 Imóveis | ${property.title}`} />

      <Container className="py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lime-600 font-semibold text-sm uppercase tracking-wide">
              <span>{property.type || "Imóvel"}</span>
              <span>•</span>
              <span>{property.purpose === "venda" ? "Venda" : "Aluguel"}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{property.title}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="size-4" />
              <span>{property.address ? `${property.address}, ` : ""}{property.neighborhood}, {property.city} - {property.state}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-gray-600 hover:text-lime-600">
              <Share2 className="size-4" /> Compartilhar
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-gray-600 hover:text-red-500">
              <Heart className="size-4" /> Salvar
            </Button>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
          {/* Main Big Photo */}
          <div className="md:col-span-2 md:row-span-2 relative h-full">
            <img
              src={displayPhotos[0]?.url}
              alt="Principal"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
              onClick={() => openGallery(0)}
            />
          </div>
          {/* Thumbs */}
          {displayPhotos.slice(1, 5).map((photo, index) => (
            <div
              key={index}
              className={`hidden md:block relative bg-gray-100 ${index === 1 ? 'rounded-tr-2xl' : ''} ${index === 3 ? 'rounded-br-2xl group cursor-pointer' : ''}`}
              onClick={() => openGallery(index + 1)}
            >
              <img
                src={photo.url || displayPhotos[0].url}
                alt={`Galeria ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
              />
              {index === 3 && displayPhotos.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-lg backdrop-blur-[2px] transition-all group-hover:bg-black/30">
                  +{displayPhotos.length - 5} fotos
                </div>
              )}
            </div>
          ))}
          {/* Fill empty spots if less than 5 photos (simplified) */}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          <div className="lg:col-span-2 space-y-10">
            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <Bed className="size-6 text-lime-600 mb-1" />
                <span className="font-bold text-gray-900 text-lg">{property.bedrooms ?? 0}</span>
                <span className="text-xs text-gray-500 uppercase font-medium">Quartos</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-1 border-l sm:border-l border-gray-200">
                <Bath className="size-6 text-lime-600 mb-1" />
                <span className="font-bold text-gray-900 text-lg">{property.bathrooms ?? 0}</span>
                <span className="text-xs text-gray-500 uppercase font-medium">Banheiros</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-1 border-r sm:border-r border-gray-200">
                <Car className="size-6 text-lime-600 mb-1" />
                <span className="font-bold text-gray-900 text-lg">{property.garage ?? 0}</span>
                <span className="text-xs text-gray-500 uppercase font-medium">Vagas</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-1">
                <Maximize className="size-6 text-lime-600 mb-1" />
                <span className="font-bold text-gray-900 text-lg">{property.area_m2 ?? 0}</span>
                <span className="text-xs text-gray-500 uppercase font-medium">m² Útil</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Sobre este imóvel</h2>
              <div className="prose prose-gray max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                {property.description || "Descrição não informada pelo proprietário."}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4 pt-8 border-t border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">O que esse lugar oferece</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Ar condicionado", "Piscina", "Churrasqueira", "Portaria 24h", "Academia", "Salão de festas"].map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-600">
                    <div className="p-1 bg-lime-100 rounded-full">
                      <Check className="size-3 text-lime-700" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="relative">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 p-6 space-y-6">
                {/* Price */}
                <div className="space-y-1 pb-4 border-b border-gray-100">
                  <span className="text-sm text-gray-500 block">Valor de {property.purpose}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-lime-600">{priceLabel}</span>
                    {property.purpose === "aluguel" && <span className="text-gray-500">/mês</span>}
                  </div>
                  <div className="mt-2 text-sm text-gray-500 flex flex-col gap-1">
                    {property.condominio && <div className="flex justify-between"><span>Condomínio:</span> <span>R$ {property.condominio}</span></div>}
                    {property.iptu && <div className="flex justify-between"><span>IPTU:</span> <span>R$ {property.iptu}</span></div>}
                  </div>
                </div>

                {/* Contact Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Fale com {property.advertiser_name ?? "o anunciante"}
                  </h3>

                  {formSuccess ? (
                    <div className="bg-lime-50 border border-lime-200 rounded-xl p-6 text-center animate-in fade-in zoom-in-95">
                      <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="size-6 text-lime-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Mensagem enviada!</h4>
                      <p className="text-sm text-gray-600 mb-4">Em breve entraremos em contato com você.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormSuccess(false)}
                        className="text-gray-500"
                      >
                        Enviar nova mensagem
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Input
                        placeholder="Nome completo"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        disabled={formSending}
                      />
                      <Input
                        placeholder="E-mail"
                        type="email"
                        value={formEmail}
                        onChange={e => setFormEmail(e.target.value)}
                        disabled={formSending}
                      />
                      <Input
                        placeholder="Telefone"
                        type="tel"
                        value={formPhone}
                        onChange={e => setFormPhone(e.target.value)}
                        disabled={formSending}
                      />
                      <Textarea
                        placeholder="Mensagem"
                        value={formMessage}
                        onChange={e => setFormMessage(e.target.value)}
                        className="min-h-[100px]"
                        disabled={formSending}
                      />

                      <Button
                        className="w-full bg-lime-600 hover:bg-lime-700 text-lg h-12"
                        onClick={handleFormSubmit}
                        disabled={formSending}
                      >
                        {formSending ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando...
                          </span>
                        ) : (
                          "Enviar Mensagem"
                        )}
                      </Button>
                    </>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">ou contate via</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="size-4 mr-2" /> WhatsApp
                  </Button>
                  <a href={`tel:${property.advertiser_phone}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <Phone className="size-4 mr-2" /> Ligar
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>

      {/* Slideshow Gallery Overlay */}
      {galleryOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center backdrop-blur-sm"
          onClick={closeGallery}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeGallery(); }}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
          >
            <X className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
          </button>

          <div className="relative max-h-[85vh] max-w-[90vw] select-none" onClick={(e) => e.stopPropagation()}>
            <img
              src={displayPhotos[currentImageIndex]?.url}
              alt={`Foto ${currentImageIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-300"
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/60 font-medium">
              {currentImageIndex + 1} de {displayPhotos.length}
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
          </button>
        </div>
      )}
    </>
  );
}
