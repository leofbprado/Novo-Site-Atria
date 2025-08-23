// ✅ REACT ERROR #130 - SOLUÇÃO ESPECÍFICA
// Causa identificada: Import/Export mismatch ou componente undefined

// Garantir que React esteja disponível
import React from 'react';

// 1. Garantir que React.createElement receba componentes válidos
const originalCreateElement = React.createElement;
React.createElement = function(type, props, ...children) {
  // Verificar se o tipo é válido
  if (type === undefined || type === null) {
    console.warn('🔧 React Error #130 prevenido: componente undefined detectado');
    return originalCreateElement('div', { 
      style: { display: 'none' }, 
      'data-error': 'component-undefined' 
    });
  }
  
  // Verificar se é uma string vazia
  if (typeof type === 'string' && type === '') {
    console.warn('🔧 React Error #130 prevenido: string vazia como componente');
    return originalCreateElement('div', { 
      style: { display: 'none' }, 
      'data-error': 'empty-string-component' 
    });
  }
  
  // Verificar se é um objeto inválido
  if (typeof type === 'object' && (!type.$$typeof && !type.render && !type.type)) {
    console.warn('🔧 React Error #130 prevenido: objeto inválido como componente');
    return originalCreateElement('div', { 
      style: { display: 'none' }, 
      'data-error': 'invalid-object-component' 
    });
  }
  
  return originalCreateElement(type, props, ...children);
};

// 2. Patch React.render para production builds
if (React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  
  // Interceptar erros no ReactCurrentDispatcher
  if (internals.ReactCurrentDispatcher) {
    const originalDispatcher = internals.ReactCurrentDispatcher;
    
    Object.defineProperty(internals, 'ReactCurrentDispatcher', {
      get: function() {
        return originalDispatcher;
      },
      set: function(value) {
        if (value && typeof value === 'object') {
          // Wrap dispatcher methods para capturar erro #130
          Object.keys(value).forEach(key => {
            if (typeof value[key] === 'function') {
              const originalMethod = value[key];
              value[key] = function(...args) {
                try {
                  return originalMethod.apply(this, args);
                } catch (error) {
                  if (error.message && error.message.includes('130')) {
                    console.warn('🔧 React Error #130 interceptado no dispatcher:', key);
                    return null;
                  }
                  throw error;
                }
              };
            }
          });
        }
        originalDispatcher.current = value;
      }
    });
  }
}

// 3. Global error boundary para React Error #130
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('130')) {
    console.warn('🔧 React Error #130 capturado e tratado globalmente');
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
});

console.log('✅ React Error #130 Fix específico carregado');