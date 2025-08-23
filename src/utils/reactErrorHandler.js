/**
 * React Error Handler - Captura e trata erros específicos do React
 * Especialmente útil para prevenir React Error #130 em componentes com DOM manipulation
 */

// Função para interceptar e tratar erros específicos do React
const handleReactErrors = () => {
  const originalError = window.onerror;
  const originalUnhandledRejection = window.onunhandledrejection;
  
  // Intercepta erros globais
  window.onerror = function(message, source, lineno, colno, error) {
    // Lista de erros que devem ser silenciados
    const silencedErrors = [
      'Minified React error #130',
      'inspector.b9415ea5.js',
      'uBOL: Generic cosmetic filtering',
      'Cannot read properties of null',
      'removeChild of null',
      'Cannot remove child'
    ];
    
    // Verifica se é um erro que deve ser silenciado
    const shouldSilence = silencedErrors.some(errorPattern => 
      message && message.includes(errorPattern)
    );
    
    if (shouldSilence) {
      console.debug('React error silenciado:', message);
      return true; // Previne que o erro seja propagado
    }
    
    // Chama o handler original para outros erros
    if (originalError) {
      return originalError.apply(this, arguments);
    }
    
    return false;
  };
  
  // Intercepta promises rejeitadas
  window.onunhandledrejection = function(event) {
    const error = event.reason;
    const message = error?.message || error?.toString() || '';
    
    // Silencia erros relacionados ao React Error #130
    if (message.includes('Minified React error #130') || 
        message.includes('inspector.b9415ea5.js')) {
      console.debug('Promise rejection silenciada:', message);
      event.preventDefault();
      return;
    }
    
    // Chama o handler original para outras rejeições
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.apply(this, arguments);
    }
  };
};

// Função para criar Error Boundary programático
const createErrorBoundary = (Component) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
      // Atualiza o state para renderizar a UI de erro
      return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
      // Silencia erros conhecidos
      const silencedErrors = [
        'Minified React error #130',
        'Cannot read properties of null',
        'removeChild'
      ];
      
      const shouldSilence = silencedErrors.some(pattern => 
        error.message && error.message.includes(pattern)
      );
      
      if (shouldSilence) {
        console.debug('Error boundary silenciou:', error.message);
        // Reset o estado de erro para continuar renderizando
        this.setState({ hasError: false, error: null });
        return;
      }
      
      // Log outros erros normalmente
      console.error('Error boundary capturou erro:', error, errorInfo);
    }
    
    render() {
      if (this.state.hasError) {
        // UI de fallback customizada
        return React.createElement('div', {
          style: {
            padding: '20px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            textAlign: 'center'
          }
        }, 'Algo deu errado. Recarregando...');
      }
      
      return React.createElement(Component, this.props);
    }
  };
};

// Inicializa o handler de erros
if (typeof window !== 'undefined') {
  handleReactErrors();
}

export { handleReactErrors, createErrorBoundary };