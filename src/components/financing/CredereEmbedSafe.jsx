import React, { useEffect, useRef, useState } from 'react';

/**
 * CredereEmbedSafe - Versão segura do embed Credere para produção
 * Resolve o React Error #130 isolando completamente o DOM manipulation
 */
export default function CredereEmbedSafe({ 
  vehicleData = null, 
  onProposalCreated = null,
  environment = 'https://app.meucredere.com.br/api/v1'
}) {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);
  const isInitializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Evita múltiplas inicializações
    if (isInitializedRef.current) return;
    
    const initializeCredere = async () => {
      try {
        // Cleanup defensivo de instâncias anteriores
        cleanup();
        
        // Verificação de estabilidade do DOM
        if (!containerRef.current) {
          console.warn('Container não disponível, aguardando...');
          return;
        }
        
        // Cria container isolado para o Credere
        containerRef.current.innerHTML = '<div id="credere-embed-container" style="width: 100%; min-height: 400px;"></div>';
        
        // Configuração defensiva do objeto global Credere
        if (!window.CREDERE) {
          window.CREDERE = {};
        }
        
        // Configuração segura do ambiente
        window.CREDERE.environment = environment;
        window.CREDERE.src = 'https://embed.meucredere.com.br/simulations/form';
        
        // Configurações com dados do veículo se disponível
        window.CREDERE.settings = {
          simulations: {
            form: {
              ...(vehicleData && {
                vehicle_price: vehicleData.price || vehicleData.preco,
                vehicle_year: vehicleData.year || vehicleData.ano_modelo,
                vehicle_brand: vehicleData.brand || vehicleData.marca,
                vehicle_model: vehicleData.model || vehicleData.modelo,
              }),
              enable_dynamic_banks: false,
              enable_price_commercial_control: false,
              enable_privacy_policy_checkbox: true,
              bank_codes: []
            }
          }
        };
        
        // Personalização visual integrada ao tema Átria
        window.CREDERE.tokens = `
          :root {
            --token-font-size: 16px;
            --token-font-weight-bold: 600;
            --token-color-brand-primary: #1A75FF;
            --token-color-brand-secondary: #005AB5;
            --token-border-radius-small: 8px;
            --token-border-radius-medium: 12px;
            --token-border-radius-large: 16px;
            --token-font-family-primary: 'DM Sans', Arial, sans-serif;
          }

          .credere-button {
            --border-radius: var(--token-border-radius-medium);
            --font-size: var(--token-font-size);
          }

          .product--embed {
            --token-font-family-primary: 'DM Sans', Arial, sans-serif;
          }
        `;
        
        // Carrega script de forma segura
        await loadCredereScript();
        
        // Listener seguro para eventos
        setupEventListeners();
        
        isInitializedRef.current = true;
        setIsLoading(false);
        
      } catch (error) {
        console.warn('Erro ao inicializar Credere:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    const loadCredereScript = () => {
      return new Promise((resolve, reject) => {
        const scriptId = 'credere-embed-script';
        
        // Verifica se script já existe (proteção React-safe)
        if (document.getElementById(scriptId)) {
          console.log('Script Credere já carregado, reutilizando...');
          resolve();
          return;
        }
        
        // Cleanup defensivo de scripts órfãos
        const existingScript = document.getElementById(scriptId);
        if (existingScript && existingScript.parentNode) {
          try {
            existingScript.parentNode.removeChild(existingScript);
          } catch (e) {
            // Silencia erros de remoção para evitar React Error #130
          }
        }
        
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://embed.meucredere.com.br/initialize.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          scriptRef.current = script;
          setTimeout(resolve, 500); // Aguarda inicialização
        };
        
        script.onerror = reject;
        
        document.head.appendChild(script);
      });
    };
    
    const setupEventListeners = () => {
      // Listener seguro para eventos do Credere
      const handleCredereMessage = (event) => {
        if (event.origin !== 'https://app.meucredere.com.br' && 
            event.origin !== 'https://embed.meucredere.com.br') return;
        
        if (event.data?.event === 'simulation:created' || 
            event.data?.type === 'credere:proposal') {
          if (onProposalCreated) {
            onProposalCreated(event.data);
          }
        }
      };
      
      window.addEventListener('message', handleCredereMessage);
      
      // Limpa listener no cleanup
      return () => {
        window.removeEventListener('message', handleCredereMessage);
      };
    };
    
    const cleanup = () => {
      try {
        // Remove script de forma defensiva (proteção React Error #130)
        const script = document.getElementById('credere-embed-script');
        if (script && script.parentNode) {
          try {
            script.parentNode.removeChild(script);
          } catch (err) {
            console.debug("Erro ao remover script Credere:", err);
          }
        }
        scriptRef.current = null;
        
        // Limpa container de forma segura
        if (containerRef.current) {
          try {
            containerRef.current.innerHTML = '';
          } catch (err) {
            console.debug("Erro ao limpar container:", err);
          }
        }
        
        // Limpa objetos globais com cuidado
        if (window.CREDERE && typeof window.CREDERE === 'object') {
          try {
            delete window.CREDERE;
          } catch (err) {
            console.debug("Erro ao limpar objeto global:", err);
          }
        }
        
      } catch (error) {
        // Silencia completamente erros de cleanup para evitar React Error #130
        console.debug('Cleanup Credere (silenciado):', error);
      }
    };
    
    // Inicializa apenas uma vez
    initializeCredere();
    
    // Cleanup no unmount
    return cleanup;
    
  }, []); // Array vazio - executa apenas uma vez
  
  // Render com estados de loading e erro
  if (hasError) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <p style={{ color: '#6c757d', marginBottom: '16px' }}>
          Não foi possível carregar o simulador de financiamento.
        </p>
        <a 
          href="https://app.meucredere.com.br/simulador/loja/21411055000164"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#1A75FF',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Simular no Site da Credere
        </a>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e9ecef',
          borderTop: '4px solid #1A75FF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#6c757d' }}>Carregando simulador...</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '400px',
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}