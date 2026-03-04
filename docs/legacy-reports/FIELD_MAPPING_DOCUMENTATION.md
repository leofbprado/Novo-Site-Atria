# 📋 DOCUMENTAÇÃO COMPLETA - ESTRUTURA DE CAMPOS DO SISTEMA

## 🎯 RESUMO EXECUTIVO

O sistema Átria Veículos possui uma estrutura robusta de importação e gerenciamento de veículos com geração automática de UUID único para cada veículo. Todos os veículos recebem um identificador único durante a importação através de `crypto.randomUUID()`.

---

## 📊 CAMPOS DA PLANILHA DE IMPORTAÇÃO

### **Campos Básicos Obrigatórios:**
```
✅ Marca - Marca do veículo (Hyundai, Honda, etc.)
✅ Modelo - Modelo do veículo (HB20, Civic, etc.)  
✅ Versão/Versao - Versão específica (Comfort 1.0 TB Flex)
✅ Ano Modelo - Ano do modelo do veículo
✅ Ano Fabricação - Ano de fabricação (opcional, usa Ano Modelo se vazio)
✅ Combustível/Combustivel - Tipo de combustível (Flex, Gasolina, Diesel, Elétrico, Híbrido)
✅ KM - Quilometragem do veículo
✅ Câmbio/Cambio - Tipo de transmissão (Manual, Automático, CVT)
✅ Preço/Preco - Preço de venda (formato brasileiro com R$)
✅ Placa - Placa do veículo
```

### **Campos Opcionais da Planilha:**
```
⚪ Cor - Cor do veículo (padrão: "Não informado")
⚪ Portas - Número de portas (padrão: 4)
⚪ Imagem Principal - URL da foto principal
⚪ Fotos - URLs das fotos separadas por ";" (semicolon)
⚪ Opcionais - Lista de equipamentos separados por vírgula
⚪ Descrição/Descricao - Descrição textual do veículo
⚪ Tipo de anúncio - Para gerar tags automáticas (destaque, promoção, oferta, seminovo)
⚪ Tipo de Veículo - Categoria do veículo (Hatch, Sedan, SUV, Pick-up, Outros)
⚪ Ativo - Status de ativação (true/false, padrão: true)
```

---

## 🖥️ CAMPOS DO PAINEL ADMINISTRATIVO

### **Dados Básicos (Editáveis):**
```javascript
marca: string            // Marca do veículo
modelo: string           // Modelo do veículo  
versao: string           // Versão/trim específica
tipo_veiculo: string     // Hatch, Sedan, SUV, Pick-up, Outros
ano: number              // Ano do modelo
km: number               // Quilometragem
preco: number            // Preço principal
preco_de: number         // Preço "de" para exibição De/Por
placa: string            // Placa do veículo
combustivel: string      // Flex, Gasolina, Diesel, Elétrico, Híbrido
cambio: string           // Manual, Automático, CVT
cor: string              // Cor do veículo
portas: number           // Número de portas
```

### **Status e Configurações:**
```javascript
ativo: boolean           // Veículo ativo no site
mais_vendidos: boolean   // Exibir na homepage (Mais Vendidos)
mostrar_de_por: boolean  // Mostrar preço De/Por
custom_tag: string       // Tag personalizada (destaque, promocao, oferta_especial, etc.)
```

### **Sistema de Fotos (Gerenciamento Completo):**
```javascript
photos: array            // Array principal de fotos (novo sistema)
imagens: array           // Array de compatibilidade (legacy)
fotos: string            // String original da planilha (backup)
foto_destaque: string    // URL da foto principal
tags: object             // Sistema de tags por foto {'url': ['tag1', 'tag2']}
```

### **Equipamentos Categorizados:**
```javascript
equipamentos: {
  INTERIOR: array        // Bancos, central multimídia, ar-condicionado, etc.
  EXTERIOR: array        // Rodas de liga, faróis de neblina, teto solar, etc.
  SEGURANÇA: array       // Airbags, ABS, alarme, câmera de ré, etc.
  CONFORTO: array        // Direção hidráulica, vidros elétricos, piloto automático, etc.
}
```

### **Especificações Técnicas:**
```javascript
especificacoes_tecnicas: {
  comprimento: string    // Comprimento em mm
  largura: string        // Largura em mm
  altura: string         // Altura em mm
  porta_malas: string    // Capacidade do porta-malas em litros
  capacidade: string     // Número de pessoas
  peso: string           // Peso em kg
}
```

### **Informações Extras:**
```javascript
informacoes: string      // Descrição longa do veículo
opcionais_originais_planilha: string  // Backup dos opcionais da planilha
descricao_original_planilha: string   // Backup da descrição da planilha
```

---

## 🔐 SISTEMA DE IDENTIFICAÇÃO UUID

### **Campos de Sistema:**
```javascript
vehicle_uuid: string     // UUID único gerado com crypto.randomUUID()
timestamp: number        // Timestamp da criação/importação
data_importacao: Date    // Data da importação
origem_importacao: string // "planilha_excel" ou "manual"
versao_sistema: string   // Versão do sistema de importação
status_processamento: string // "completo", "pendente", etc.
```

### **Geração Automática de UUID:**
- ✅ **Todos os veículos** recebem UUID único durante importação
- ✅ **Função crypto.randomUUID()** garante unicidade
- ✅ **Verificação automática** de duplicatas
- ✅ **Script de correção** disponível: `check-vehicle-uuids.js`

---

## 🔄 PROCESSO DE IMPORTAÇÃO

### **Etapas da Importação:**
1. **Limpeza**: Remove todos os veículos existentes
2. **Leitura**: Processa planilha Excel (.xlsx)
3. **Validação**: Valida e formata dados
4. **Processamento**: 
   - Gera UUID único para cada veículo
   - Processa fotos (string → array)
   - Categoriza opcionais automaticamente
   - Determina tipo de veículo
   - Aplica tags baseadas no tipo de anúncio
5. **Salvamento**: Salva no Firestore com UUID como ID do documento
6. **Relatório**: Gera relatório completo da importação

### **Campos Processados Automaticamente:**
```javascript
// Fotos: "url1;url2;url3" → ["url1", "url2", "url3"]
// Opcionais: "item1, item2, item3" → categorização automática em 4 grupos
// Preços: "R$ 45.000,00" → 45000 (number)
// Tipo de veículo: baseado no modelo (HB20 → Hatch, Compass → SUV)
// Tags personalizadas: baseado no tipo de anúncio
```

---

## 📱 CAMPOS DISPONÍVEIS NO FRONT-END

### **Exibição Pública:**
- Dados básicos (marca, modelo, versão, ano, km, preço)
- Fotos em galeria responsiva
- Equipamentos por categoria
- Especificações técnicas
- Tags promocionais
- Sistema De/Por para preços

### **Filtros de Busca:**
- Marca e modelo (dinâmicos baseados no estoque)
- Faixa de preço (editável + botões predefinidos)
- Ano e quilometragem
- Tipo de combustível e transmissão
- Tipo de veículo
- Ofertas especiais

---

## 🛠️ SCRIPTS UTILITÁRIOS

### **Importação:**
```bash
node import-new-spreadsheet.js    # Importação completa com limpeza
```

### **Verificação UUID:**
```bash
node check-vehicle-uuids.js       # Verifica e corrige UUIDs ausentes
```

### **Acesso Admin:**
```
URL: /admin
Senha: atria2025admin
```

---

## ✅ RESUMO DE FUNCIONALIDADES

### **✅ IMPLEMENTADO:**
- UUID único para cada veículo (crypto.randomUUID)
- Importação completa de planilhas Excel
- Processamento automático de fotos e opcionais
- Categorização inteligente de equipamentos
- Sistema completo de tags e promoções
- Painel admin com edição completa
- Galeria de fotos com drag-and-drop
- Sistema De/Por para preços
- Filtros dinâmicos baseados no estoque
- Roteamento seguro por UUID

### **🎯 CAMPOS ESSENCIAIS:**
- **Identificação**: vehicle_uuid (obrigatório único)
- **Básicos**: marca, modelo, versao, ano, km, preco, placa
- **Status**: ativo, mais_vendidos, mostrar_de_por
- **Mídia**: photos[], custom_tag
- **Detalhes**: equipamentos{}, especificacoes_tecnicas{}

---

**Sistema atualizado em:** Janeiro 2025  
**Versão:** 2.0  
**Desenvolvido para:** Átria Veículos