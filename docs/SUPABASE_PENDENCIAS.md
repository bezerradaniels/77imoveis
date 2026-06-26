# Pendências no Supabase

Este documento lista o que ainda precisa ser feito no Supabase para o fluxo de cadastro de imóveis funcionar corretamente após as últimas mudanças de usabilidade.

## Status em 26/06/2026

Aplicado no projeto Supabase `ayojizahxmasnjtvyxaf` via MCP:

- Migration `08_usability_flow_fixes.sql` aplicada com sucesso.
- `profiles.role_intent` confirmado como `text`.
- `handle_new_user()` confirmado salvando `phone` e `whatsapp`.
- Backfill de `properties.company_id` confirmado sem linhas pendentes.
- Enum `lead_channel` confirmado com `formulario`, `whatsapp`, `telefone` e `ligacao`.
- Bucket Storage `imoveis` confirmado existente e público.
- Policies/RLS relacionadas foram listadas e existem para as tabelas verificadas.

Pendente apenas o teste manual de fluxo descrito na seção 8.

## 1. Aplicar migration pendente

Aplicar no SQL Editor do Supabase o arquivo:

```text
database/08_usability_flow_fixes.sql
```

Essa migration faz três ajustes necessários:

- Adiciona `profiles.role_intent`, usado para guardar se o usuário escolheu anunciar como `particular` ou `profissional`.
- Atualiza o trigger `handle_new_user()` para salvar `phone` e `whatsapp` no profile ao criar conta, inclusive quando há confirmação de e-mail.
- Faz backfill de `properties.company_id` para imóveis existentes de usuários que já têm empresa ativa.

Sem essa migration, o app pode falhar ao salvar a escolha de perfil ou não associar corretamente imóveis profissionais à empresa.

## 2. Verificar se a coluna `role_intent` existe

Depois de aplicar a migration, rodar:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name = 'role_intent';
```

Resultado esperado:

```text
role_intent | text
```

## 3. Verificar trigger de criação de profile

Confirmar se `handle_new_user()` inclui `phone` e `whatsapp`:

```sql
select pg_get_functiondef('public.handle_new_user()'::regprocedure);
```

O corpo esperado deve inserir:

```sql
phone,
whatsapp
```

e usar:

```sql
new.raw_user_meta_data->>'phone'
coalesce(new.raw_user_meta_data->>'whatsapp', new.raw_user_meta_data->>'phone')
```

## 4. Verificar backfill de imóveis profissionais

Rodar esta consulta para encontrar imóveis de usuários com empresa ativa que ainda estão sem `company_id`:

```sql
select p.id, p.title, p.owner_id
from properties p
where p.company_id is null
  and exists (
    select 1
    from companies c
    where c.owner_id = p.owner_id
      and c.status = 'ativo'
  );
```

Resultado esperado:

```text
0 linhas
```

Se retornar linhas, reaplicar o bloco de backfill do arquivo `08_usability_flow_fixes.sql`.

## 5. Confirmar enum de canais de lead

O app agora registra cliques de WhatsApp e telefone como leads leves. O enum `lead_channel` precisa aceitar:

```text
formulario
whatsapp
telefone
ligacao
```

Verificar com:

```sql
select enumlabel
from pg_enum
where enumtypid = 'lead_channel'::regtype
order by enumsortorder;
```

Esses valores já existem no `database/01_schema.sql`; a checagem é apenas para confirmar o banco real.

## 6. Confirmar Storage bucket

O cadastro de imóveis faz upload no bucket:

```text
imoveis
```

No Supabase Storage, confirmar:

- Bucket `imoveis` existe.
- O bucket é público, ou as URLs públicas usadas pelo app conseguem carregar imagens.
- Policies permitem upload para usuários autenticados.

Se o bucket não existir, o formulário mostrará:

```text
Crie o bucket público "imoveis" no Supabase Storage para enviar fotos.
```

## 7. Verificar policies/RLS relacionadas

As policies atuais precisam permitir:

- Usuário autenticado inserir e atualizar seus próprios imóveis em `properties`.
- Usuário autenticado inserir imagens em `property_images` quando é dono do imóvel.
- Usuário autenticado inserir características em `property_features` quando é dono do imóvel.
- Usuário autenticado inserir modalidades em `property_negotiations` quando é dono do imóvel.
- Leads públicos via formulário/WhatsApp/telefone em `leads`.

Arquivos de referência:

```text
database/02_rls.sql
database/06_merge_negociacoes.sql
```

## 8. Teste manual recomendado após aplicar

1. Criar uma conta nova.
2. Escolher `Particular`.
3. Criar um imóvel como rascunho.
4. Publicar o primeiro imóvel.
5. Tentar publicar um segundo imóvel ativo e confirmar se aparece a mensagem de limite.
6. Criar perfil profissional em `/painel/empresa`.
7. Criar novo imóvel e confirmar que `properties.company_id` foi preenchido.
8. Abrir `/empresa/{slug}` e confirmar que o imóvel aparece na página da empresa.
9. Abrir o imóvel público e testar formulário, WhatsApp e telefone.
10. Confirmar que os contatos aparecem em `/painel/contatos`.

## 9. Histórico

Em sessão anterior não havia ferramenta MCP do Supabase disponível.

Também não havia credenciais administrativas locais no `.env.local`; foram encontradas apenas:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

Essas chaves públicas não são suficientes para aplicar migrations com segurança. Depois disso, o MCP do Supabase foi configurado e autenticado para o projeto `ayojizahxmasnjtvyxaf`, permitindo aplicar e verificar as pendências acima.
