# Guia: conectar GitHub → Next.js → Hostinger (passo a passo)

Objetivo: toda vez que você (ou eu) atualizar o código no GitHub, ele monta o site sozinho e envia pronto para a Hostinger. Você não precisa subir arquivo na mão.

> Tempo estimado: ~30 minutos, só na primeira vez.

---

## Visão geral (como funciona)

```
Você edita o código  →  envia para o GitHub  →  o "robô" (GitHub Actions)
monta o site  →  envia automático por FTP para a Hostinger  →  site no ar
```

---

## Parte 1 — Criar o repositório no GitHub

1. Crie uma conta em github.com (se ainda não tiver).
2. Clique em **New repository** → nome `77imoveis` → deixe **Private** → **Create**.
3. No seu computador, dentro da pasta `scaffold/`, rode no terminal:

```bash
git init
git add .
git commit -m "Primeira versão do 77Imóveis"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/77imoveis.git
git push -u origin main
```

> Importante: o arquivo `.gitignore` já garante que a senha (`.env.local`) NÃO vai para o GitHub.

---

## Parte 2 — Pegar os dados de FTP na Hostinger

1. Entre no **hPanel** da Hostinger.
2. Vá em **Arquivos → Contas FTP**.
3. Anote (ou crie uma conta FTP):
   - **Host/Servidor FTP** (ex.: `ftp.seudominio.com.br` ou um IP)
   - **Usuário FTP**
   - **Senha FTP**
4. Confirme que a pasta do site é **`/public_html/`** (padrão da Hostinger).

---

## Parte 3 — Guardar os segredos no GitHub

No GitHub, abra o repositório → **Settings → Secrets and variables → Actions → New repository secret**. Crie um por um:

| Nome do Secret | O que colocar |
|---|---|
| `HOSTINGER_FTP_HOST` | o host FTP da Hostinger |
| `HOSTINGER_FTP_USER` | o usuário FTP |
| `HOSTINGER_FTP_PASS` | a senha FTP |
| `NEXT_PUBLIC_SUPABASE_URL` | a URL do seu projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave pública (anon) do Supabase |
| `NEXT_PUBLIC_SITE_URL` | `https://seudominio.com.br` |
| `NEXT_PUBLIC_MAPTILER_KEY` | sua chave do MapTiler (mapas) |

> Esses valores ficam guardados em segredo no GitHub e nunca aparecem no site.

---

## Parte 4 — Ligar o deploy automático

Os arquivos já estão prontos no projeto:
- `.github/workflows/deploy.yml` → o "robô" de build + envio.
- `next.config.js` → já configurado para gerar site estático (`output: export`).
- `public/.htaccess` → configura HTTPS, velocidade e URLs amigáveis na Hostinger.

A partir de agora, **todo `git push` na branch `main`** dispara o deploy automaticamente.
Você também pode rodar manualmente em: GitHub → aba **Actions** → **Build e Deploy na Hostinger** → **Run workflow**.

---

## Parte 5 — Conferir

1. Após o `push`, vá na aba **Actions** do GitHub e veja o processo rodando (fica verde quando termina).
2. Abra `https://seudominio.com.br` — o site deve estar no ar.
3. Se aparecer "site em construção", deu tudo certo: é a home provisória.

---

## Dúvidas comuns

**O domínio ainda não está na Hostinger.** Aponte o domínio para a Hostinger no hPanel (ou configure o Cloudflare como recomendado em `07_deploy_hostinger.md`).

**Quero domínio com mais segurança/velocidade.** Coloque o **Cloudflare** na frente (gratuito): ele dá CDN, cache e proteção. Passo a passo no `07_deploy_hostinger.md`.

**Deu erro vermelho no Actions.** Abra o log na aba Actions: quase sempre é um Secret com nome errado ou senha de FTP incorreta. Corrija o Secret e rode de novo.

**Preciso de servidor Node na Hostinger?** Não. Como o site é estático, basta a hospedagem comum (a mais barata). O Node roda só no GitHub, na hora de montar o site.

---

## O que falta antes do primeiro deploy "de verdade"

Este scaffold sobe uma home provisória. Para o site funcional (busca, anúncios, cadastro), seguimos o roadmap em `08_roadmap_fluxos.md` (M0 → M1). Me avise que eu começo o M0.
