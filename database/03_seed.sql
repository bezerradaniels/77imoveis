-- =====================================================================
-- 77IMÓVEIS — Arquivo 03: SEED (dados iniciais)
-- Catálogo (tipos, disponibilidades, características), cidades do DDD 77
-- de lançamento + bairros, especialidades e planos.
-- =====================================================================

-- ---------------------------------------------------------------------
-- TIPOS DE IMÓVEL
-- ---------------------------------------------------------------------
insert into property_types (name, slug, icon, sort) values
  ('Casa','casa','home',1),
  ('Apartamento','apartamento','building',2),
  ('Cobertura','cobertura','building-2',3),
  ('Kitnet','kitnet','door-open',4),
  ('Condomínio','condominio','houses',5),
  ('Sala Comercial','sala-comercial','briefcase',6),
  ('Loja','loja','store',7),
  ('Galpão','galpao','warehouse',8),
  ('Terreno','terreno','land-plot',9),
  ('Lote','lote','grid',10),
  ('Chácara','chacara','trees',11),
  ('Fazenda','fazenda','tractor',12)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- DISPONIBILIDADES
-- ---------------------------------------------------------------------
insert into availabilities (name, slug, sort) values
  ('À venda','a-venda',1),
  ('Para aluguel','para-aluguel',2),
  ('Lançamento','lancamento',3),
  ('Em construção','em-construcao',4),
  ('Pronto para morar','pronto-para-morar',5),
  ('Temporada','temporada',6)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- CARACTERÍSTICAS (features) por categoria
-- ---------------------------------------------------------------------
insert into features (name, slug, category, icon) values
  ('Piscina','piscina','lazer','waves'),
  ('Churrasqueira','churrasqueira','lazer','flame'),
  ('Academia','academia','lazer','dumbbell'),
  ('Salão de festas','salao-de-festas','lazer','party-popper'),
  ('Jardim','jardim','lazer','flower'),
  ('Varanda / Sacada','varanda','lazer','panel-top'),
  ('Aceita pet','aceita-pet','regras','dog'),
  ('Mobiliado','mobiliado','interno','sofa'),
  ('Elevador','elevador','interno','arrow-up-down'),
  ('Ar-condicionado','ar-condicionado','interno','wind'),
  ('Energia solar','energia-solar','sustentavel','sun'),
  ('Condomínio fechado','condominio-fechado','seguranca','shield'),
  ('Portaria 24h','portaria-24h','seguranca','shield-check'),
  ('Câmeras de segurança','cameras','seguranca','cctv'),
  ('Acessibilidade','acessibilidade','acessibilidade','accessibility'),
  ('Próximo a escola','proximo-escola','proximidades','school'),
  ('Próximo a supermercado','proximo-supermercado','proximidades','shopping-cart'),
  ('Próximo a hospital','proximo-hospital','proximidades','cross'),
  ('Próximo a transporte','proximo-transporte','proximidades','bus')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- ESPECIALIDADES (diretório profissional)
-- ---------------------------------------------------------------------
insert into specialties (name, slug) values
  ('Compra e venda','compra-e-venda'),
  ('Locação','locacao'),
  ('Lançamentos','lancamentos'),
  ('Imóveis de luxo','imoveis-de-luxo'),
  ('Imóveis rurais','imoveis-rurais'),
  ('Avaliação de imóveis','avaliacao'),
  ('Projetos residenciais','projetos-residenciais'),
  ('Projetos comerciais','projetos-comerciais'),
  ('Reformas','reformas'),
  ('Regularização / Topografia','regularizacao-topografia'),
  ('Energia solar','energia-solar'),
  ('Financiamento imobiliário','financiamento')
on conflict (slug) do nothing;

-- =====================================================================
-- CIDADES DE LANÇAMENTO (DDD 77 — Bahia)  + textos de SEO/GEO
-- =====================================================================
insert into cities (name, slug, state, ddd, latitude, longitude, is_featured, population, seo_title, seo_description, intro_text) values
  ('Vitória da Conquista','vitoria-da-conquista','BA',77,-14.8615,-40.8442,true,374000,
   'Imóveis em Vitória da Conquista (BA) | 77Imóveis',
   'Casas, apartamentos e terrenos à venda e para alugar em Vitória da Conquista. Anúncios de imobiliárias e corretores do Oeste da Bahia.',
   'Vitória da Conquista é a terceira maior cidade da Bahia e principal polo do sudoeste baiano, com forte mercado imobiliário em bairros como Recreio, Candeias e Centro.'),
  ('Barreiras','barreiras','BA',77,-12.1428,-44.9967,true,160000,
   'Imóveis em Barreiras (BA) | 77Imóveis',
   'Encontre casas, apartamentos, terrenos e imóveis rurais em Barreiras, no oeste da Bahia. Anúncios atualizados de toda a região.',
   'Barreiras é o maior polo do agronegócio do oeste baiano, com mercado imobiliário aquecido por casas, apartamentos e fazendas.'),
  ('Luís Eduardo Magalhães','luis-eduardo-magalhaes','BA',77,-12.0917,-45.7975,true,90000,
   'Imóveis em Luís Eduardo Magalhães (BA) | 77Imóveis',
   'Casas, apartamentos e terrenos à venda e para alugar em Luís Eduardo Magalhães, capital nacional do agronegócio.',
   'Luís Eduardo Magalhães cresce impulsionada pelo agronegócio, com grande demanda por imóveis residenciais e comerciais.'),
  ('Guanambi','guanambi','BA',77,-14.2231,-42.7806,true,88000,
   'Imóveis em Guanambi (BA) | 77Imóveis',
   'Anúncios de casas, apartamentos e terrenos em Guanambi, no sudoeste da Bahia. Compre, venda ou alugue no Oeste da Bahia.',
   'Guanambi é um importante centro de comércio e serviços do sudoeste baiano, com bairros valorizados como Brasília e Aeroporto.'),
  ('Brumado','brumado','BA',77,-14.2036,-41.6653,true,70000,
   'Imóveis em Brumado (BA) | 77Imóveis',
   'Casas, apartamentos e terrenos à venda e para alugar em Brumado, na Bahia. Anúncios do Oeste da Bahia.',
   'Brumado, conhecida pela mineração de magnesita, tem mercado imobiliário ativo no centro e bairros residenciais.'),
  ('Bom Jesus da Lapa','bom-jesus-da-lapa','BA',77,-13.2550,-43.4180,true,70000,
   'Imóveis em Bom Jesus da Lapa (BA) | 77Imóveis',
   'Encontre imóveis à venda e para alugar em Bom Jesus da Lapa, às margens do Rio São Francisco.',
   'Bom Jesus da Lapa, importante centro religioso e turístico do São Francisco, combina imóveis urbanos e de temporada.'),
  ('Santa Maria da Vitória','santa-maria-da-vitoria','BA',77,-13.3897,-44.1897,true,42000,
   'Imóveis em Santa Maria da Vitória (BA) | 77Imóveis',
   'Casas, terrenos e imóveis à venda e para alugar em Santa Maria da Vitória, oeste da Bahia.',
   'Santa Maria da Vitória é polo regional do vale do Rio Corrente, com demanda crescente por imóveis residenciais.')
on conflict (slug) do nothing;

-- =====================================================================
-- BAIRROS por cidade
-- (helper: insere bairros gerando slug com unaccent)
-- =====================================================================
-- Vitória da Conquista
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Centro'),('Recreio'),('Candeias'),('Brasil'),('Alto Maron'),('Patagônia'),
  ('Zabelê'),('Boa Vista'),('Felícia'),('Jurema'),('Guarani'),('Ibirapuera'),
  ('Primavera'),('Espírito Santo'),('Jardim Valéria'),('Universidade')
) as b(name)
where c.slug = 'vitoria-da-conquista'
on conflict do nothing;

-- Barreiras
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Centro'),('Rio Grande'),('Vila Brasil'),('Jardim Ouro Branco'),('Boa Sorte'),
  ('São Sebastião'),('Vila Nova'),('Sandra Regina'),('Morada Nobre'),('Bandeirante'),
  ('Renato Gonçalves'),('Vila Dulce')
) as b(name)
where c.slug = 'barreiras'
on conflict do nothing;

-- Luís Eduardo Magalhães
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Centro'),('Jardim Primavera'),('Mimoso'),('Santa Cruz'),('Novo Horizonte'),
  ('Jardim das Acácias'),('Industrial'),('Universitário')
) as b(name)
where c.slug = 'luis-eduardo-magalhaes'
on conflict do nothing;

-- Guanambi
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Centro'),('Brasília'),('Aeroporto'),('Santo Antônio'),('Ipiranga'),('Novo Horizonte'),
  ('São Francisco'),('Santa Luzia'),('Vila Nova'),('Monte Pascoal'),('Industrial')
) as b(name)
where c.slug = 'guanambi'
on conflict do nothing;

-- Brumado
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Centro'),('São Félix'),('Bandeira'),('Urbis I'),('Urbis II'),('Dr. Juracy'),
  ('Bairro Novo'),('São José'),('Vila Presidente Vargas')
) as b(name)
where c.slug = 'brumado'
on conflict do nothing;

-- Bom Jesus da Lapa
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Centro'),('São João'),('Bom Jesus'),('Vila Vitória'),('Itapiranga'),
  ('Bandeirante'),('Nova Lapa'),('São Geraldo')
) as b(name)
where c.slug = 'bom-jesus-da-lapa'
on conflict do nothing;

-- Santa Maria da Vitória
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Centro'),('São José'),('Bela Vista'),('Nova Vitória'),('Beira Rio'),('Vila Mariana')
) as b(name)
where c.slug = 'santa-maria-da-vitoria'
on conflict do nothing;

-- =====================================================================
-- PLANOS (sugestão de tabela — pode ajustar preços no admin)
-- B2C gratuito (1 imóvel) | B2B gratuito até 10 | tiers pagos
-- =====================================================================
insert into plans (name, slug, audience, max_active_listings, price, interval, included_featured, highlight, benefits, sort) values
  ('Particular','particular-gratuito','b2c',1,0,'mensal',0,false,
   '["1 imóvel ativo gratuito","Botão de WhatsApp","Página otimizada para o Google"]'::jsonb,1),
  ('Profissional Free','profissional-free','b2b',10,0,'mensal',0,false,
   '["Até 10 imóveis ativos","Perfil de empresa","Painel com lista de contatos","Botão de WhatsApp"]'::jsonb,2),
  ('Profissional 30','profissional-30','b2b',30,99.90,'mensal',2,true,
   '["Até 30 imóveis ativos","2 destaques por mês","Selo verificado","Suporte prioritário","Relatórios"]'::jsonb,3),
  ('Profissional 80','profissional-80','b2b',80,199.90,'mensal',5,false,
   '["Até 80 imóveis ativos","5 destaques por mês","Selo verificado","Empresa em destaque no diretório","Relatórios avançados"]'::jsonb,4),
  ('Imobiliária Ilimitada','imobiliaria-ilimitada','b2b',100000,399.90,'mensal',12,false,
   '["Imóveis ilimitados","12 destaques por mês","Empresa em destaque","Banner na busca da sua cidade","Gerente de conta"]'::jsonb,5)
on conflict (slug) do nothing;

-- =====================================================================
-- CATEGORIAS DO BLOG
-- =====================================================================
insert into blog_categories (name, slug) values
  ('Mercado Imobiliário','mercado-imobiliario'),
  ('Financiamento','financiamento'),
  ('Construção','construcao'),
  ('Arquitetura','arquitetura'),
  ('Decoração','decoracao'),
  ('Investimento','investimento'),
  ('Notícias da Região','noticias-da-regiao')
on conflict (slug) do nothing;

-- =====================================================================
-- CONFIGURAÇÕES DO SITE
-- =====================================================================
insert into site_settings (key, value) values
  ('contato', '{"whatsapp":"5577999999999","email":"contato@77imoveis.com.br"}'::jsonb),
  ('seo',     '{"site_name":"77Imóveis","default_og_image":"/og-default.jpg"}'::jsonb)
on conflict (key) do nothing;

-- FIM DO ARQUIVO 03_seed.sql
