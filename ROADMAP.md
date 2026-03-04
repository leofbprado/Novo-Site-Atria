# ROADMAP.md — Reforma Site Atria Veiculos

> Checklist de execucao da reforma completa.
> SEMPRE consulte ARCHITECTURE.md para contexto antes de comecar qualquer fase.
> Ultima atualizacao: 2026-03-04

---

## LEGENDA
- [ ] Pendente
- [x] Concluido
- [~] Em progresso

---

## FASE 0 — PREPARACAO (pre-requisito para tudo)

- [ ] 0.1 Criar ARCHITECTURE.md com fonte de verdade do projeto
- [ ] 0.2 Criar ROADMAP.md com checklist completo
- [ ] 0.3 Fazer git pull no Codespace para puxar os arquivos criados no GitHub
- [ ] 0.4 Limpar raiz: mover .md reports para docs/legacy-reports/
- [ ] 0.5 Limpar raiz: mover scripts .js de analise para scripts/legacy/
- [ ] 0.6 Limpar raiz: mover JSONs de debug para docs/legacy-data/
- [ ] 0.7 Limpar raiz: mover HTMLs soltos para docs/legacy-html/
- [ ] 0.8 Deletar artefatos Replit: .replit, .replit.bak, .replitignore, 15.7.0
- [ ] 0.9 Verificar que o build ainda funciona apos limpeza

---

## FASE 1 — SCHEMA DO BANCO

- [ ] 1.1 Reescrever shared/schema.ts com tabelas completas:
       vehicles, leads, blog_posts, users
- [ ] 1.2 Rodar drizzle-kit push para criar tabelas no NeonDB
- [ ] 1.3 Implementar storage.ts com funcoes CRUD para vehicles
- [ ] 1.4 Implementar storage.ts com funcoes CRUD para leads
- [ ] 1.5 Implementar storage.ts com funcoes CRUD para blog_posts
- [ ] 1.6 Testar conexao com NeonDB via endpoint /_health

---

## FASE 2 — API BACKEND (server/routes.ts)

- [ ] 2.1 GET  /api/vehicles              - listar veiculos (com filtros/paginacao)
- [ ] 2.2 GET  /api/vehicles/:id          - buscar veiculo por id ou slug
- [ ] 2.3 POST /api/vehicles              - criar veiculo (admin)
- [ ] 2.4 PUT  /api/vehicles/:id          - editar veiculo (admin)
- [ ] 2.5 DELETE /api/vehicles/:id        - deletar veiculo (admin)
- [ ] 2.6 GET  /api/vehicles/featured     - veiculos em destaque
- [ ] 2.7 POST /api/leads                 - criar lead (contato/financiamento)
- [ ] 2.8 GET  /api/leads                 - listar leads (admin)
- [ ] 2.9 GET  /api/blog                  - listar posts publicados
- [ ] 2.10 GET /api/blog/:slug            - buscar post por slug
- [ ] 2.11 Middleware de auth para rotas admin

---

## FASE 3 — LAYOUT BASE (client/src/components/layout/)

- [ ] 3.1 Header.tsx - logo Atria, menu nav, menu mobile, CTA WhatsApp
- [ ] 3.2 Footer.tsx - links, redes sociais, enderecos das lojas, CNPJ
- [ ] 3.3 Layout.tsx - wrapper com Header + Footer + children
- [ ] 3.4 MobileMenu.tsx - drawer/sheet para mobile
- [ ] 3.5 WhatsAppButton.tsx - botao flutuante WhatsApp
- [ ] 3.6 BackToTop.tsx - scroll to top button

---

## FASE 4 — HOMEPAGE (client/src/pages/home.tsx)

- [ ] 4.1 HeroSection - busca por marca/modelo, imagem impactante, CTA principal
- [ ] 4.2 FeaturedVehicles - grid 3-4 veiculos em destaque com VehicleCard
- [ ] 4.3 BrandsSection - logos das marcas disponiveis no estoque
- [ ] 4.4 CTAFinanciamento - bloco de call-to-action para financiamento
- [ ] 4.5 WhyAtria - diferenciais da concessionaria (trust building)
- [ ] 4.6 CTAVender - bloco para quem quer vender o carro
- [ ] 4.7 BlogPreview - 3 posts recentes do blog
- [ ] 4.8 Registrar rota / no App.tsx

---

## FASE 5 — ESTOQUE (listagem + filtros)

- [ ] 5.1 VehicleCard.tsx - card do veiculo (foto, marca, modelo, ano, km, preco)
- [ ] 5.2 VehicleFilters.tsx - filtros: marca, modelo, preco, ano, km, cambio
- [ ] 5.3 VehicleGrid.tsx - grid responsivo de cards
- [ ] 5.4 Pagination.tsx - paginacao
- [ ] 5.5 estoque.tsx - pagina completa com filtros + grid + paginacao
- [ ] 5.6 Conectar com API GET /api/vehicles
- [ ] 5.7 Registrar rota /estoque no App.tsx

---

## FASE 6 — PAGINA DO VEICULO

- [ ] 6.1 VehicleGallery.tsx - galeria de fotos com lightbox
- [ ] 6.2 VehicleSpecs.tsx - tabela de especificacoes tecnicas
- [ ] 6.3 VehicleContactForm.tsx - formulario de interesse / WhatsApp CTA
- [ ] 6.4 SimilarVehicles.tsx - veiculos similares
- [ ] 6.5 veiculo.tsx - pagina completa
- [ ] 6.6 SEO: meta tags dinamicas por veiculo, JSON-LD schema
- [ ] 6.7 Registrar rotas /estoque/:id e /carros/:marca/:modelo/:slug

---

## FASE 7 — FINANCIAMENTO

- [ ] 7.1 LoanCalculator.tsx - simulador de parcelas (juros, entrada, prazo)
- [ ] 7.2 FinancingForm.tsx - formulario de solicitacao Credere
- [ ] 7.3 financiamento.tsx - pagina completa
- [ ] 7.4 Integrar plugin Credere (ver src/pages/others/ como referencia)
- [ ] 7.5 Registrar rotas /financiamento e /simulador

---

## FASE 8 — PAGINAS SECUNDARIAS

- [ ] 8.1 sobre.tsx - historia da Atria, equipe, localizacoes
- [ ] 8.2 vender.tsx - formulario para quem quer vender
- [ ] 8.3 blog.tsx - listagem de posts
- [ ] 8.4 blog-post.tsx - post individual com SEO
- [ ] 8.5 Registrar todas as rotas no App.tsx

---

## FASE 9 — ADMIN

- [ ] 9.1 Login admin com autenticacao
- [ ] 9.2 Dashboard com metricas: veiculos, leads, visitas
- [ ] 9.3 CRUD de veiculos com upload de fotos para Cloudinary
- [ ] 9.4 Visualizacao e gestao de leads
- [ ] 9.5 Protecao de rotas /admin com middleware

---

## FASE 10 — SEO E ANALYTICS

- [ ] 10.1 MetaTags.tsx - componente dinamico de meta tags
- [ ] 10.2 WebSiteSchema.tsx - JSON-LD schema da Atria
- [ ] 10.3 VehicleSchema.tsx - JSON-LD schema por veiculo
- [ ] 10.4 Sitemap.xml dinamico
- [ ] 10.5 robots.txt
- [ ] 10.6 Integrar Google Tag Manager
- [ ] 10.7 Integrar Meta Pixel
- [ ] 10.8 Open Graph para compartilhamento social

---

## FASE 11 — DEPLOY

- [ ] 11.1 Configurar vercel.json para deploy full-stack
- [ ] 11.2 Configurar variaveis de ambiente no Vercel
- [ ] 11.3 Deploy de preview para validacao
- [ ] 11.4 Testes de performance (Lighthouse)
- [ ] 11.5 Deploy em producao em atriaveiculos.com.br
- [ ] 11.6 Configurar dominio e SSL no Vercel

---

## PROGRESSO ATUAL

| Fase | Status | Notas |
|---|---|---|
| 0 - Preparacao | Em progresso | ARCHITECTURE.md e ROADMAP.md criados |
| 1 - Schema | Pendente | |
| 2 - API Backend | Pendente | |
| 3 - Layout Base | Pendente | |
| 4 - Homepage | Pendente | |
| 5 - Estoque | Pendente | |
| 6 - Veiculo | Pendente | |
| 7 - Financiamento | Pendente | |
| 8 - Pag. Secundarias | Pendente | |
| 9 - Admin | Pendente | |
| 10 - SEO | Pendente | |
| 11 - Deploy | Pendente | |

---

## NOTAS DE SESSAO

### 2026-03-04
- Diagnostico completo realizado
- Identificadas duas apps conflitantes (src/ legada e client/ nova)
- Stack definitiva escolhida: React TSX + Tailwind + Drizzle + NeonDB
- ARCHITECTURE.md e ROADMAP.md criados como fonte de verdade
- Proximo passo: Fase 0.3 - git pull no Codespace + Fase 0.4-0.8 limpeza da raiz
