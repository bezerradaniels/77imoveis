# Landing pages do subdomínio

Este diretório corresponde à raiz de `https://lps.77imoveis.com.br/`.

## Desenvolvimento

Esta aplicação usa **Tailwind CSS v4 via CLI**, separado das dependências do
portal Next.js.

Na raiz do repositório:

```bash
npm install --prefix lps
npm run dev:lps
```

O modo de desenvolvimento observa os arquivos HTML e recompila
`lps/assets/styles.css` automaticamente. Para gerar a versão minificada:

```bash
npm run build:lps
```

O CSS-fonte fica em `lps/src/input.css`. A saída gerada em
`lps/assets/styles.css` deve permanecer versionada porque é o arquivo servido
pela Hostinger.

## Publicação

Depois do build, envie `.htaccess`, `assets/` e as pastas das campanhas para
`/public_html/lps/`, preservando a estrutura:

```text
/public_html/lps/
  .htaccess
  assets/
    styles.css
  captacao-profissionais/
    index.html
```

A landing de captação fica em:

`https://lps.77imoveis.com.br/captacao-profissionais/`

Cada nova campanha deve ocupar uma pasta irmã com seu próprio `index.html`.
