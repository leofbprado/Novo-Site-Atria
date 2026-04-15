# CLAUDE.md — Novo Site Átria

## Projeto
Site institucional + estoque da Átria Veículos (revenda multimarcas, Campinas/SP).

## Stack
- **Frontend**: React + Vite + TypeScript + Tailwind (`client/`, root do Vite)
- **Backend**: Firebase Firestore + Firebase Auth + Cloud Functions (`functions/`)
- **Hosting**: Firebase Hosting (config em `firebase.json`, publish `dist/public`)
- **Runtime**: Node 20
- **Deploy**: `git push origin main` → GitHub Action `.github/workflows/firebase-hosting.yml` → Firebase Hosting (live)

## Domínios (crítico — não assumir)
- `www.atriaveiculos.com` → Firebase Hosting (produção ativa, recebe deploys)
- `atriaveiculos.com` (apex) → redirect 301 → `www.atriaveiculos.com` via Cloudflare Redirect Rules
- `novo-site-atria.web.app` / `novo-site-atria.firebaseapp.com` → URLs diretas do Firebase (bypass Cloudflare)
- Cloudflare é só DNS + proxy/CDN + redirect apex. **Não é Cloudflare Pages.**

## Regras de Ciclo

### Antes de começar qualquer tarefa
1. Ler MEMORY.md para carregar contexto
2. Verificar estado atual do projeto em `memory/projects/site-atria.md`
3. Entender qual fase está ativa antes de propor mudanças

### Durante o trabalho
1. Manter código limpo — sem console.log em produção
2. Testar localmente antes de commitar (`npx serve dist/public`)
3. Commits atômicos com mensagens em português
4. Não alterar arquivos de config (firebase, cloudflare) sem confirmação do Leo

### Depois de completar tarefa
1. Atualizar `memory/projects/site-atria.md` com novo estado
2. Registrar decisões importantes em `memory/context/decisions.md`
3. Registrar feedback do usuário em `memory/feedback/`
4. Se sessão longa, criar resumo em `memory/sessions/`

### Prioridades de negócio
1. **Consignação** — todo CTA e fluxo prioriza captação de consignação
2. **Performance** — Core Web Vitals verdes (LCP < 2.5s, CLS < 0.1)
3. **Mobile first** — 80%+ do tráfego é mobile
4. **SEO local** — Campinas/SP, termos automotivos regionais

### Convenções de código
- Componentes React em `client/src/` com Tailwind (shadcn/ui disponível)
- Estado Firestore via helpers em `client/src/lib/` (não chamar `getDoc`/`updateDoc` direto nas páginas)
- Imagens: WebP com fallback, lazy loading
- Fontes: subset otimizado, preload critical
- Cache headers: regras em `firebase.json`, catch-all `**` no-cache pro HTML, immutable pros assets hasheados

### Armadilhas conhecidas
- `public/sw.js` na raiz do repo NÃO é deployado (publicDir do Vite é `client/public/`). Qualquer edição nele é morta
- Firebase `headers` aplicam baseado na URL original do request, não no arquivo servido após rewrite. Rotas SPA (/admin, /estoque, etc.) precisam de regra catch-all `**`, não só `/index.html`
