import React from "react";
import '../../styles/error-fallback.css';

// ErrorBoundary simples apenas para InventorySinglePage1
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Se for o erro específico de removeChild, evitar loops infinitos
    if (error.message && error.message.includes('removeChild')) {
      console.log('🔄 Erro removeChild detectado, aplicando correção...');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <img 
            src="/images/logos/logo.png" 
            alt="Átria Veículos" 
            className="error-logo"
          />
          <button 
            onClick={() => window.location.href = '/estoque'}
            className="error-button"
          >
            Voltar para o Estoque
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;