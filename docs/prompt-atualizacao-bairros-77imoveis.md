# Prompt — Update Neighborhood Data in 77imoveis Portal

You are a senior full-stack engineer specialized in Next.js, Supabase, PostgreSQL, data modeling, real estate marketplaces, SEO-friendly routing, and scalable data migration.

I need you to update the neighborhood data structure, database records, and application logic in the 77imoveis real estate portal.

---

## Project context

77imoveis is a regional real estate marketplace focused on cities in Western Bahia, Brazil.

The platform allows users to browse, create, manage, and search property listings by:

- city
- neighborhood
- property type
- transaction type
- price
- company
- professional profile
- advertiser type

The portal includes:

- public property discovery pages
- city pages
- neighborhood pages
- property detail pages
- advertiser onboarding flows
- B2C property submission
- B2B dashboards
- admin and moderation areas
- company profiles
- search filters
- SEO and GEO-oriented pages

Properties are listed by city and neighborhood.

The same neighborhood name may exist in different cities. Therefore, neighborhoods must never be treated as globally unique by name only.

Examples:

- `Centro` may exist in Barreiras, Vitória da Conquista, Guanambi, Brumado, Santa Maria da Vitória, Bom Jesus da Lapa, and Luís Eduardo Magalhães.
- `Boa Vista` may exist in more than one city.
- `Vila Nova` may exist in more than one city.
- These are different neighborhood records because they belong to different cities.

---

## Main goal

Update the Supabase database tables, migration scripts, seed/upsert scripts, and application logic so that neighborhoods are correctly linked to their respective city.

The implementation must:

- prevent duplicated neighborhoods inside the same city
- allow the same neighborhood name to exist in different cities
- correctly assign each property to the neighborhood that belongs to its selected city
- keep property creation, editing, dashboards, filters, admin flows, and SEO URLs working correctly
- avoid breaking existing listings
- avoid creating duplicated city records
- avoid treating neighborhood names as globally unique

---

## Critical rule

Do not treat neighborhood names as globally unique.

Always resolve neighborhoods using one of these pairs:

- `city_id + neighborhood_name`
- `city_id + neighborhood_slug`
- `city_slug + neighborhood_slug`

Never resolve, upsert, filter, migrate, or assign neighborhoods by name alone.

The same neighborhood name in different cities must remain separate and correctly assigned to the city of the property.

---

# 1. Database review

Inspect the current Supabase schema and application code related to:

- cities
- neighborhoods
- properties
- property listings
- company profiles
- advertiser profiles
- filters
- onboarding forms
- dashboard forms
- public search pages
- city pages
- neighborhood pages
- property detail pages
- admin tools
- moderation tools
- SEO route generation

Identify how neighborhoods are currently stored.

Check whether neighborhoods are currently stored as:

- plain text
- foreign keys
- IDs
- slugs
- duplicated values
- JSON fields
- form-only values
- loosely typed strings

Document the current situation before applying changes.

---

# 2. Correct data modeling

Ensure there is a proper `neighborhoods` table or equivalent structure.

Each neighborhood must belong to exactly one city.

The `neighborhoods` table must have a required `city_id` foreign key.

Recommended structure:

```sql
create table if not exists neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references cities(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  slug text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(city_id, normalized_name),
  unique(city_id, slug)
);
```

If the table already exists, update it safely without losing data.

Neighborhood names must be unique only within the same city.

Correct uniqueness rules:

```sql
unique(city_id, normalized_name)
```

and/or:

```sql
unique(city_id, slug)
```

Incorrect rule:

```sql
unique(name)
```

Do not create or keep a global unique constraint on neighborhood name alone.

---

# 3. Cities table expectations

The `cities` table should support stable lookups by normalized city name and state.

Recommended fields:

```sql
id uuid primary key default gen_random_uuid(),
name text not null,
state text not null,
slug text not null,
normalized_name text not null,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Recommended uniqueness:

```sql
unique(state, normalized_name)
```

or:

```sql
unique(state, slug)
```

Do not create duplicated city entries.

If a city already exists, reuse its existing `city_id`.

---

# 4. Normalization requirements

Before inserting, updating, comparing, or migrating neighborhoods, normalize names for comparison.

Normalization must handle:

- uppercase and lowercase differences
- leading and trailing spaces
- repeated internal spaces
- accents and diacritics when appropriate
- punctuation inconsistencies
- repeated hyphens
- invalid slug characters
- inconsistent slash spacing
- inconsistent ordinal formatting
- minor differences in abbreviations

Examples:

- `Centro`
- ` centro `
- `CENTRO`

These should be considered the same neighborhood inside the same city.

Examples:

- `São João`
- `Sao Joao`

These should resolve to the same normalized value when accent-insensitive normalization is used.

Examples:

- `Nova Jerusalém / Campinhos`
- `Nova Jerusalem/Campinhos`

These should not become two records inside the same city unless there is a clear reason.

However:

- `Centro` in Barreiras
- `Centro` in Vitória da Conquista

must be two separate records because their `city_id` values are different.

---

# 5. Slug generation

Generate slugs from the original display names.

Slug rules:

- lowercase
- remove accents
- trim spaces
- replace spaces with hyphens
- remove invalid URL characters
- replace repeated hyphens with a single hyphen
- preserve meaning
- avoid random suffixes unless required by a true duplicate inside the same city

Examples:

```txt
Vitória da Conquista -> vitoria-da-conquista
Luís Eduardo Magalhães -> luis-eduardo-magalhaes
Bom Jesus da Lapa -> bom-jesus-da-lapa
Santa Maria da Vitória -> santa-maria-da-vitoria
São João -> sao-joao
João Paulo II -> joao-paulo-ii
Nova Jerusalém / Campinhos -> nova-jerusalem-campinhos
Jardim das Oliveiras 2ª Fase -> jardim-das-oliveiras-2a-fase
Portal das Águas - Fase I -> portal-das-aguas-fase-i
```

---

# 6. Duplicate prevention

Before inserting neighborhoods:

1. Normalize the city name and state.
2. Find or create the city.
3. Get the correct `city_id`.
4. Normalize the neighborhood name.
5. Generate the neighborhood slug.
6. Upsert the neighborhood using `city_id + normalized_name` or `city_id + slug`.
7. Never upsert by neighborhood name alone.

Required behavior:

- `Centro` repeated twice inside Barreiras should be prevented or merged.
- `Centro` in Barreiras and `Centro` in Vitória da Conquista should both exist as separate records.
- `Jardim Primavera` in one city must not be linked to another city.
- `Boa Vista` in more than one city must exist once per city.
- `Vila Nova` in more than one city must exist once per city.

---

# 7. Existing data migration

If existing property listings store neighborhoods as text, migrate them safely to use `neighborhood_id`.

A safe migration strategy must:

1. Preserve the existing text value before migration.
2. Use each listing's `city_id` to resolve the correct neighborhood.
3. Match using `city_id + normalized_neighborhood_name`.
4. Never match neighborhood by name only.
5. Update the listing with the correct `neighborhood_id`.
6. Keep old text fields temporarily if needed for validation.
7. Log unresolved records for manual review.
8. Avoid destructive changes until all mappings are validated.

Recommended temporary fields if needed:

```sql
alter table properties add column if not exists legacy_neighborhood_name text;
alter table properties add column if not exists neighborhood_id uuid references neighborhoods(id);
```

Then migrate using a city-aware lookup.

---

# 8. Property/listing relationship

Every property/listing must reference the correct neighborhood through `neighborhood_id`.

The relationship should be:

```txt
properties.city_id -> cities.id
properties.neighborhood_id -> neighborhoods.id
neighborhoods.city_id -> cities.id
```

Validation rule:

A property's `neighborhood_id` must belong to the same city as the property's `city_id`.

If possible, enforce this at the application/server layer.

If appropriate, add database validation through triggers or constraints.

Do not allow a property with:

```txt
city_id = Barreiras
neighborhood_id = Centro from Vitória da Conquista
```

---

# 9. Application logic requirements

Update all forms where users select city and neighborhood.

This includes:

- public property submission
- B2C listing creation
- B2B listing creation
- advertiser onboarding
- company onboarding
- dashboard property edit
- admin property edit
- moderation screens
- search filters
- lead forms if location fields exist

Required behavior:

- Neighborhood dropdowns must be filtered by selected city.
- When the city changes, the neighborhood selection must reset or be revalidated.
- On property creation, save the correct `neighborhood_id`.
- On property editing, preserve the existing neighborhood only if it belongs to the selected city.
- If the city changes during editing, require the user to choose a valid neighborhood for the new city.
- On property pages, listing cards, search results, dashboards, and admin pages, display the neighborhood name from the correct related record.
- If users can type custom neighborhoods, validate the value against the selected city before creating or assigning a record.

---

# 10. API and server-side validation

Do not rely only on client-side validation.

Update API routes, server actions, Supabase functions, or backend logic to validate that:

- `city_id` exists
- `neighborhood_id` exists
- `neighborhood_id` belongs to the selected `city_id`
- duplicate neighborhoods are not created inside the same city
- same-name neighborhoods in different cities are allowed

Example validation logic:

```ts
const neighborhood = await getNeighborhoodById(neighborhoodId);

if (!neighborhood || neighborhood.city_id !== cityId) {
  throw new Error("Selected neighborhood does not belong to the selected city.");
}
```

---

# 11. Search, filters, and public pages

Update public search filters so neighborhood options are loaded only after selecting a city, or are grouped by city when necessary.

Required behavior:

- The city filter controls the available neighborhood options.
- Neighborhood filters must use `neighborhood_id` or `city_slug + neighborhood_slug`.
- Search results must not mix same-name neighborhoods from different cities.
- If the user searches for `Centro` inside Barreiras, the result must only return properties from Barreiras' Centro.
- If the user searches for `Centro` inside Vitória da Conquista, the result must only return properties from Vitória da Conquista's Centro.

---

# 12. SEO-friendly URLs

If neighborhood slugs are used in routes or query parameters, resolve them together with the city slug.

Correct examples:

```txt
/barreiras/centro
/vitoria-da-conquista/centro
/guanambi/centro
/brumado/centro
/santa-maria-da-vitoria/centro
```

These must resolve to different neighborhood records.

Incorrect behavior:

```txt
/centro
```

This is ambiguous and should not be used as a standalone neighborhood route.

SEO requirements:

- City and neighborhood URLs must be unique.
- Dynamic titles should include city and neighborhood where applicable.
- Dynamic descriptions should include city and neighborhood where applicable.
- Same-name neighborhoods in different cities must have different canonical URLs.
- Canonical URLs must not collapse different city/neighborhood combinations into one.
- Internal links should use `city_slug + neighborhood_slug`.
- Sitemap generation should include correct city/neighborhood route pairs.
- Structured data should reference the correct city and neighborhood context.

---

# 13. Admin and dashboard requirements

Update admin tools, advertiser dashboards, onboarding forms, and listing creation flows to use the corrected city-neighborhood relationship.

Requirements:

- Admins must be able to manage neighborhoods by city.
- Neighborhood lists in admin screens must be filterable by city.
- Dashboard users must only see neighborhoods available for the selected city.
- B2C and B2B users must only select neighborhoods associated with the selected city.
- If custom neighborhood creation is allowed, it must require a selected city.
- If a custom neighborhood already exists inside the same city, reuse the existing record.
- If a custom neighborhood exists in another city, create a separate record for the selected city.

---

# 14. Migration safety requirements

Create a clear migration plan before changing production data.

Requirements:

- Use idempotent SQL scripts whenever possible.
- Use safe `insert ... on conflict` logic with the correct composite key.
- Preserve existing city records.
- Reuse existing `city_id` if the city already exists.
- Do not create duplicate city entries.
- Do not blindly insert duplicate neighborhoods.
- Do not delete existing neighborhoods unless they are confirmed duplicates inside the same city.
- If duplicates exist, merge them carefully.
- Update all related property records before removing duplicate rows.
- Back up or preserve existing data before destructive changes.
- Log unresolved mappings.
- Make scripts repeatable without creating new duplicates.

---

# 15. Recommended seed/upsert approach

Create a structured seed file similar to this:

```ts
const citiesWithNeighborhoods = [
  {
    city: "Bom Jesus da Lapa",
    state: "BA",
    neighborhoods: [
      "Amaralina",
      "Barrinha",
      "Beira Rio"
    ]
  }
];
```

For each city:

1. Normalize city name.
2. Generate city slug.
3. Find existing city by `state + normalized_name` or `state + slug`.
4. Create city only if it does not exist.
5. Get `city_id`.
6. Normalize each neighborhood name.
7. Generate neighborhood slug.
8. Upsert neighborhood using `city_id + normalized_name` or `city_id + slug`.
9. Preserve the display name exactly as provided.
10. Never upsert neighborhoods by name alone.

---

# 16. Code quality requirements

Keep the code clean, maintainable, and easy to understand.

Do not change:

- visual design
- fonts
- images
- icons
- unrelated UI components
- unrelated business rules
- unrelated page layouts

Remove outdated logic that treats neighborhoods as global text values.

Avoid unnecessary JavaScript and overcomplicated client-side logic.

Prefer:

- database constraints
- typed server actions
- clean API validation
- simple state management
- reusable city/neighborhood utilities
- clear migration scripts
- predictable slug generation
- idempotent upsert scripts

---

# 17. Neighborhood seed data

Use the following city and neighborhood lists to update Supabase.

The lists below should be inserted or updated using a safe upsert process.

Do not translate city or neighborhood names.

Generate slugs from the original names, but preserve the display names exactly as written.

---

## Bom Jesus da Lapa, Bahia

1. Amaralina
2. Barrinha
3. Beira Rio
4. Cavalhadas
5. Centro
6. Guarani
7. João Paulo II
8. Jurema
9. Lagoa Grande
10. Loteamento Mirante da Lapa
11. Loteamento Nova Lapa
12. Loteamento São Conrado
13. Magalhães Neto
14. Maravilha I
15. Maravilha II
16. Maribondo
17. Nova Brasília
18. Nova Jerusalém / Campinhos
19. Parque Verde
20. Residencial B. J. da Lapa
21. Residencial Primavera I
22. Residencial Primavera II
23. Residencial Vale Verde
24. Salinas
25. São Gotardo
26. São João
27. São Miguel
28. Senhora da Soledade
29. Shangri-lá
30. Vila Nova

---

## Vitória da Conquista, Bahia

Use this expanded list with official neighborhoods, loteamentos, conjuntos, and urban references commonly used in addresses.

1. Alegria
2. Alto da Boa Vista
3. Alto Maron
4. Alvorada
5. Ayrton Senna
6. Bateias
7. Bem-Querer
8. Boa Vista
9. Brasil
10. Bruno Bacelar
11. Caminho da UESB
12. Caminho do Parque
13. Campinhos
14. Candeias
15. Centro
16. Cidade Maravilhosa
17. Cidade Modelo
18. Cidade Serrana
19. Conquistinha
20. Conveima I
21. Conveima II
22. Cruzeiro
23. Distrito Industrial
24. Esplanada do Parque
25. Espírito Santo
26. Felícia
27. Flamengo
28. Guarani
29. Henriqueta Prates
30. Ibirapuera
31. Inocoop I
32. Inocoop II
33. Ipanema
34. Iracema
35. Jardim Candeias
36. Jardim Copacabana
37. Jardim Guanabara
38. Jatobá
39. Jurema
40. Kadija
41. Lagoa das Flores
42. Loteamento Bateias II
43. Loteamento Conquistense
44. Loteamento Leblon
45. Loteamento Porto Seguro
46. Loteamento Sol Nascente
47. Miro Cairo
48. Morada da Primavera
49. Morada dos Pássaros I
50. Morada dos Pássaros II
51. Morada dos Pássaros III
52. Morada Nobre do Candeias
53. Morada Nova
54. Morada Real
55. Nossa Senhora Aparecida
56. Nova Cidade
57. Orfanato
58. Panorama
59. Patagônia
60. Primavera
61. Recanto das Águas
62. Recanto dos Pássaros
63. Recreio
64. Renato Magalhães
65. Santa Cecília
66. Santa Cruz
67. Santa Tereza
68. Santa Terezinha
69. São Pedro
70. São Vicente
71. Senhorinha Cairo
72. Simão
73. Sumaré
74. Terras do Remanso
75. UESB
76. Universidade
77. Urbis I
78. Urbis II
79. Urbis III
80. Urbis IV
81. Urbis V
82. Urbis VI
83. Vila América
84. Vila da Conquista
85. Vila Elisa
86. Vila Marina
87. Vilas Serranas
88. Vivendas da Serra
89. Zabelê

---

## Barreiras, Bahia

1. Alphaville
2. Antônio Geraldo
3. Aratu
4. Arboreto I
5. Arboreto II
6. Bandeirantes
7. Barreiras I
8. Barreiras II
9. Barreirinhas
10. Bela Vista
11. Boa Sorte
12. Boa Vista
13. Buritis
14. Cascalheira
15. Centro
16. Cidade Nova
17. Copacabana
18. Firenze
19. Flamengo
20. Jardim Ouro Branco
21. Jardim Vitória
22. Jardins
23. Juri
24. Juscelino Kubitschek
25. Mimoso
26. Morada da Lua
27. Morada Nobre
28. Nova Barreiras
29. Novo Horizonte
30. Parque Santa Lúcia
31. Parque Verde
32. Primavera
33. Recanto dos Pássaros
34. Renato Gonçalves
35. Ribeirão
36. Rio Grande
37. Sandra Regina
38. Santa Luzia
39. Santo Antônio
40. São Francisco
41. São Miguel
42. São Paulo
43. São Pedro
44. São Sebastião
45. Serra do Mimo
46. Sombra da Tarde
47. Vila Amorim
48. Vila Brasil
49. Vila dos Funcionários
50. Vila dos Sais
51. Vila dos Soldados
52. Vila Dulce
53. Vila Nova
54. Vila Regina
55. Vila Rica

---

## Luís Eduardo Magalhães, Bahia

1. 90 Comercial
2. Alto da Lagoa
3. Alto dos Cerrados
4. Aroldo da Cruz
5. Avenida
6. Bahia Farm
7. Bairro Independente
8. Boa Vista
9. Bosque dos Girassóis 01
10. Bosque dos Girassóis 02
11. Bosque Malls
12. Campos Elíseos
13. Central Park
14. Centro
15. Centro Industrial do Cerrado
16. Chácaras Comerciais Leste
17. Chácaras Rio de Pedras
18. Chácaras Santa Cruz I e II
19. Chiodi
20. Cidade Alta
21. Cidade do Automóvel
22. Cidade Santa Cruz
23. Cidade Santa Cruz II
24. Cidade Santa Cruz III
25. Cidade Universitária
26. Cidade Universitária II
27. Conquista
28. Conquista II
29. Dom Laurindo
30. Florais Léa
31. Florais Léa II
32. Florais Léa III
33. Jardim Alvorada
34. Jardim das Acácias
35. Jardim das Acácias II
36. Jardim das Acácias III
37. Jardim das Oliveiras
38. Jardim das Oliveiras 2ª Fase
39. Jardim das Oliveiras 3ª Fase
40. Jardim do Bem
41. Jardim Europa
42. Jardim Imperial
43. Jardim Ipê
44. Jardim Paraíso
45. Jardim Paraíso II
46. Jardim Paraíso III
47. Jardim Primavera
48. Jardim Primavera I
49. Jardim Primavera II
50. Jardim Sol Nascente
51. JK
52. Lea Cordeiro
53. Luar do Oeste
54. Luar dos Cerrados
55. Mimoso do Oeste
56. Mimoso do Oeste 2ª Etapa
57. Nova Brasília I
58. Nova Brasília II
59. Novo Paraíso
60. Novo Paraíso II
61. Novo Paraná
62. Ondumar Marabá
63. Paraíso Leste
64. Parque Oeste
65. Parque São José
66. Portal das Águas - Fase I
67. Recanto dos Pássaros
68. Residencial 90
69. Santa Cruz
70. Setor C Sul Arnaldo H Ferreira
71. Setor Com. Sul Arnaldo H. Ferreira
72. Setor M3
73. Sol do Cerrado
74. Sol Nascente II
75. Solar do Oeste
76. Solar dos Buritis
77. Solar Santa Cruz 1ª Etapa
78. Top Park
79. Tropical Ville
80. Tropical Ville II
81. Universitário
82. Vereda Tropical
83. Vista Alegre
84. Vista Verde

---

## Guanambi, Bahia

1. Aeroporto Velho
2. Alazão
3. Alto Caiçara
4. Alvorada
5. Amambaí
6. Araújo
7. Aroeira
8. Beija-Flor
9. Bela Vista
10. Belo Horizonte
11. Boa Vista
12. Bom Jesus
13. Brasília
14. Brindes
15. Caiçara
16. Candeal
17. Centro
18. Cidade Nova
19. Condomínio Chalés Porto da Pedra
20. Conjunto Habitacional Beneval
21. Conjunto Habitacional Monte Azul
22. Deus Dará
23. Floresta
24. Industrial
25. Ipanema
26. Ipiranga
27. Jardim Aeroporto
28. Jardim Vilson
29. Lagoinha
30. Liberdade
31. Loteamento Anita Cardoso
32. Loteamento Cirqueira
33. Loteamento Cirqueira 2
34. Loteamento Dr. José Humberto Nunes
35. Loteamento Gameleiras
36. Loteamento Germínio Augusto da Silva
37. Loteamento Nossa Senhora das Graças
38. Loteamento Pereira
39. Loteamento Pôr do Sol
40. Loteamento Pôr do Sol 2
41. Loteamento Santa Maria
42. Loteamento Santa Rita
43. Loteamento Vilas Boas
44. Marabá
45. Maria Bastos
46. Maria de Fátima
47. Manoel Cotrim
48. Massaranduba
49. Monte Pascoal
50. Morada Nova
51. Nova Esperança
52. Nova Olinda
53. Novo Horizonte
54. Paraíso
55. Park Boulevard
56. Renascer
57. Renascer 2
58. Santa Catarina
59. Santa Luzia
60. Santo Antônio
61. São Francisco
62. São João
63. São José
64. São Sebastião
65. São Vicente
66. Sandoval Moraes
67. Sol Nascente
68. Sossego
69. Urbis
70. Vila Nova
71. Vista Alegre
72. Vomitamel

---

## Brumado, Bahia

1. Apertado do Morro
2. Bairro Cinco
3. Bairro das Flores
4. Baraúnas
5. Bom Jesus
6. Brisas
7. Centenário
8. Centro
9. Cidade das Esmeraldas
10. Das Flores
11. Doutor Juracy
12. Esconso
13. Feliciano Pereira Santos
14. Ginásio Industrial
15. Jardim Brasil
16. Jardim de Alá
17. Malhada Branca
18. Maria José Viana
19. Maria Nilza Azevedo
20. Meiras
21. Mercado
22. Monsenhor Antônio Fagundes
23. Nobre
24. Norberto Marinho
25. Novo Brumado
26. Olhos d'Água
27. Parque Alvorada
28. Parque dos Juzeiros
29. Santa Tereza
30. São Félix
31. São Joaquim
32. São Jorge
33. São José
34. São Lourenço
35. São Sebastião
36. Tanque do Abaeté
37. Urbis II
38. Urbis IV
39. Vila Presidente Vargas

---

## Santa Maria da Vitória, Bahia

1. AABB
2. Alto do Cruzeiro
3. Bebedouro
4. Centro
5. Dr. Roberto
6. Jardim América
7. Loteamento Alto Paraíso
8. Macambira
9. Malvão
10. Morada da Lua
11. Morada do Sol
12. Parque de Exposição
13. Sambaíba
14. Setor Aeroporto
15. Setor Carranca
16. Vila Formosa
17. Vila Nova

---

# 18. Recommended TypeScript seed structure

Use a structure similar to this:

```ts
export const citiesWithNeighborhoods = [
  {
    city: "Bom Jesus da Lapa",
    state: "BA",
    neighborhoods: [
      "Amaralina",
      "Barrinha",
      "Beira Rio",
      "Cavalhadas",
      "Centro"
    ]
  },
  {
    city: "Vitória da Conquista",
    state: "BA",
    neighborhoods: [
      "Alegria",
      "Alto da Boa Vista",
      "Alto Maron",
      "Alvorada",
      "Ayrton Senna"
    ]
  }
];
```

The final implementation must include all cities and all neighborhoods listed in this file.

---

# 19. Suggested upsert logic

Use logic similar to this:

```ts
for (const cityData of citiesWithNeighborhoods) {
  const normalizedCityName = normalizeName(cityData.city);
  const citySlug = slugify(cityData.city);

  const city = await upsertCity({
    name: cityData.city,
    state: cityData.state,
    normalized_name: normalizedCityName,
    slug: citySlug
  });

  for (const neighborhoodName of cityData.neighborhoods) {
    const normalizedNeighborhoodName = normalizeName(neighborhoodName);
    const neighborhoodSlug = slugify(neighborhoodName);

    await upsertNeighborhood({
      city_id: city.id,
      name: neighborhoodName,
      normalized_name: normalizedNeighborhoodName,
      slug: neighborhoodSlug
    });
  }
}
```

The upsert must use a composite conflict target.

Correct:

```sql
on conflict (city_id, normalized_name)
```

or:

```sql
on conflict (city_id, slug)
```

Incorrect:

```sql
on conflict (name)
```

---

# 20. Validation checklist

After implementing the update, verify all of the following:

## Database validation

- Same neighborhood names can exist in different cities without conflict.
- Duplicate neighborhood names cannot exist inside the same city.
- `Centro` exists separately for each applicable city.
- `Boa Vista` exists separately for each applicable city.
- `Vila Nova` exists separately for each applicable city.
- `São João` exists separately where applicable.
- `Bom Jesus` as a neighborhood does not conflict with the city `Bom Jesus da Lapa`.
- Supabase foreign keys are working correctly.
- Composite uniqueness constraints are working correctly.
- No global unique constraint exists on neighborhood name alone.

## Data validation

- All listed cities exist once.
- All listed neighborhoods exist once per city.
- No duplicate neighborhoods were created inside the same city.
- Existing listings were not broken.
- Existing property city values were preserved.
- Existing property neighborhood values were correctly mapped where possible.
- Unresolved mappings were logged for review.

## Form validation

- Property creation saves the correct neighborhood for the selected city.
- Property editing preserves or updates the correct neighborhood.
- Changing city resets or revalidates the neighborhood field.
- Users cannot submit a neighborhood that belongs to another city.
- B2C flows work correctly.
- B2B flows work correctly.
- Admin flows work correctly.
- Onboarding flows work correctly.

## Public search validation

- Public filters return correct results by city and neighborhood.
- Search does not mix same-name neighborhoods from different cities.
- Neighborhood dropdowns are filtered by selected city.
- Listing cards show the correct neighborhood.
- Property detail pages show the correct neighborhood.
- Company pages show correct property locations.
- Dashboards show correct property locations.

## SEO validation

- SEO-friendly city/neighborhood URLs work correctly.
- `/barreiras/centro` resolves to Barreiras' Centro.
- `/vitoria-da-conquista/centro` resolves to Vitória da Conquista's Centro.
- `/guanambi/centro` resolves to Guanambi's Centro.
- `/brumado/centro` resolves to Brumado's Centro.
- Canonical URLs are city-specific.
- Sitemap generation includes correct city/neighborhood combinations.
- Dynamic titles and descriptions include the correct city and neighborhood where applicable.

---

# 21. Expected output

After completing the implementation, provide a short technical summary explaining:

- what was changed
- which tables were updated
- which migration files were created
- which seed/upsert scripts were created
- how duplicates are prevented
- how same-name neighborhoods in different cities are handled
- how existing listings were migrated
- what forms were updated
- what filters were updated
- what routes were updated
- what tests or validations were performed
- whether any unresolved data needs manual review

Also provide:

- updated Supabase schema or migration files
- updated seed/upsert scripts for cities and neighborhoods
- updated application logic for city/neighborhood selection
- updated property creation and editing flows
- updated search and filtering logic
- updated SEO route resolution when applicable

---

# Final reminder

Do not treat neighborhood names as globally unique.

Always resolve neighborhoods using:

```txt
city_id + neighborhood_name
```

or:

```txt
city_slug + neighborhood_slug
```

The same neighborhood name in different cities must remain separate and correctly assigned to the city of the property.

Do not change unrelated design, fonts, images, icons, or page layouts.
