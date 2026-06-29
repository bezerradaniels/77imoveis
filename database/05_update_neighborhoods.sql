-- =====================================================================
-- 77IMÓVEIS — Migration 05: Update Neighborhood Data
-- This migration safely adds the complete neighborhood lists for all 7 cities
-- using composite conflict targets to prevent duplicates within the same city
-- while allowing same-name neighborhoods in different cities.
-- =====================================================================

-- This migration is idempotent and can be run multiple times safely.
-- It uses ON CONFLICT (city_id, slug) to prevent duplicates within the same city.

-- Bom Jesus da Lapa (30 bairros)
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Amaralina'),('Barrinha'),('Beira Rio'),('Cavalhadas'),('Centro'),('Guarani'),
  ('João Paulo II'),('Jurema'),('Lagoa Grande'),('Loteamento Mirante da Lapa'),
  ('Loteamento Nova Lapa'),('Loteamento São Conrado'),('Magalhães Neto'),('Maravilha I'),
  ('Maravilha II'),('Maribondo'),('Nova Brasília'),('Nova Jerusalém / Campinhos'),
  ('Parque Verde'),('Residencial B. J. da Lapa'),('Residencial Primavera I'),
  ('Residencial Primavera II'),('Residencial Vale Verde'),('Salinas'),('São Gotardo'),
  ('São João'),('São Miguel'),('Senhora da Soledade'),('Shangri-lá'),('Vila Nova')
) as b(name)
where c.slug = 'bom-jesus-da-lapa'
on conflict (city_id, slug) do nothing;

-- Vitória da Conquista (89 bairros)
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Alegria'),('Alto da Boa Vista'),('Alto Maron'),('Alvorada'),('Ayrton Senna'),
  ('Bateias'),('Bem-Querer'),('Boa Vista'),('Brasil'),('Bruno Bacelar'),
  ('Caminho da UESB'),('Caminho do Parque'),('Campinhos'),('Candeias'),('Centro'),
  ('Cidade Maravilhosa'),('Cidade Modelo'),('Cidade Serrana'),('Conquistinha'),
  ('Conveima I'),('Conveima II'),('Cruzeiro'),('Distrito Industrial'),
  ('Esplanada do Parque'),('Espírito Santo'),('Felícia'),('Flamengo'),('Guarani'),
  ('Henriqueta Prates'),('Ibirapuera'),('Inocoop I'),('Inocoop II'),('Ipanema'),
  ('Iracema'),('Jardim Candeias'),('Jardim Copacabana'),('Jardim Guanabara'),
  ('Jatobá'),('Jurema'),('Kadija'),('Lagoa das Flores'),('Loteamento Bateias II'),
  ('Loteamento Conquistense'),('Loteamento Leblon'),('Loteamento Porto Seguro'),
  ('Loteamento Sol Nascente'),('Miro Cairo'),('Morada da Primavera'),
  ('Morada dos Pássaros I'),('Morada dos Pássaros II'),('Morada dos Pássaros III'),
  ('Morada Nobre do Candeias'),('Morada Nova'),('Morada Real'),
  ('Nossa Senhora Aparecida'),('Nova Cidade'),('Orfanato'),('Panorama'),('Patagônia'),
  ('Primavera'),('Recanto das Águas'),('Recanto dos Pássaros'),('Recreio'),
  ('Renato Magalhães'),('Santa Cecília'),('Santa Cruz'),('Santa Tereza'),
  ('Santa Terezinha'),('São Pedro'),('São Vicente'),('Senhorinha Cairo'),('Simão'),
  ('Sumaré'),('Terras do Remanso'),('UESB'),('Universidade'),('Urbis I'),
  ('Urbis II'),('Urbis III'),('Urbis IV'),('Urbis V'),('Urbis VI'),('Vila América'),
  ('Vila da Conquista'),('Vila Elisa'),('Vila Marina'),('Vilas Serranas'),
  ('Vivendas da Serra'),('Zabelê')
) as b(name)
where c.slug = 'vitoria-da-conquista'
on conflict (city_id, slug) do nothing;

-- Barreiras (55 bairros)
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Alphaville'),('Antônio Geraldo'),('Aratu'),('Arboreto I'),('Arboreto II'),
  ('Bandeirantes'),('Barreiras I'),('Barreiras II'),('Barreirinhas'),('Bela Vista'),
  ('Boa Sorte'),('Boa Vista'),('Buritis'),('Cascalheira'),('Centro'),('Cidade Nova'),
  ('Copacabana'),('Firenze'),('Flamengo'),('Jardim Ouro Branco'),('Jardim Vitória'),
  ('Jardins'),('Juri'),('Juscelino Kubitschek'),('Mimoso'),('Morada da Lua'),
  ('Morada Nobre'),('Nova Barreiras'),('Novo Horizonte'),('Parque Santa Lúcia'),
  ('Parque Verde'),('Primavera'),('Recanto dos Pássaros'),('Renato Gonçalves'),
  ('Ribeirão'),('Rio Grande'),('Sandra Regina'),('Santa Luzia'),('Santo Antônio'),
  ('São Francisco'),('São Miguel'),('São Paulo'),('São Pedro'),('São Sebastião'),
  ('Serra do Mimo'),('Sombra da Tarde'),('Vila Amorim'),('Vila Brasil'),
  ('Vila dos Funcionários'),('Vila dos Sais'),('Vila dos Soldados'),('Vila Dulce'),
  ('Vila Nova'),('Vila Regina'),('Vila Rica')
) as b(name)
where c.slug = 'barreiras'
on conflict (city_id, slug) do nothing;

-- Luís Eduardo Magalhães (84 bairros)
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('90 Comercial'),('Alto da Lagoa'),('Alto dos Cerrados'),('Aroldo da Cruz'),('Avenida'),
  ('Bahia Farm'),('Bairro Independente'),('Boa Vista'),('Bosque dos Girassóis 01'),
  ('Bosque dos Girassóis 02'),('Bosque Malls'),('Campos Elíseos'),('Central Park'),
  ('Centro'),('Centro Industrial do Cerrado'),('Chácaras Comerciais Leste'),
  ('Chácaras Rio de Pedras'),('Chácaras Santa Cruz I e II'),('Chiodi'),('Cidade Alta'),
  ('Cidade do Automóvel'),('Cidade Santa Cruz'),('Cidade Santa Cruz II'),
  ('Cidade Santa Cruz III'),('Cidade Universitária'),('Cidade Universitária II'),
  ('Conquista'),('Conquista II'),('Dom Laurindo'),('Florais Léa'),('Florais Léa II'),
  ('Florais Léa III'),('Jardim Alvorada'),('Jardim das Acácias'),('Jardim das Acácias II'),
  ('Jardim das Acácias III'),('Jardim das Oliveiras'),('Jardim das Oliveiras 2ª Fase'),
  ('Jardim das Oliveiras 3ª Fase'),('Jardim do Bem'),('Jardim Europa'),
  ('Jardim Imperial'),('Jardim Ipê'),('Jardim Paraíso'),('Jardim Paraíso II'),
  ('Jardim Paraíso III'),('Jardim Primavera'),('Jardim Primavera I'),
  ('Jardim Primavera II'),('Jardim Sol Nascente'),('JK'),('Lea Cordeiro'),
  ('Luar do Oeste'),('Luar dos Cerrados'),('Mimoso do Oeste'),('Mimoso do Oeste 2ª Etapa'),
  ('Nova Brasília I'),('Nova Brasília II'),('Novo Paraíso'),('Novo Paraíso II'),
  ('Novo Paraná'),('Ondumar Marabá'),('Paraíso Leste'),('Parque Oeste'),
  ('Parque São José'),('Portal das Águas - Fase I'),('Recanto dos Pássaros'),
  ('Residencial 90'),('Santa Cruz'),('Setor C Sul Arnaldo H Ferreira'),
  ('Setor Com. Sul Arnaldo H. Ferreira'),('Setor M3'),('Sol do Cerrado'),
  ('Sol Nascente II'),('Solar do Oeste'),('Solar dos Buritis'),('Solar Santa Cruz 1ª Etapa'),
  ('Top Park'),('Tropical Ville'),('Tropical Ville II'),('Universitário'),
  ('Vereda Tropical'),('Vista Alegre'),('Vista Verde')
) as b(name)
where c.slug = 'luis-eduardo-magalhaes'
on conflict (city_id, slug) do nothing;

-- Guanambi (72 bairros)
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Aeroporto Velho'),('Alazão'),('Alto Caiçara'),('Alvorada'),('Amambaí'),('Araújo'),
  ('Aroeira'),('Beija-Flor'),('Bela Vista'),('Belo Horizonte'),('Boa Vista'),('Bom Jesus'),
  ('Brasília'),('Brindes'),('Caiçara'),('Candeal'),('Centro'),('Cidade Nova'),
  ('Condomínio Chalés Porto da Pedra'),('Conjunto Habitacional Beneval'),
  ('Conjunto Habitacional Monte Azul'),('Deus Dará'),('Floresta'),('Industrial'),
  ('Ipanema'),('Ipiranga'),('Jardim Aeroporto'),('Jardim Vilson'),('Lagoinha'),
  ('Liberdade'),('Loteamento Anita Cardoso'),('Loteamento Cirqueira'),
  ('Loteamento Cirqueira 2'),('Loteamento Dr. José Humberto Nunes'),
  ('Loteamento Gameleiras'),('Loteamento Germínio Augusto da Silva'),
  ('Loteamento Nossa Senhora das Graças'),('Loteamento Pereira'),
  ('Loteamento Pôr do Sol'),('Loteamento Pôr do Sol 2'),('Loteamento Santa Maria'),
  ('Loteamento Santa Rita'),('Loteamento Vilas Boas'),('Marabá'),('Maria Bastos'),
  ('Maria de Fátima'),('Manoel Cotrim'),('Massaranduba'),('Monte Pascoal'),
  ('Morada Nova'),('Nova Esperança'),('Nova Olinda'),('Novo Horizonte'),('Paraíso'),
  ('Park Boulevard'),('Renascer'),('Renascer 2'),('Santa Catarina'),('Santa Luzia'),
  ('Santo Antônio'),('São Francisco'),('São João'),('São José'),('São Sebastião'),
  ('São Vicente'),('Sandoval Moraes'),('Sol Nascente'),('Sossego'),('Urbis'),
  ('Vila Nova'),('Vista Alegre'),('Vomitamel')
) as b(name)
where c.slug = 'guanambi'
on conflict (city_id, slug) do nothing;

-- Brumado (39 bairros)
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('Apertado do Morro'),('Bairro Cinco'),('Bairro das Flores'),('Baraúnas'),('Bom Jesus'),
  ('Brisas'),('Centenário'),('Centro'),('Cidade das Esmeraldas'),('Das Flores'),
  ('Doutor Juracy'),('Esconso'),('Feliciano Pereira Santos'),('Ginásio Industrial'),
  ('Jardim Brasil'),('Jardim de Alá'),('Malhada Branca'),('Maria José Viana'),
  ('Maria Nilza Azevedo'),('Meiras'),('Mercado'),('Monsenhor Antônio Fagundes'),
  ('Nobre'),('Norberto Marinho'),('Novo Brumado'),('Olhos d''Água'),('Parque Alvorada'),
  ('Parque dos Juzeiros'),('Santa Tereza'),('São Félix'),('São Joaquim'),('São Jorge'),
  ('São José'),('São Lourenço'),('São Sebastião'),('Tanque do Abaeté'),('Urbis II'),
  ('Urbis IV'),('Vila Presidente Vargas')
) as b(name)
where c.slug = 'brumado'
on conflict (city_id, slug) do nothing;

-- Santa Maria da Vitória (17 bairros)
insert into neighborhoods (city_id, name, slug)
select c.id, b.name, lower(regexp_replace(unaccent(b.name),'[^a-zA-Z0-9]+','-','g'))
from cities c, (values
  ('AABB'),('Alto do Cruzeiro'),('Bebedouro'),('Centro'),('Dr. Roberto'),
  ('Jardim América'),('Loteamento Alto Paraíso'),('Macambira'),('Malvão'),
  ('Morada da Lua'),('Morada do Sol'),('Parque de Exposição'),('Sambaíba'),
  ('Setor Aeroporto'),('Setor Carranca'),('Vila Formosa'),('Vila Nova')
) as b(name)
where c.slug = 'santa-maria-da-vitoria'
on conflict (city_id, slug) do nothing;

-- =====================================================================
-- Verification query (run after migration to check results)
-- =====================================================================
-- Uncomment to verify the migration:
-- 
-- SELECT 
--   c.name as city,
--   COUNT(n.id) as neighborhood_count
-- FROM cities c
-- LEFT JOIN neighborhoods n ON n.city_id = c.id
-- WHERE c.state = 'BA' AND c.ddd = 77
-- GROUP BY c.name
-- ORDER BY c.name;
--
-- Expected results:
-- - Bom Jesus da Lapa: 30
-- - Vitória da Conquista: 89
-- - Barreiras: 55
-- - Luís Eduardo Magalhães: 84
-- - Guanambi: 72
-- - Brumado: 39
-- - Santa Maria da Vitória: 17
