export const paths = {
  home: "/",
  listings: "/imoveis",

  aluguel: "/aluguel",
  venda: "/venda",
  lancamentos: "/lancamentos",

  listingsByCity: (city: string) => `/${city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")}`,
  listingsByPurposeCity: (purpose: string, city: string) =>
    `/${purpose}/${city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")}`,
  listingsByPurposeCityType: (purpose: string, city: string, type: string) =>
    `/${purpose}/${city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")}/${type}`,

  property: (idOrSlug: string) => `/imovel/${idOrSlug}`,

  login: "/login",
  register: "/cadastro",
  registerImobiliaria: "/cadastro/imobiliaria",
  registerCorretor: "/cadastro/corretor",
  registerUsuario: "/cadastro/usuario",

  dashImobiliaria: "/dashboard/imobiliaria",
  dashImobiliariaProps: "/dashboard/imobiliaria/imoveis",
  dashImobiliariaNew: "/dashboard/imobiliaria/imoveis/novo",
  dashImobiliariaEdit: (id: string) => `/dashboard/imobiliaria/imoveis/${id}`,

  dashCorretor: "/dashboard/corretor",
  dashCorretorProps: "/dashboard/corretor/imoveis",
  dashCorretorNew: "/dashboard/corretor/imoveis/novo",
  dashCorretorEdit: (id: string) => `/dashboard/corretor/imoveis/${id}`,

  dashUsuario: "/dashboard/usuario",
  dashUsuarioEstatisticas: "/dashboard/usuario/estatisticas",
  dashUsuarioImoveis: "/dashboard/usuario/imoveis",
  dashUsuarioFavoritos: "/dashboard/usuario/favoritos",
  dashUsuarioClientes: "/dashboard/usuario/clientes",
  dashUsuarioMensagens: "/dashboard/usuario/mensagens",
  dashUsuarioConfiguracoes: "/dashboard/usuario/configuracoes",
  dashUsuarioCriarImobiliaria: "/dashboard/usuario/criar-imobiliaria",
  dashUsuarioImovelNovo: "/dashboard/usuario/imoveis/novo",
  dashUsuarioImovelEditar: (id: string) => `/dashboard/usuario/imoveis/${id}`,
  dashUsuarioCorretor: "/dashboard/usuario/corretor",
  dashUsuarioImobiliarias: "/dashboard/usuario/imobiliarias",

  support: "/ajuda-suporte",
  profileImobiliaria: "/perfil/imobiliaria",
  profileCorretor: "/perfil/corretor",

  contact: "/contato",
  plans: "/planos",
  terms: "/termos",
  privacy: "/privacidade",
  cookies: "/cookies",
} as const;
