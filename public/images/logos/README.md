# Estrutura de Logos - Átria Veículos

## Organização dos Arquivos

### Logos Principais
- `logo-default.png` - Logo escuro para fundos claros
- `logo-white.png` - Logo branco para fundos escuros
- `logo-default.svg` - Versão SVG do logo escuro (otimizada)
- `logo-white.svg` - Versão SVG do logo branco (otimizada)

## Uso no Código

### Componente Header1
```jsx
src={white ? "/images/logos/logo-white.png" : "/images/logos/logo-default.png"}
```

### Quando usar cada versão
- **logo-default.png**: Homepage, páginas com header claro
- **logo-white.png**: Páginas de estoque, financiamento, páginas com header escuro

## Vantagens desta Estrutura

1. **Organização**: Todos os logos em uma pasta dedicada
2. **Escalabilidade**: Fácil adicionar novas variações (logo-horizontal, logo-vertical, etc.)
3. **Performance**: Arquivos otimizados para web
4. **Acessibilidade**: Contraste adequado em todos os contextos
5. **Manutenção**: Fácil atualização e versionamento

## Preload de Assets (Recomendado)

Para melhor performance, os logos podem ser precarregados:

```html
<link rel="preload" href="/images/logos/logo-default.png" as="image">
<link rel="preload" href="/images/logos/logo-white.png" as="image">
```

## Compatibilidade Replit

✅ **Totalmente compatível** - Sem limitações estruturais
✅ **Build otimizado** - Arquivos são incluídos automaticamente no build
✅ **Cache eficiente** - Vite otimiza o carregamento dos assets
✅ **Deploy automático** - Funciona perfeitamente no Replit Autoscale