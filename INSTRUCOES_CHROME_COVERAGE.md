# 📋 INSTRUÇÕES PASSO A PASSO - CHROME COVERAGE

## 🎯 O QUE VOCÊ PRECISA FAZER AGORA:

### 1️⃣ ABRIR O SITE
- Abra http://localhost:5000 no Chrome
- Certifique-se que a página carregou completamente

### 2️⃣ ABRIR O COVERAGE
1. Pressione **F12** para abrir o DevTools
2. Pressione **Ctrl + Shift + P** 
3. Digite **"Coverage"**
4. Selecione **"Show Coverage"**

### 3️⃣ INICIAR A CAPTURA
1. No painel Coverage (parte inferior), clique no botão:
   - **🔄 "Start instrumenting coverage and reload page"**
2. A página vai recarregar automaticamente
3. **IMPORTANTE: NÃO ROLE A PÁGINA!**

### 4️⃣ IDENTIFICAR O CSS USADO
1. No painel Coverage, você verá algo assim:
   ```
   URL                           Usage    Unused Bytes
   index-CWGgQzEV.css           32.5%    247KB / 380KB
   ```
2. Clique no arquivo CSS principal (geralmente index-XXXXX.css)

### 5️⃣ COPIAR O CSS CRÍTICO
1. Uma nova aba será aberta mostrando o CSS com:
   - **🔵 AZUL** = CSS usado (COPIE ESTE!)
   - **🔴 VERMELHO** = CSS não usado (IGNORE)

2. **COPIE APENAS** o CSS em azul relacionado a:
   - `.boxcar-header` (navegação)
   - `.boxcar-banner-section-v1` (banner principal)
   - `.simple-search-bar` (barra de busca)
   - `.filter-` (filtros)
   - `.btn`, `.btn-primary` (botões)
   - `.container`, `.row`, `.col-` (layout)

### 6️⃣ COLAR NO ARQUIVO
1. Abra o arquivo `critical-coverage.css`
2. Delete o conteúdo placeholder
3. Cole o CSS que você copiou
4. Salve o arquivo

### 7️⃣ EXECUTAR O OTIMIZADOR
```bash
node extract-critical-css-coverage.js
```

### 8️⃣ APLICAR NO PROJETO
O script vai gerar:
- `critical-coverage-optimized.css` - CSS otimizado
- `critical-coverage-template.html` - Template para aplicar

## 🎨 EXEMPLO DO QUE COPIAR:

```css
/* COPIE ISTO (exemplo de CSS em azul no Coverage) */
.boxcar-header {
  position: fixed;
  top: 0;
  width: 100%;
  background: #fff;
  z-index: 1000;
}

.boxcar-banner-section-v1 {
  min-height: 80vh;
  display: flex;
  align-items: center;
  background-size: cover;
}

.simple-search-bar {
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.btn-primary {
  background-color: #1A75FF;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
}
```

## ❌ NÃO COPIE:

- CSS de cards de veículos (below the fold)
- CSS do footer
- CSS de modais/popups
- Animações complexas
- CSS de componentes não visíveis inicialmente

## 📊 META DE TAMANHO:

- **Ideal**: < 10KB
- **Aceitável**: < 14KB
- **Máximo**: 20KB

## ✅ CHECKLIST:

- [ ] Abri o Coverage no Chrome
- [ ] Recarreguei a página SEM rolar
- [ ] Identifiquei o CSS usado (azul)
- [ ] Copiei apenas CSS above the fold
- [ ] Colei em critical-coverage.css
- [ ] Executei o script otimizador
- [ ] Verifiquei o tamanho final

## 🚀 RESULTADO ESPERADO:

Após aplicar o CSS crítico:
- FCP melhorará em ~30%
- LCP < 2.5s
- Eliminação de render-blocking CSS
- +20-30 pontos no Lighthouse

---

**PRECISA DE AJUDA?** 
Cole o CSS extraído no arquivo critical-coverage.css e execute o script!