# Guia de Configuração de Analytics - Átria Veículos

## 📊 Sistema de Analytics Implementado

O sistema de analytics está completamente implementado com suporte para **Google Tag Manager (GTM)**, **Google Analytics 4 (GA4)** e **Meta Pixel**. 

### 🎯 Eventos Implementados

#### ✅ Eventos Ativos e Funcionando:

1. **search_submit** - Quando usuário faz busca no site
   - Localização: `src/components/headers/Header2.jsx`
   - Dados: termo de busca, número de resultados

2. **view_item_list** - Quando lista de veículos é carregada/filtrada  
   - Localização: `src/components/carListings/Listings1.jsx`
   - Dados: nome da lista, veículos, total de resultados

3. **select_item** - Quando usuário clica em um veículo
   - Localização: `src/components/carListings/Listings1.jsx` (3 pontos de clique)
   - Dados: informações do veículo, posição na lista

4. **click_whatsapp** - Quando usuário clica no WhatsApp
   - Localização: `src/components/common/FixedBottomMenu.jsx`
   - Dados: ID do veículo (se aplicável), origem do clique

5. **click_phone** - Quando usuário clica para ligar
   - Localização: `src/components/common/FixedBottomMenu.jsx`
   - Dados: número do telefone, origem do clique

6. **generate_lead** - Quando formulário de lead é enviado
   - Localizações:
     - `src/components/sellCar/SellCarPage.jsx` (Vender Meu Carro)
     - `src/components/CallToCallLead.jsx` (Call to Call)
   - Dados: tipo de formulário, informações do veículo, dados do lead

---

## 🔧 IDs Necessários para Configuração

### ⚠️ CONFIGURAÇÃO OBRIGATÓRIA

Para que o sistema funcione corretamente, você precisa configurar os seguintes IDs na aba **Secrets** do Replit:

> **📋 NOTA:** Use diferentes IDs para **produção** e **staging**. Para produção, configure as properties/containers do domínio final. Para staging/desenvolvimento, use containers de teste para evitar contaminação dos dados.

#### 1. Google Tag Manager (GTM)
```
Nome da Secret: GTM_CONTAINER_ID
Valor: GTM-XXXXXXX
```
**Como obter:**
1. Acesse [Google Tag Manager](https://tagmanager.google.com)
2. Crie ou acesse seu container
3. Copie o ID que aparece no formato `GTM-XXXXXXX`
4. **Produção:** Use o container do domínio final (atriaveiculos.com.br)
5. **Staging:** Crie container separado para desenvolvimento

#### 2. Google Analytics 4 (GA4) 
```
Nome da Secret: GA4_MEASUREMENT_ID  
Valor: G-XXXXXXXXXX
```
**Como obter:**
1. Acesse [Google Analytics](https://analytics.google.com)
2. Vá em Admin > Propriedade > Fluxos de dados
3. Clique no fluxo da web
4. Copie o ID de mensuração que inicia com `G-`
5. **Produção:** Configure stream para domínio final
6. **Staging:** Use propriedade/stream separado para testes

#### 3. Meta Pixel (Facebook) - OPCIONAL
```
Nome da Secret: VITE_META_PIXEL_ID
Valor: 1234567890123456
```
**🔄 Status: OPCIONAL - Ativar quando necessário**
- Sistema funcionará sem o Pixel configurado
- Analytics via GTM + GA4 já estão ativos
- Para habilitar no futuro:
  1. Acesse [Meta Business Manager](https://business.facebook.com)  
  2. Vá em Ferramentas > Gerenciador de eventos
  3. Copie o ID do Pixel (apenas números)
  4. Configure VITE_META_PIXEL_ID nos Secrets

---

## 📋 Status da Implementação

### ✅ Totalmente Implementado:
- [x] **GTM Container**: Snippets head e body inseridos no `index.html`
- [x] **Analytics Library**: Arquivo `src/lib/analytics.ts` criado e funcional
- [x] **Search Tracking**: Header2.jsx implementado
- [x] **Vehicle List Tracking**: Listings1.jsx implementado
- [x] **Vehicle Click Tracking**: Listings1.jsx implementado
- [x] **WhatsApp Tracking**: FixedBottomMenu.jsx implementado  
- [x] **Phone Tracking**: FixedBottomMenu.jsx implementado
- [x] **Lead Generation Tracking**: SellCarPage.jsx e CallToCallLead.jsx implementados

### 🔄 Status Final de Deploy:
✅ **Implementação Completa GTM + GA4**
- [x] Sistema analytics via dataLayer funcional
- [x] Tracking de busca, visualizações, cliques implementado  
- [x] Environment variables configuradas (VITE_GTM_CONTAINER_ID, VITE_GA4_MEASUREMENT_ID)
- [x] Meta Pixel: OPCIONAL - não bloqueia deploy

### 🔄 Para Implementar (Opcional):
- [ ] **view_item**: Páginas individuais de veículos (`Single1Boxcar.jsx`)
- [ ] **add_to_wishlist**: Sistema de favoritos (se existir)
- [ ] **begin_checkout**: Simulador de financiamento (se aplicável)
- [ ] **Meta Pixel**: Reativar quando VITE_META_PIXEL_ID for configurado

---

## 🚀 Como Testar o Sistema

### 1. Verificar Instalação do GTM:
1. Abra o site em modo desenvolvedor (F12)
2. Vá na aba Console
3. Digite: `dataLayer`
4. Deve aparecer um array com dados

### 2. Verificar Eventos:
1. Faça uma busca no site
2. Clique em um veículo da lista  
3. Use os botões WhatsApp/Telefone
4. Preencha um formulário
5. No Console, procure por: `🔍 Analytics Event: [nome_do_evento]`

### 3. Verificar GTM:
1. Instale a extensão "Google Tag Assistant"
2. Acesse seu site
3. Verifique se o GTM está carregando corretamente

---

## 📊 Configuração do GTM (Google Tag Manager)

### Tags Recomendadas no GTM:

#### 1. **GA4 Configuration Tag**
- Tipo: Google Analytics: GA4 Configuration
- Measurement ID: `{{GA4_MEASUREMENT_ID}}`
- Trigger: All Pages

#### 2. **GA4 Event Tag**  
- Tipo: Google Analytics: GA4 Event
- Configuration Tag: [sua GA4 Configuration Tag]
- Event Name: `{{Event}}`
- Trigger: Custom Event (dataLayer push)

#### 3. **Meta Pixel Base Code**
- Tipo: Custom HTML
- HTML: Código base do Meta Pixel
- Trigger: All Pages

#### 4. **Meta Pixel Events**
- Tipo: Custom HTML  
- HTML: Código de eventos customizados
- Trigger: Custom Event (dataLayer push)

---

## 🎯 Dados Capturados por Evento

### search_submit:
- `search_term`: Termo pesquisado
- `results_count`: Número de resultados
- `search_timestamp`: Timestamp da busca

### view_item_list:
- `item_list_name`: Nome da lista
- `items`: Array com informações dos veículos
- `results_count`: Total de veículos mostrados

### select_item:
- `item_list_name`: Nome da lista
- `item_list_position`: Posição do item clicado
- `items`: Informações do veículo clicado

### generate_lead:
- `form_type`: Tipo do formulário
- `vehicle_id`: ID do veículo (se aplicável)
- `lead_source`: Origem do lead

---

## 🔧 Arquivos Modificados

1. **index.html**: GTM snippets adicionados
2. **src/lib/analytics.ts**: Sistema de analytics criado
3. **src/components/headers/Header2.jsx**: Search tracking
4. **src/components/carListings/Listings1.jsx**: List e item tracking  
5. **src/components/common/FixedBottomMenu.jsx**: WhatsApp e phone tracking
6. **src/components/sellCar/SellCarPage.jsx**: Lead generation tracking
7. **src/components/CallToCallLead.jsx**: Call lead tracking

---

## ✅ Próximos Passos

1. **Configure os IDs** na aba Secrets do Replit
2. **Configure o GTM** com as tags recomendadas
3. **Teste o sistema** seguindo o guia de testes
4. **Monitore os dados** no GA4 e Meta Ads Manager

---

**📞 Suporte**: Se precisar de ajuda na configuração, entre em contato com o desenvolvedor.