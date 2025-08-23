import React, { useEffect, useState } from "react";

export default function FinancingEmbed({ carItem }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  useEffect(() => {
    if (!carItem) return;
    
    let scriptLoadingTimer = null;
    let initializationTimer = null;
    
    // Limpeza completa do estado anterior
    const cleanupPreviousCredere = () => {
      // Remover scripts existentes
      const existingScripts = document.querySelectorAll('#credereEmbedScript, #credere-initializer-script');
      existingScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
      
      // Limpar container
      const credereContainer = document.getElementById('credere');
      if (credereContainer) {
        credereContainer.innerHTML = '';
      }
      
      // Resetar objeto global
      if (window.CREDERE) {
        delete window.CREDERE;
      }
      
      console.log('🧹 Limpeza completa do Credere realizada');
    };
    
    // Executar limpeza inicial
    cleanupPreviousCredere();
    
    // Aguardar DOM estabilizar
    setTimeout(() => {
      // Configurar CREDERE global com configuração corrigida
      window.CREDERE = {
        environment: 'https://app.meucredere.com.br/api/v1',
        src: 'https://embed.meucredere.com.br/simulations/form',
        settings: {
          simulations: {
            form: {
              vehicle_price: Math.round(carItem.preco || 0), // Arredondar preço
              vehicle_year: parseInt(carItem.ano_modelo || carItem.ano_fabricacao || new Date().getFullYear()),
              vehicle_brand: String(carItem.marca || '').trim(),
              vehicle_model: String(carItem.modelo || '').trim(),
              enable_dynamic_banks: true, // Habilitado para mais opções
              enable_price_commercial_control: true, // Habilitado para controle comercial
              enable_privacy_policy_checkbox: true,
              bank_codes: [] // Array vazio para usar todos os bancos
            }
          }
        },
        callbacks: {
          'simulation:create': function(data) {
            console.log('✅ Simulação Credere criada:', data);
            if (data && data.data && data.data.uuid) {
              setScriptLoaded(true);
              console.log(`Simulação ID: ${data.data.uuid}`);
            }
          },
          'simulation:error': function(error) {
            console.error('❌ Erro na simulação Credere:', error);
          },
          'embed:loaded': function() {
            console.log('✅ Embed Credere carregado');
            setScriptLoaded(true);
          }
        }
      };
      
      console.log('🔧 Configuração Credere definida:', window.CREDERE);
      
      // Criar e carregar script
      const script = document.createElement('script');
      script.id = "credereEmbedScript";
      script.src = 'https://embed.meucredere.com.br/initialize.js';
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('✅ Script Credere carregado com sucesso');
        
        // Timer para verificar inicialização
        initializationTimer = setTimeout(() => {
          const credereContainer = document.getElementById('credere');
          const iframe = credereContainer?.querySelector('iframe');
          
          if (iframe) {
            console.log('✅ Iframe Credere encontrado:', iframe.src);
            setScriptLoaded(true);
          } else {
            console.log('📄 Conteúdo do container credere:', credereContainer?.innerHTML);
            // Força re-inicialização se necessário
            if (window.CREDERE && typeof window.CREDERE.init === 'function') {
              console.log('🔄 Tentando re-inicializar Credere...');
              window.CREDERE.init();
            }
          }
        }, 3000);
      };
      
      script.onerror = (error) => {
        console.error('❌ Erro ao carregar script Credere:', error);
        setScriptLoaded(false);
      };
      
      document.body.appendChild(script);
      
      // Timer de segurança para loading
      scriptLoadingTimer = setTimeout(() => {
        if (!scriptLoaded) {
          console.log('⏰ Timeout de carregamento - mostrando fallback');
          setScriptLoaded(false);
        }
      }, 10000);
      
    }, 500); // Aguardar 500ms para DOM estabilizar
    
    return () => {
      // Cleanup completo
      if (scriptLoadingTimer) clearTimeout(scriptLoadingTimer);
      if (initializationTimer) clearTimeout(initializationTimer);
      
      const scriptToRemove = document.getElementById("credereEmbedScript");
      if (scriptToRemove && scriptToRemove.parentNode) {
        try {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
          console.log('🧹 Script Credere removido');
        } catch (error) {
          console.warn('Script Credere já removido');
        }
      }
    };
  }, [carItem, scriptLoaded]);

  return (
    <>
      <h4 className="title">Simulação de Financiamento</h4>
      
      {/* Informações do veículo */}
      {carItem && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <strong style={{ fontSize: '18px', color: '#333' }}>
                {carItem.marca} {carItem.modelo} {carItem.versao}
              </strong>
              <p style={{ margin: '5px 0', color: '#666' }}>
                Ano: {carItem.ano_modelo || carItem.ano_fabricacao} • 
                {carItem.km ? ` ${carItem.km.toLocaleString('pt-BR')} km` : ''}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Valor do veículo:</span>
              <br />
              <span style={{ fontSize: '24px', color: '#28a745', fontWeight: 'bold' }}>
                R$ {carItem.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Container do Credere */}
      <div 
        id="credere" 
        style={{
          minHeight: '600px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {!scriptLoaded && (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p>Carregando simulador de financiamento...</p>
          </div>
        )}
      </div>
      
      {/* Link de fallback */}
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '15px', color: '#856404' }}>
          Problemas para carregar o simulador? Use o link direto:
        </p>
        <a 
          href={`https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64?price=${carItem?.preco || 0}&brand=${encodeURIComponent(carItem?.marca || '')}&model=${encodeURIComponent(carItem?.modelo || '')}&year=${carItem?.ano_modelo || carItem?.ano_fabricacao || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#1A75FF',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Abrir Simulador Credere →
        </a>
      </div>
      
      {/* Informações adicionais */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        border: '1px solid #90caf9'
      }}>
        <p style={{ margin: 0, color: '#1565c0', fontSize: '14px' }}>
          <strong>Dica:</strong> Simule diferentes valores de entrada e prazos para encontrar a melhor condição de pagamento para você.
        </p>
      </div>
    </>
  );
}