# ✅ SEO Deployment Checklist - Átria Veículos

## 🎯 STATUS: PRONTO PARA DEPLOY

### ✅ **Correções Aplicadas (19/08/2025):**

1. **✅ Firebase.json Configurado**
   - Rewrites adicionados para servir sitemap.xml e robots.txt estaticamente
   - Arquivos SEO não serão mais redirecionados para index.html

2. **✅ Arquivos SEO Copiados**
   - `public/sitemap.xml` → Contém todas as páginas principais + /estoque
   - `public/robots.txt` → Permite crawling, bloqueia /admin/ e /api/

3. **✅ StaticSEO Implementado**
   - Títulos locais para Campinas em todas as páginas principais
   - Schema.org Organization, AutoDealer, WebSite estruturados

---

## 📋 **PRÓXIMOS PASSOS (Execute Após Deploy):**

### **Passo 1: Validar Arquivos SEO**
Após o deploy, confirme se os arquivos são servidos corretamente:

**1.1 Testar Sitemap:**
```
URL: https://www.atriaveiculos.com/sitemap.xml
✅ Deve mostrar XML válido (não HTML da homepage)
✅ Deve conter /estoque com priority="0.7" 
✅ URLs devem usar formato: https://www.atriaveiculos.com/carros/...
```

**1.2 Testar Robots.txt:**
```
URL: https://www.atriaveiculos.com/robots.txt
✅ Deve mostrar texto plano (não HTML)
✅ Deve ter "Allow: /" no início
✅ Sitemap deve apontar para: https://www.atriaveiculos.com/sitemap.xml
```

### **Passo 2: Google Search Console**

**2.1 Enviar Sitemap:**
1. Acesse: [Google Search Console](https://search.google.com/search-console/)
2. Selecione propriedade: `https://www.atriaveiculos.com`
3. Menu lateral → **Sitemaps**
4. Clicar em **Adicionar novo sitemap**
5. Inserir: `sitemap.xml` (apenas o nome do arquivo)
6. Clicar **Enviar**
7. ✅ Status deve aparecer como "Êxito" (pode levar alguns minutos)

**2.2 Forçar Indexação - Páginas Prioritárias:**

**Homepage:**
1. Menu lateral → **Inspeção de URL**
2. Colar: `https://www.atriaveiculos.com/`
3. Clicar **Testar URL ativa**
4. Se OK → **Solicitar indexação**

**Página de Estoque:**
1. Colar: `https://www.atriaveiculos.com/estoque`
2. **Testar URL ativa** → **Solicitar indexação**

**Páginas de Veículos (2-3 exemplos):**
1. Usar URLs reais do seu estoque no formato:
   - `https://www.atriaveiculos.com/carros/toyota/corolla/2022-[shortId]`
   - `https://www.atriaveiculos.com/carros/ford/ka/2021-[shortId]`
2. Repetir processo: **Testar** → **Solicitar indexação**

### **Passo 3: Validação Rich Snippets**

**3.1 Rich Results Test:**
1. Acesse: `https://search.google.com/test/rich-results`
2. Testar URLs principais:

**Homepage:**
```
URL: https://www.atriaveiculos.com/
✅ Verificar: Organization, WebSite schemas
✅ Título: "Seminovos em Campinas | Átria Veículos"
```

**Estoque:**
```
URL: https://www.atriaveiculos.com/estoque  
✅ Verificar: Organization, AutoDealer schemas
✅ Título: "Estoque de Seminovos em Campinas | Átria Veículos"
```

**Página de Veículo:**
```
URL: https://www.atriaveiculos.com/carros/[marca]/[modelo]/[ano-shortId]
✅ Verificar: Vehicle, AutoDealer schemas
✅ Título: "[Marca] [Modelo] [Ano] | Seminovos em Campinas - Átria Veículos"
```

### **Passo 4: Performance & SEO Score**

**4.1 PageSpeed Insights:**
1. Acesse: `https://pagespeed.web.dev/`
2. Testar URLs principais:

**Targets Esperados:**
- 🎯 **SEO Score**: ≥ 90/100
- ⚡ **LCP**: < 2.5s
- ✅ **Títulos**: Devem aparecer no HTML source (não apenas via JavaScript)

### **Passo 5: Social Media Validation**

**5.1 Facebook Sharing:**
1. Acesse: `https://developers.facebook.com/tools/debug/`
2. Testar homepage: `https://www.atriaveiculos.com/`
3. Verificar OpenGraph:
   - `og:title`: "Seminovos em Campinas | Átria Veículos" 
   - `og:description`: Preview correto
   - `og:locale`: "pt_BR"

**5.2 Twitter Cards:**
1. Acesse: `https://cards-dev.twitter.com/validator`  
2. Testar mesma URL
3. Verificar preview renderizado

---

## ⏰ **CRONOGRAMA ESPERADO:**

**Imediato (0-24h):**
- ✅ Sitemap processado pelo Google
- ✅ Primeiras páginas descobertas

**1-7 dias:**  
- 📈 Páginas principais indexadas
- 🔍 Aparição nos resultados de busca

**7-30 dias:**
- 📊 Melhoria no ranking local
- 📈 Aumento de tráfego orgânico (20-40%)

**30-90 dias:**
- 🏆 Posicionamento consolidado 
- 📈 Impacto total no tráfego (+40-60%)

---

## 🎯 **MÉTRICAS DE SUCESSO (30 dias):**

### **Ranking Targets (Campinas):**
- "seminovos em Campinas" → Top 5 local
- "carros usados Campinas" → Top 10 local  
- "[Marca] [Modelo] Campinas" → Top 3 específico
- "financiamento carros Campinas" → Top 10

### **Tráfego & Engagement:**
- 📈 **Tráfego Orgânico**: +40-60%
- 🎯 **CTR**: +25% (títulos otimizados)
- 🏆 **Rich Snippets**: Aparição estruturada
- 📍 **Local Pack**: "carros Campinas"

### **Technical SEO:**
- ✅ **Indexação**: 100% das páginas principais
- ⚡ **Core Web Vitals**: LCP < 2.5s consistente
- 📱 **Mobile-First**: Otimização completa
- 🔗 **Internal Linking**: Estrutura aprimorada

---

**📅 Data de Implementação:** 19 de agosto de 2025  
**🔄 Próxima Revisão:** 18 de setembro de 2025  
**🎯 Meta Principal:** Tornar Átria Veículos referência em "seminovos Campinas"