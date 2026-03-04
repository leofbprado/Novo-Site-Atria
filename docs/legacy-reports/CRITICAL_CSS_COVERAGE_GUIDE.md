# 🎯 Guia de Extração de CSS Crítico com Chrome Coverage

## Passo 1: Preparar o Ambiente

1. **Abra o site** em modo desenvolvimento:
   ```
   http://localhost:5000
   ```

2. **Abra o Chrome DevTools**:
   - Pressione `F12` ou
   - Botão direito → Inspecionar

## Passo 2: Acessar o Coverage Tool

1. **Abra o Command Menu**:
   - Pressione `Ctrl + Shift + P` (Windows/Linux)
   - Pressione `Cmd + Shift + P` (Mac)

2. **Digite "Coverage"** e selecione:
   - "Show Coverage"

3. O painel Coverage aparecerá na parte inferior do DevTools

## Passo 3: Capturar o CSS Usado

1. **Clique no botão de reload** no painel Coverage:
   - Ícone: 🔄 "Start instrumenting coverage and reload page"

2. **Aguarde a página carregar completamente**

3. **NÃO ROLE A PÁGINA!** 
   - Queremos apenas o CSS "above the fold" (visível sem rolar)

## Passo 4: Identificar o CSS Principal

1. No painel Coverage, você verá uma lista de arquivos
2. Procure pelo arquivo CSS principal:
   - Geralmente: `index-XXXXX.css` ou `style.css`
   - Mostrará uma barra com:
     - 🟦 Azul = CSS usado
     - 🟥 Vermelho = CSS não usado

3. **Clique no arquivo CSS** para abrir no Sources

## Passo 5: Extrair CSS Crítico

1. No painel Sources, você verá:
   - **Linhas em AZUL**: CSS usado (copie estas!)
   - **Linhas em VERMELHO**: CSS não usado (ignore)

2. **Selecione APENAS o CSS em azul** relacionado a:
   - Header/Navegação
   - Banner/Hero Section
   - Filtros de busca
   - Botões principais (CTA)
   - Layout básico (container, grid)

3. **Copie o CSS selecionado**

## Passo 6: Salvar o CSS Extraído

1. Cole o CSS copiado em:
   ```
   critical-coverage.css
   ```

2. Execute o script de otimização:
   ```bash
   node extract-critical-css-coverage.js
   ```

## Elementos Críticos a Incluir

### 🎯 Above the Fold (Prioridade Máxima)

#### Header/Navegação
```css
.boxcar-header
.header-upper
.header-lower
.main-menu
.logo
```

#### Banner/Hero
```css
.boxcar-banner-section-v1
.banner-content
.banner-title
.breadcrumb
```

#### Filtros de Busca
```css
.simple-search-bar
.filter-sidebar
.search-input
.filter-button
```

#### CTAs Principais
```css
.btn
.btn-primary
.cta-button
```

### ⚠️ NÃO Incluir (Below the Fold)

- Cards de veículos
- Footer
- Seções secundárias
- Animações complexas
- Modais/popups

## Exemplo de CSS Crítico Ideal

```css
/* Header - Sempre visível */
.boxcar-header { 
  position: fixed; 
  top: 0; 
  width: 100%; 
  z-index: 1000;
}

/* Banner - Above the fold */
.boxcar-banner-section-v1 {
  height: 80vh;
  display: flex;
  align-items: center;
}

/* Filtros - Visível imediatamente */
.simple-search-bar {
  padding: 20px;
  background: white;
}

/* CTAs - Crítico para conversão */
.btn-primary {
  background: #1A75FF;
  color: white;
  padding: 12px 24px;
}
```

## Tamanho Ideal

- **Objetivo**: < 14KB de CSS crítico
- **Máximo aceitável**: 20KB
- **Current**: Vamos medir após extração

## Benefícios Esperados

- ✅ FCP (First Contentful Paint) < 1.5s
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ Eliminar render-blocking CSS
- ✅ Melhoria de 20-30 pontos no Lighthouse

## Próximos Passos

1. Extrair CSS do Coverage
2. Otimizar com o script
3. Inline no HTML
4. Testar com Lighthouse
5. Ajustar se necessário