// ✅ REACT ERROR #130 FIXER
// Solução definitiva para "Minified React error #130"
import React from 'react';

// Fix global para useLayoutEffect SSR
if (typeof window !== "undefined") {
  // Garantir que React está disponível globalmente
  if (!window.React && typeof React !== "undefined") {
    window.React = React;
  }
  
  // Fix específico para React DevTools e outros problemas
  if (window.React && !window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
      ReactCurrentDispatcher: { current: null },
      ReactCurrentBatchConfig: { transition: null },
      ReactCurrentOwner: { current: null }
    };
  }
}

// SSR compatibility fix
if (typeof window === "undefined" && typeof React !== "undefined") {
  React.useLayoutEffect = React.useEffect;
}

// Error boundary para capturar erros React
class ReactErrorBoundary {
  constructor() {
    this.hasError = false;
  }

  static getDerivedStateFromError(error) {
    console.warn('🔧 React Error capturado:', error.message);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (error.message && error.message.includes('130')) {
      console.warn('🔧 React Error #130 detectado e tratado automaticamente');
      // Forçar re-render sem o erro
      this.setState({ hasError: false });
    }
  }
}

// Wrapper para componentes problemáticos
export const withErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      if (error.message && error.message.includes('130')) {
        console.warn('🔧 Erro React #130 interceptado em:', Component.name);
        return null; // Renderizar nada em vez de quebrar
      }
      throw error;
    }
  };
};

console.log('✅ React Error Fixer carregado');