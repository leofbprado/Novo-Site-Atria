# CLAUDE.md — Novo Site Átria

## Projeto
Site institucional + estoque da Átria Veículos (revenda multimarcas, Campinas/SP).

## Stack
- **Frontend**: HTML/CSS/JS vanilla (sem framework)
- **Backend**: Firebase Firestore + Firebase Auth
- **Hosting**: Cloudflare Pages (`dist/public`)
- **Runtime**: Node 20
- **Deploy**: `git push` → Cloudflare Pages auto-deploy

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
- CSS: variáveis CSS custom properties (`:root`)
- JS: vanilla, sem dependências desnecessárias
- Imagens: WebP com fallback, lazy loading
- Fontes: subset otimizado, preload critical
