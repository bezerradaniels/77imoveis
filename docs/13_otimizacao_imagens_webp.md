# Otimizacao de imagens WebP

## Fluxos auditados

- Imoveis: `components/painel/PropertyForm.tsx` envia fotos para `property_images.url`.
- Perfil: `components/painel/ProfileForm.tsx` envia avatar para `profiles.avatar_url`.
- Empresa: `components/painel/company/useCompanyForm.ts` envia logo/capa para `companies.logo_url` e `companies.cover_url`.
- Corretores: `components/admin/BrokerAdmin.tsx` envia foto para `brokers.photo_url`.
- Vitrine: `components/painel/StorefrontForm.tsx` envia logo/capa para `storefronts.logo_url` e `storefronts.cover_url`.
- Banners: `components/admin/BannerAdmin.tsx` envia imagem para `banners.image_url`.
- Acervo existente: scripts cobrem tambem `blog_posts.cover_url`.

## Como funciona

Todo upload novo passa por `app/actions/images.ts`, que chama os utilitarios em `lib/images/`.
O arquivo original e validado no servidor, decodificado com `sharp`, redimensionado sem upscale, convertido para WebP e enviado ao bucket `imoveis` com `contentType: image/webp` e cache longo.

Configuracoes principais:

- `IMAGE_WEBP_QUALITY`: qualidade global opcional.
- `IMAGE_UPLOAD_MAX_BYTES`: limite opcional de upload antes da compressao.
- `NEXT_PUBLIC_IMAGE_BUCKET`: bucket opcional; padrao `imoveis`.

## Migracao do acervo

Aplicar primeiro a migration:

```bash
database/21_image_migration_backup.sql
```

Rodar simulacao:

```bash
npm run migrate:images:webp -- --dry-run
```

Executar:

```bash
npm run migrate:images:webp -- --execute
```

Rollback das referencias:

```bash
npm run rollback:images:webp -- --dry-run
npm run rollback:images:webp -- --execute
```

Limpeza dos originais antigos, somente apos verificacao manual:

```bash
npm run cleanup:old-images
npm run cleanup:old-images -- --execute
```

Os scripts nao apagam originais durante a migracao. A tabela `image_migration_backup` guarda `table_name`, `record_id`, `column_name`, `old_value` e `new_value`.

## Checklist manual

- Enviar JPG, PNG, WebP e AVIF em anuncio de imovel.
- Rejeitar arquivo invalido e imagem acima do limite.
- Confirmar URL final terminando em `.webp`.
- Confirmar `contentType` `image/webp` no Supabase Storage.
- Trocar avatar, logo/capa de empresa, logo/capa da vitrine, banner e foto de corretor.
- Editar um imovel mantendo fotos existentes e removendo uma foto antiga.
- Rodar dry-run da migracao e conferir totais, ja WebP, invalidos e estimativa de reducao.
- Validar no mobile que cards/listagens continuam renderizando sem imagem quebrada.
