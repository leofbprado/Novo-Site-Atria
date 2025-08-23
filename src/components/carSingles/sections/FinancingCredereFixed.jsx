import React, { useEffect, useState, useRef } from "react";

export default function FinancingCredereFixed({ carItem }) {
  const [credereStatus, setCredereStatus] = useState('loading');
  const [debugInfo, setDebugInfo] = useState({});
  const scriptLoadedRef = useRef(false);
  const containerRef = useRef(null);

  // Debug function para rastrear problemas
  const updateDebugInfo = (key, value) => {
    setDebugInfo(prev => ({
      ...prev,
      [key]: value,
      timestamp: new Date().toISOString()
    }));
  };

  // Função para salvar lead no Firebase
  const saveSimulationLead = async (simulationData) => {
    try {
      updateDebugInfo('lead_save_attempt', true);
      
      const { db } = await import("../../../firebase/config");
      const { doc, setDoc, getDoc, updateDoc, arrayUnion } = await import("firebase/firestore");
      
      const cpf = simulationData.cpf || simulationData.customer?.cpf;
      const uuid = carItem?.id || window.carroSelecionado?.uuid;
      
      if (!cpf || !uuid) {
        updateDebugInfo('lead_save_error', 'CPF ou UUID não encontrado');
        return;
      }

      const cpfClean = cpf.replace(/\D/g, '');
      const simulacaoId = `${cpfClean}-${uuid}`;
      
      const leadData = {
        simulacao_id: simulacaoId,
        nome: simulationData.name || simulationData.customer?.name || '',
        cpf: cpfClean,
        telefone: simulationData.phone || simulationData.customer?.phone || '',
        entrada: simulationData.down_payment || 0,
        parcelas: simulationData.installments || 0,
        valor_veiculo: simulationData.vehicle_value || carItem?.preco || 0,
        status_interacao: 'simulado',
        data_criacao: new Date().toISOString(),
        origem: 'simulador_credere_fixed',
        veiculo: {
          nome: `${carItem?.marca} ${carItem?.modelo} ${carItem?.versao || ''}`.trim(),
          uuid: uuid,
          url: window.location.href
        },
        eventos: [{
          tipo: 'simulacao_credere',
          timestamp: new Date().toISOString()
        }]
      };

      const docRef = doc(db, 'leads_simulacao', simulacaoId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, leadData);
        updateDebugInfo('lead_saved', simulacaoId);
      } else {
        await updateDoc(docRef, {
          status_interacao: 'simulado_novamente',
          eventos: arrayUnion({
            tipo: 'simulacao_credere_atualizada',
            timestamp: new Date().toISOString()
          })
        });
        updateDebugInfo('lead_updated', simulacaoId);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar lead:', error);
      updateDebugInfo('lead_save_error', error.message);
    }
  };

  useEffect(() => {
    if (!carItem || scriptLoadedRef.current) return;

    updateDebugInfo('init_start', true);
    
    // Armazena dados do veículo globalmente
    if (carItem) {
      window.carroSelecionado = {
        nome: `${carItem.marca} ${carItem.modelo} ${carItem.versao || ''}`.trim(),
        uuid: carItem.id,
        url: window.location.href,
        preco: carItem.preco
      };
      
      updateDebugInfo('vehicle_data', window.carroSelecionado);
    }

    // Remove scripts anteriores para evitar conflitos
    const existingScripts = document.querySelectorAll('script[src*="credere"]');
    existingScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });

    // Cleanup de iframes órfãos
    const orphanIframes = document.querySelectorAll('iframe[src*="credere"]');
    orphanIframes.forEach(iframe => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    });

    // Prepara parâmetros do veículo
    const params = new URLSearchParams();
    if (carItem) {
      const vehicleDescription = `${carItem.marca} ${carItem.modelo} ${carItem.versao || ''}`.trim();
      params.append('q', vehicleDescription);
      
      if (carItem.ano_fabricacao) {
        params.append('manufacture_year', carItem.ano_fabricacao);
      }
      if (carItem.ano_modelo) {
        params.append('model_year', carItem.ano_modelo);
      }
      if (carItem.preco) {
        params.append('value_cents', Math.round(carItem.preco * 100));
      }
    }

    // URL do script Credere
    const baseUrl = 'https://app.meucredere.com.br/simulador/loja/21411055000164/veiculo/detectar.js';
    const scriptUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    
    updateDebugInfo('script_url', scriptUrl);

    // Configura listener de mensagens ANTES de carregar o script
    const handleCredereMessage = (event) => {
      updateDebugInfo('message_received', {
        origin: event.origin,
        data: event.data
      });

      // Verifica se é mensagem do Credere
      if (event.origin === 'https://app.meucredere.com.br' || 
          event.origin === 'https://embed.meucredere.com.br') {
        
        updateDebugInfo('credere_message', event.data);
        
        // Tenta capturar simulação de várias formas possíveis
        if (event.data?.event === 'simulation:created' || 
            event.data?.event === 'onSimulation' ||
            event.data?.type === 'credere:simulation' ||
            event.data?.action === 'simulation' ||
            (event.data?.type === 'credere' && event.data?.data)) {
          
          const simulationData = event.data.data || event.data.payload || event.data;
          updateDebugInfo('simulation_captured', simulationData);
          saveSimulationLead(simulationData);
        }
      }
    };

    // Adiciona listener se não existir
    if (!window._CREDERE_LISTENER_ADDED) {
      window.addEventListener('message', handleCredereMessage);
      window._CREDERE_LISTENER_ADDED = true;
      updateDebugInfo('listener_added', true);
    }

    // Configura callbacks globais
    window.onCredereSimulation = (data) => {
      updateDebugInfo('global_callback', data);
      saveSimulationLead(data);
    };

    // Cria e carrega o script
    const script = document.createElement('script');
    script.id = 'credereScript';
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    
    // Garantir que o container credere-pnp existe
    if (!document.getElementById('credere-pnp')) {
      const container = document.createElement('div');
      container.id = 'credere-pnp';
      document.body.appendChild(container);
      updateDebugInfo('credere_pnp_created', true);
    }

    script.onload = () => {
      updateDebugInfo('script_loaded', true);
      setCredereStatus('loaded');
      
      // Aguarda um pouco para o Credere inicializar
      setTimeout(() => {
        updateDebugInfo('credere_objects', {
          window_CREDERE: !!window.CREDERE,
          window_Credere: !!window.Credere,
          window_CrederePlugin: !!window.CrederePlugin,
          credere_iframe: !!document.querySelector('iframe[src*="credere"]'),
          credere_container: !!document.querySelector('[id*="credere"], [class*="credere"]')
        });

        // Tenta configurar callbacks nos objetos disponíveis
        if (window.CREDERE) {
          window.CREDERE.onSimulation = saveSimulationLead;
        }
        if (window.Credere && window.Credere.onSimulation) {
          window.Credere.onSimulation = saveSimulationLead;
        }

        setCredereStatus('ready');
      }, 1000);
    };

    script.onerror = () => {
      updateDebugInfo('script_error', true);
      setCredereStatus('error');
    };

    document.head.appendChild(script);
    scriptLoadedRef.current = true;

    // Cleanup
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (window._CREDERE_LISTENER_ADDED) {
        window.removeEventListener('message', handleCredereMessage);
        window._CREDERE_LISTENER_ADDED = false;
      }
    };
  }, [carItem]);

  // Render baseado no status
  const renderContent = () => {
    switch (credereStatus) {
      case 'loading':
        return (
          <div className="credere-loading">
            <div className="loading-spinner"></div>
            <p>Carregando simulador de financiamento...</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="credere-error">
            <h4>Simulador Temporariamente Indisponível</h4>
            <p>Tente novamente em alguns instantes ou entre em contato conosco.</p>
            <a 
              href={`https://app.meucredere.com.br/simulador/loja/21411055000164?price=${carItem?.preco || 0}&brand=${encodeURIComponent(carItem?.marca || '')}&model=${encodeURIComponent(carItem?.modelo || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Abrir Simulador Externo
            </a>
          </div>
        );
      
      case 'ready':
        return (
          <div className="credere-ready">
            <div id="credere-container" ref={containerRef}>
              {/* Container onde o Credere será injetado */}
              <div className="credere-instructions">
                <h5>🔧 Simulador Credere</h5>
                <p>O simulador deve aparecer aqui em alguns segundos...</p>
                <div className="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            </div>
            
            {/* Fallback link sempre visível */}
            <div className="credere-fallback">
              <p className="text-muted small mb-3">
                Caso o simulador não apareça acima, use o link direto:
              </p>
              <a 
                href={`https://app.meucredere.com.br/simulador/loja/21411055000164?price=${carItem?.preco || 0}&brand=${encodeURIComponent(carItem?.marca || '')}&model=${encodeURIComponent(carItem?.modelo || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                📊 Simular Financiamento
              </a>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="credere-loading">
            <p>Inicializando...</p>
          </div>
        );
    }
  };

  return (
    <section className="financing-section">
      <style>{`
        .financing-section {
          padding: 30px 0;
          background: #f8f9fa;
          border-radius: 12px;
          margin: 20px 0;
        }
        
        .credere-loading, .credere-error, .credere-ready {
          text-align: center;
          padding: 40px 20px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1A75FF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .credere-error {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          color: #856404;
        }
        
        .credere-fallback {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
        
        .credere-instructions {
          padding: 20px;
          background: #e3f2fd;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .loading-dots {
          display: inline-block;
          font-size: 24px;
          animation: loadingDots 1.5s infinite;
        }
        
        .loading-dots span {
          animation: loadingDots 1.5s infinite;
        }
        
        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes loadingDots {
          0%, 60%, 100% {
            opacity: 0.3;
          }
          30% {
            opacity: 1;
          }
        }
        
        .btn {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .btn-primary {
          background: #1A75FF;
          color: white;
          border: 2px solid #1A75FF;
        }
        
        .btn-primary:hover {
          background: #0056b3;
          border-color: #0056b3;
        }
        
        .btn-outline-primary {
          background: transparent;
          color: #1A75FF;
          border: 2px solid #1A75FF;
        }
        
        .btn-outline-primary:hover {
          background: #1A75FF;
          color: white;
        }
        
        #credere-container {
          min-height: 400px;
          width: 100%;
        }
      `}</style>
      
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h3 className="text-center mb-4">💳 Simule seu Financiamento</h3>
            {renderContent()}
            
            {/* Debug info em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary>Debug Info (Desenvolvimento)</summary>
                <pre className="small text-muted mt-2">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}