# ARCHITECTURE.md — Atria Veiculos

> FONTE DE VERDADE DO PROJETO. Leia este arquivo antes de qualquer acao.
> Ultima atualizacao: 2026-03-04

---

## 1. IDENTIDADE

- **Dominio:** https://atriaveiculos.com.br
- **Produto:** Site principal de revenda de veiculos usados
- **Deploy alvo:** Vercel (frontend) + Node/Express (backend)
- **Stack DEFINITIVA:** React 18 + TypeScript + Vite + Express + Tailwind CSS v3 + Radix UI + Drizzle ORM + NeonDB (PostgreSQL)

---

## 2. ESTADO ATUAL DO REPOSITORIO

O repo possui DUAS aplicacoes conflitantes:

### App LEGADA — `src/` (NAO MEXA)
- React JSX + react-router-dom + Bootstrap + Firebase/Firestore
- Tem TODA a logica de negocio implementada (usar como referencia)
- 10 versoes de homepage (de template comprado)
- Roteamento completo, lazy loading, Photoswipe
- STATUS: SOMENTE LEITURA — apenas consultar logica

### App NOVA — `client/` + `server/` + `shared/` (ZONA DE TRABALHO)
- React TSX + Vite + Express + Tailwind + Radix UI + Drizzle
- Veio de template Replit — esta VAZIA (so boilerplate)
- client/src/App.tsx: rota Home comentada, so tem 404
- client/src/pages/: so not-found.tsx
- server/routes.ts: zero rotas implementadas
- shared/schema.ts: so tabela users generica
- STATUS: AQUI QUE VAMOS CONSTRUIR TUDO

### Raiz (LIMPAR)
- +100 arquivos lixo: scripts .js de analise, reports .md, JSONs de debug
- Configs duplicadas (.replit, .replit.bak, .replitignore)
- Mover para docs/legacy-* antes de deletar qualquer coisa

---

## 3. DECISOES TECNICAS DEFINITIVAS

| Topico | Decisao | Motivo |
|---|---|---|
| CSS | Tailwind CSS v3 + Radix UI | Stack nova ja configurada |
| Banco | NeonDB via Drizzle ORM | Eliminar Firebase gradualmente |
| Roteamento | Wouter | Ja instalado, leve |
| Imagens | Cloudinary | Ja configurado no .env |
| Bootstrap | REMOVER de codigo novo | Conflita com Tailwind |
| Firebase | Manter por ora (auth legada) | Nao e prioridade agora |
| Componentes | Migrar logica, reescrever UI | Aproveitar logica, jogar fora estilo |

---

## 4. VARIAVEIS DE AMBIENTE

```
VITE_BASE_URL=https://atriaveiculos.com.br
GTM_CONTAINER_ID=GTM-XXXXXXX
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
META_PIXEL_ID=1234567890123456
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FIREBASE_TOKEN=...
DATABASE_URL=... (NeonDB connection string)
NODE_ENV=production
```

---

## 5. ESTRUTURA DE PASTAS ALVO

```
/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ui/          (Radix UI base — ja existe)
│       │   ├── layout/      (Header, Footer, Layout)
│       │   ├── vehicle/     (VehicleCard, VehicleGallery, VehicleFilters)
│       │   ├── home/        (HeroSection, FeaturedVehicles, CTASection)
│       │   ├── financing/   (FinancingForm, LoanCalculator, Credere)
│       │   ├── blog/        (BlogCard, BlogList)
│       │   ├── admin/       (AdminDashboard, VehicleForm)
│       │   ├── seo/         (MetaTags, WebSiteSchema)
│       │   └── common/      (BackToTop, ScrollToTop, ErrorBoundary)
│       ├── pages/
│       │   ├── home.tsx
│       │   ├── estoque.tsx
│       │   ├── veiculo.tsx
│       │   ├── financiamento.tsx
│       │   ├── sobre.tsx
│       │   ├── blog.tsx
│       │   ├── blog-post.tsx
│       │   ├── vender.tsx
│       │   ├── admin.tsx
│       │   └── not-found.tsx
│       ├── hooks/           (useVehicles, useFilters, useFavorites)
│       ├── lib/             (queryClient, utils, cloudinary)
│       └── App.tsx
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/
│   └── schema.ts            (vehicles, leads, blog_posts, users)
├── src/                     (LEGADO — somente leitura)
├── docs/
│   ├── legacy-reports/      (todos os .md antigos)
│   ├── legacy-data/         (JSONs de debug)
│   └── legacy-html/         (HTMLs soltos)
└── scripts/
    └── legacy/              (scripts de analise antigos)
```

---

## 6. ROTAS DEFINITIVAS

| Rota | Pagina |
|---|---|
| / | Homepage |
| /estoque | Listagem de veiculos com filtros |
| /estoque/:id | Pagina individual do veiculo |
| /carros/:marca/:modelo/:slug | Rota SEO do veiculo |
| /financiamento | Pagina de financiamento (Credere) |
| /simulador | Calculadora de parcelas |
| /blog | Listagem do blog |
| /blog/:slug | Post individual |
| /sobre | Sobre a Atria Veiculos |
| /vender | Quero vender meu carro |
| /favoritos | Veiculos favoritados |
| /admin | Painel admin (protegido) |
| /admin/estoque | CRUD de veiculos |
| /_health | Health check |
| /* | 404 |

---

## 7. SCHEMA DO BANCO (Drizzle + NeonDB)

### vehicles
campos: id, shortId, slug, marca, modelo, versao, ano, km, preco, cor,
combustivel, cambio, carroceria, portas, motorCC, potencia,
fotos (array URLs Cloudinary), fotoPrincipal, descricao, opcionais (array),
status (disponivel / vendido / reservado), destaque (boolean),
createdAt, updatedAt

### leads
campos: id, nome, email, telefone,
tipo (financiamento / contato / venda),
veiculoId (FK opcional), mensagem,
status (novo / contatado / fechado), createdAt

### blog_posts
campos: id, slug, titulo, conteudo, resumo,
autor, categorias (array), tags (array),
imagemCapa, publicado (boolean), createdAt, updatedAt

### users
campos: id, username, passwordHash, role (admin / editor), createdAt

---

## 8. INTEGRACOES

- **Cloudinary** — hospedagem e otimizacao de fotos dos veiculos
- **Credere** — plugin de financiamento (ver src/pages/others/ para referencia)
- **Google Tag Manager** — analytics container
- **Google Analytics 4** — tracking de comportamento
- **Meta Pixel** — rastreamento Facebook/Instagram
- **WhatsApp** — CTAs de contato direto
- **OpenAI** — api/openai.js (funcionalidade a definir)

---

## 9. COMPONENTES LEGADOS COM LOGICA APROVEITAVEL

- `src/components/carListings/` — filtros, grid de veiculos, paginacao
- `src/components/carSingles/` — galeria, specs, CTA contato
- `src/components/financiamento/` — formulario Credere
- `src/components/financing/` — calculadora de parcelas
- `src/components/hero/` — secao hero com busca
- `src/components/seo/` — schemas estruturados, breadcrumbs
- `src/components/common/` — BackToTop, ScrollToTop, ErrorBoundary
- `src/contexts/FilterContext.jsx` — logica de filtros de estoque
- `src/context/AuthContext.jsx` — autenticacao
- `src/hooks/` — useVehicles, useAuth, etc

---

## 10. REGRAS OBRIGATORIAS PARA O AGENTE

1. SEMPRE leia ARCHITECTURE.md e ROADMAP.md antes de comecar qualquer fase
2. Trabalhe APENAS dentro de `client/` `server/` `shared/`
3. `src/` e somente leitura — apenas consulta de logica e comportamento
4. Nao delete nada sem mover antes para `docs/legacy-*`
5. TypeScript (.tsx/.ts) + Tailwind + Radix UI em TUDO que for criado
6. ZERO Bootstrap em qualquer arquivo novo
7. Atualize ROADMAP.md ao concluir cada fase (marque como concluido)
8. Design ULTRA MODERNO: mobile-first, dark mode compativel, UI premium
9. Confirme antes de qualquer operacao destrutiva ou irreversivel
10. Em caso de duvida sobre comportamento esperado, pergunte antes de agir
