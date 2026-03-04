# Roadmap - Limpeza e Reorganização do Projeto

## FASE 0: Limpeza da Raiz do Projeto

### 0.1 Criação de pastas de destino
- [x] Criar `docs/legacy-reports/`
- [x] Criar `docs/legacy-data/`
- [x] Criar `docs/legacy-html/`
- [x] Criar `scripts/legacy/`

### 0.2 Movimentação de arquivos .md
- [x] Mover todos os .md (exceto ARCHITECTURE.md, ROADMAP.md, README.md) para `docs/legacy-reports/`

### 0.3 Movimentação de scripts
- [x] Mover todos os .js, .cjs, .mjs (exceto vite.config.js) para `scripts/legacy/`

### 0.4 Movimentação de arquivos .html
- [x] Mover todos os arquivos .html da raiz para `docs/legacy-html/`

### 0.5 Movimentação de arquivos .json
- [x] Mover todos os .json (exceto package.json, tsconfig.json, components.json) para `docs/legacy-data/`

### 0.6 Limpeza de arquivos temporários
- [x] Deletar `.replit`, `.replit.bak`, `.replitignore`
- [x] Deletar arquivo `15.7.0`
- [x] Deletar arquivos `*.bak.*`
- [x] Deletar arquivos `*.timestamp-*`

### 0.7 Verificação de status
- [x] Executar `git status` e confirmar mudanças

### 0.8 Finalização
- [x] Atualizar ROADMAP.md com status das tarefas

---

## FASE 1: Firebase Config + Estrutura Firestore

### 1.1 Configuração de dependências
- [x] Verificar se firebase está em package.json
- [x] Adicionar firebase como dependência (versão ^10.12.0)

### 1.2 Inicialização do Firebase SDK
- [x] Criar `client/src/lib/firebase.ts`
- [x] Configurar initializeApp com variáveis de ambiente VITE_FIREBASE_*
- [x] Exportar getFirestore, getAuth, getStorage

### 1.3 Tipos e funções Firestore
- [x] Criar `client/src/lib/firestore.ts`
- [x] Definir tipo Vehicle com todos os campos necessários
- [x] Implementar getVehicles(filtros?) com suporte a filtros opcionais
- [x] Implementar getVehicleBySlug(slug)
- [x] Implementar getFeaturedVehicles()

### 1.4 Configuração de variáveis de ambiente
- [x] Atualizar `.env.example` com VITE_FIREBASE_* variables
- [x] Incluir documentação sobre como obter as chaves

### 1.5 Verificação de estrutura
- [x] Confirmar App.tsx tem rota básica funcionando

### 1.6 Versionamento
- [x] Fazer git commit: 'feat: Firebase SDK config + Firestore types'

---

## FASE 2: Homepage Moderna ✅ CONCLUÍDA

### 2.1 Componentes de Layout
- [x] Criar `client/src/components/Header.tsx` (logo Átria Veículos, nav, botão WhatsApp)
- [x] Criar `client/src/components/Footer.tsx` (info empresa, links, redes sociais, endereço Campinas)
- [x] Criar `client/src/components/Layout.tsx` (wrapper Header + Footer + children)

### 2.2 Página Home
- [x] Criar `client/src/pages/Home.tsx` com seções:
  - Hero (banner grande, CTA Ver Estoque, gradiente escuro)
  - Diferenciais (4 cards com ícones)
  - Destaques (grid cards veículos com getFeaturedVehicles + fallback mock)
  - Sobre (texto Átria Veículos com stats)
  - CTA WhatsApp (seção azul destacada)
  - Localização (endereço + horários Campinas)

### 2.3 Design System Atria
- [x] Tema escuro (`#0d1124` base, `#001A70` azul profundo)
- [x] Dourado `#C9A84C` como cor de destaque
- [x] Fonte Barlow + Barlow Condensed (referência consignacao.atriaveiculos.com.br)
- [x] Tailwind config com cores `atria.*` customizadas
- [x] Animações framer-motion mobile-first

### 2.4 Integração App.tsx
- [x] Atualizar `App.tsx` para usar Layout + Home na rota `/`

### 2.5 Versionamento
- [x] Fazer git commit: 'feat: Fase 2 - Homepage moderna com design Atria'

---

## FASE 3: Próximos Passos
- [ ] Implementar página de Listagem de Veículos (`/vehicles`)
- [ ] Implementar página de Detalhes do Veículo (`/vehicles/:slug`)
- [ ] Criar componentes de filtros (marca, ano, preço, câmbio)
- [ ] Adicionar paginação ao estoque
- [ ] Integrar busca em tempo real

