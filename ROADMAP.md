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

## FASE 2: Próximos Passos
- [ ] Implementar página de Listagem de Veículos
- [ ] Implementar página de Detalhes do Veículo
- [ ] Criar componentes de filtros
- [ ] Adicionar paginação

