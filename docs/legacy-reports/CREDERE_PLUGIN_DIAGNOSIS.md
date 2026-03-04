# 🔧 Diagnóstico: Plugin Credere Não Abre

## ❗ PROBLEMA REPORTADO
O plugin Credere não está abrindo no site da Átria Veículos.

## 📋 DIAGNÓSTICO TÉCNICO

### ✅ **Status dos Recursos Credere (Verificado):**
- `https://embed.meucredere.com.br/initialize.js` → **200 OK**
- `https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64/veiculo/detectar.js` → **200 OK**

### 🔍 **Implementações Encontradas:**

**1. FinancingSimple.jsx** (Mais provável de estar em uso)
- Localização: `src/components/carSingles/sections/FinancingSimple.jsx`
- Método: Script de detecção automática do Credere
- URL: `https://app.meucredere.com.br/simulador/loja/21411055000164/veiculo/detectar.js`

**2. FinancingEmbed.jsx** 
- Localização: `src/components/carSingles/sections/FinancingEmbed.jsx`
- Método: Embed iframe integrado
- URL: `https://embed.meucredere.com.br/initialize.js`

**3. FinancingDirect.jsx**
- Localização: `src/components/carSingles/sections/FinancingDirect.jsx`
- Método: Link direto para simulador externo

**4. CredereEmbed.jsx**
- Localização: `src/components/financing/CredereEmbed.jsx`
- Método: Componente completo com configurações avançadas

## 🚨 **POSSÍVEIS CAUSAS DO PROBLEMA:**

### **1. Content Security Policy (CSP) Bloqueio**
O CSP no `index.html` pode estar bloqueando scripts do Credere:
```html
      content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:;">
```
**Verificar:** Console do navegador para erros CSP

### **2. Script de Detecção Não Carregando**
O `detectar.js` pode não estar inicializando corretamente:
```javascript
// FinancingSimple.jsx linha ~113
script.src = 'https://app.meucredere.com.br/simulador/loja/21411055000164/veiculo/detectar.js';
```

### **3. Variáveis Globais Conflitantes**
Múltiplas implementações podem estar criando conflitos:
- `window.CREDERE`
- `window.credereVehicleData`
- `window.Credere`
- `window.CrederePlugin`

### **4. Dados do Veículo Malformados**
O Credere pode não estar recebendo dados corretos do veículo:
```javascript
window.carroSelecionado = {
  nome: `${carItem.marca} ${carItem.modelo} ${carItem.versao || ''}`.trim(),
  uuid: carItem.id,
  url: window.location.href
};
```

### **5. Lazy Loading do Firebase**
O carregamento lazy do Firebase pode estar interferindo:
```javascript
const { db } = await import("../../../firebase/config");
```

## 🔧 **PLANO DE CORREÇÃO:**

### **Etapa 1: Diagnóstico Visual**
1. Abrir Console do Navegador (F12)
2. Acessar página de um veículo
3. Verificar erros relacionados a:
   - CSP violations
   - Script loading errors
   - `window.CREDERE` undefined

### **Etapa 2: Identificar Implementação Ativa**
Determinar qual componente está sendo usado:
- Verificar imports em páginas de veículos
- Confirmar qual seção Financing está renderizada

### **Etapa 3: Implementar Correções**

**Correção A: CSP Headers**
Adicionar domínios Credere ao CSP:
```html
script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://app.meucredere.com.br https://embed.meucredere.com.br;
```

**Correção B: Script Loading Robusto**
Implementar loading com retry e debug:
```javascript
const loadCredereScript = () => {
  console.log('🔄 Carregando script Credere...');
  // Implementação com fallback
};
```

**Correção C: Cleanup de Conflitos**
Remover implementações não utilizadas e centralizar numa única abordagem.

**Correção D: Debug Mode**
Adicionar logs detalhados para rastrear o problema:
```javascript
console.log('🔧 Credere Debug:', {
  windowCredere: window.CREDERE,
  carItem: carItem,
  scriptLoaded: !!document.querySelector('script[src*="credere"]')
});
```

## 📋 **CHECKLIST DE VALIDAÇÃO:**

### **Teste 1: Console do Navegador**
- [ ] Sem erros de CSP
- [ ] Script `detectar.js` carregado sem erro 404
- [ ] `window.CREDERE` definido corretamente
- [ ] Dados do veículo presentes

### **Teste 2: Funcionalidade Visual**
- [ ] Botão/área do Credere aparece na página
- [ ] Click no botão abre modal/iframe
- [ ] Formulário de simulação carregado
- [ ] Dados do veículo pré-preenchidos

### **Teste 3: Integração de Dados**
- [ ] CPF do cliente capturado
- [ ] Simulação salva no Firebase
- [ ] Lead registrado corretamente

## ✅ **CORREÇÃO IMPLEMENTADA:**

### **Solução: FinancingCredereFixed.jsx**
- **Arquivo:** `src/components/carSingles/sections/FinancingCredereFixed.jsx`
- **Integração:** Substituído no `Single1Boxcar.jsx` (linha 7 e 499)

### **Melhorias Implementadas:**
1. **Sistema de Debug Robusto:** Logs detalhados para rastrear problemas
2. **Múltiplas Estratégias de Callback:** window.CREDERE, window.Credere, listeners de mensagem
3. **Fallback Visual:** Link para simulador externo sempre disponível
4. **Estados de Loading:** Loading → Loaded → Ready → Error
5. **Cleanup React-Safe:** Prevenção de vazamentos e conflitos
6. **Error Handling:** Tratamento robusto de falhas de script
7. **Visual Debug:** Informações debug apenas em desenvolvimento
8. **Container HTML:** `<div id="credere-pnp"></div>` adicionado na página de detalhes

### **Funcionalidades:**
- ✅ Carregamento do script Credere com parâmetros do veículo
- ✅ Captura de simulações via múltiplos canais
- ✅ Salvamento automático de leads no Firebase
- ✅ Fallback para simulador externo
- ✅ Debug completo em desenvolvimento
- ✅ Estados visuais claros (loading/error/ready)

## 🎯 **PRÓXIMOS PASSOS PARA VALIDAÇÃO:**

1. **Teste em Página de Veículo Real**
2. **Verificar Console para Debug Info**
3. **Validar Captura de Leads no Firebase**
4. **Confirmar Funcionamento do Fallback**
5. **Testar em Diferentes Dispositivos**

---

**📅 Data:** 20 de agosto de 2025  
**✅ Status:** Correção Implementada + Container HTML Adicionado
**⚠️ Prioridade:** Alta - Funcionalidade crítica para conversão de leads