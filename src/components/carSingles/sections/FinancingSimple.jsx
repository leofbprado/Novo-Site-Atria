import React, { useEffect, useState } from "react";

export default function FinancingSimple({ carItem }) {
  // Estado para controlar quando é seguro mostrar o Credere
  const [showCredere, setShowCredere] = useState(false);
  // Função para salvar lead da simulação no Firebase
  const saveSimulationLead = async (simulationData) => {
    try {
      // ⚡ Firebase lazy loading - só carrega quando necessário
      const { db } = await import("../../../firebase/config");
      const { doc, setDoc, getDoc, updateDoc, arrayUnion } = await import("firebase/firestore");
      
      const cpf = simulationData.cpf || simulationData.customer?.cpf;
      const uuid = carItem?.id || window.carroSelecionado?.uuid;
      
      if (!cpf || !uuid) {
        console.error('CPF ou UUID do veículo não encontrado');
        return;
      }

      // Formata o CPF removendo caracteres especiais
      const cpfClean = cpf.replace(/\D/g, '');
      const simulacaoId = `${cpfClean}-${uuid}`;
      
      // Prepara os dados do lead
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
        origem: 'simulador_estoque',
        veiculo: {
          nome: `${carItem?.marca} ${carItem?.modelo} ${carItem?.versao || ''}`.trim(),
          uuid: uuid,
          url: window.location.href
        },
        eventos: [{
          tipo: 'simulacao_enviada',
          timestamp: new Date().toISOString()
        }]
      };

      // Verifica se já existe o documento
      const docRef = doc(db, 'leads_simulacao', simulacaoId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Cria novo documento
        await setDoc(docRef, leadData);
        console.log('✅ Lead de simulação salvo:', simulacaoId);
      } else {
        // Atualiza documento existente
        await updateDoc(docRef, {
          status_interacao: 'simulado_novamente',
          eventos: arrayUnion({
            tipo: 'simulacao_atualizada',
            timestamp: new Date().toISOString()
          })
        });
        console.log('✅ Lead de simulação atualizado:', simulacaoId);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar lead da simulação:', error);
    }
  };

  useEffect(() => {
    // Verificação de estabilidade do DOM antes de manipular scripts
    if (!document.body) {
      console.warn('DOM não está pronto, aguardando...');
      return;
    }
    
    // Aguarda estabilização do DOM antes de ativar Credere
    const domStabilityTimer = setTimeout(() => {
      setShowCredere(true);
      console.log('✅ DOM estabilizado, Credere liberado para montagem');
    }, 100);
    // Armazena informações do veículo globalmente para o Credere
    if (carItem) {
      window.carroSelecionado = {
        nome: `${carItem.marca} ${carItem.modelo} ${carItem.versao || ''}`.trim(),
        uuid: carItem.id,
        url: window.location.href
      };
    }

    // Prepara os parâmetros do veículo
    const params = new URLSearchParams();
    
    if (carItem) {
      // Parâmetro q: marca + nome do veículo
      const vehicleDescription = `${carItem.marca} ${carItem.modelo} ${carItem.versao || ''}`.trim();
      params.append('q', vehicleDescription);
      
      // Anos
      if (carItem.ano_fabricacao) {
        params.append('manufacture_year', carItem.ano_fabricacao);
      }
      if (carItem.ano_modelo) {
        params.append('model_year', carItem.ano_modelo);
      }
      
      // Valor em centavos
      if (carItem.preco) {
        params.append('value_cents', Math.round(carItem.preco * 100));
      }
    }

    // Monta a URL completa do script
    const baseUrl = 'https://app.meucredere.com.br/simulador/loja/21411055000164/veiculo/detectar.js';
    const scriptUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    
    // Proteção React-safe com pattern defensivo
    const scriptId = "credereScript";
    
    // Verifica se script já existe (evita duplicação)
    if (document.getElementById(scriptId)) {
      console.log('📌 Script Credere já existe, reutilizando...');
      return;
    }
    
    // Cleanup defensivo de elementos órfãos
    try {
      const orphanIframes = document.querySelectorAll('iframe[src*="credere"]');
      orphanIframes.forEach(iframe => {
        if (iframe.parentNode) {
          try {
            iframe.parentNode.removeChild(iframe);
          } catch (err) {
            // Silencia erros individuais
          }
        }
      });
    } catch (e) {
      // Silencia erros gerais de cleanup
    }
    
    // Cria script com proteção React-safe aprimorada
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    
    // Função isolada para inicialização do Credere
    function initializeCredereIntegration() {
          console.log('🔍 Verificando objetos Credere disponíveis:');
          console.log('window.Credere:', window.Credere);
          console.log('window.CREDERE:', window.CREDERE);
          console.log('window.CrederePlugin:', window.CrederePlugin);
          console.log('window._credere:', window._credere);
          
          // Verificar se existe iframe do Credere
          const credereIframe = document.querySelector('iframe[src*="credere"]');
          console.log('📱 Iframe Credere encontrado:', credereIframe);
          
          // Verificar se existe div container do Credere
          const credereContainer = document.querySelector('[id*="credere"], [class*="credere"]');
          console.log('📦 Container Credere encontrado:', credereContainer);
        
        // Configurar listener para capturar simulações
        if (!window._CREDERE_PNP_LISTENING) {
          window._CREDERE_PNP_LISTENING = true;
          
          window.addEventListener('message', (event) => {
            // Log todas as mensagens para debug
            console.log('📨 Mensagem recebida de:', event.origin);
            console.log('📦 Dados da mensagem:', event.data);
            
            // Verifica se é uma mensagem do Credere
            if (event.origin !== 'https://app.meucredere.com.br') return;
            
            console.log('✅ Mensagem do Credere detectada:', event.data);
            
            // Captura eventos de simulação - testando vários formatos possíveis
            if (event.data?.event === 'simulation:created' || 
                event.data?.event === 'onSimulation' ||
                event.data?.type === 'credere:simulation' ||
                event.data?.action === 'simulation' ||
                (event.data?.type === 'credere' && event.data?.data)) {
              
              console.log('🎯 Simulação capturada:', event.data);
              
              // Extrai os dados da simulação
              const simulationData = event.data.data || event.data.payload || event.data;
              
              // Salva o lead no Firebase
              saveSimulationLead(simulationData);
            }
          });
          
          console.log('👂 Listener de simulações Credere ativado');
          
          // Configurar callback do Credere se disponível
          if (window.Credere && window.Credere.onSimulation) {
            console.log('🔧 Configurando callback onSimulation');
            window.Credere.onSimulation = (data) => {
              console.log('📞 Callback onSimulation chamado:', data);
              saveSimulationLead(data);
            };
          }
          
          // Também tentar configurar callback global
          window.onCredereSimulation = (data) => {
            console.log('🎯 Callback global onCredereSimulation chamado:', data);
            saveSimulationLead(data);
          };
          
          // Configurar no objeto window.CREDERE
          if (!window.CREDERE) {
            window.CREDERE = {};
          }
          window.CREDERE.onSimulation = (data) => {
            console.log('🎯 CREDERE.onSimulation chamado:', data);
            saveSimulationLead(data);
          };
        }
        console.log('🔧 Credere integração inicializada com proteção React Router');
    }
    
    script.onload = () => {
      console.log('✅ Script Credere carregado com sucesso');
      console.log('📎 URL do script:', scriptUrl);
        
      // Aguardar DOM estabilizar antes de inicializar (proteção React Router)
      requestIdleCallback ? requestIdleCallback(() => {
        initializeCredereIntegration();
      }) : setTimeout(() => {
        initializeCredereIntegration();
      }, 100);
    };
      
    script.onerror = () => {
      console.error('❌ Erro ao carregar script Credere');
    };
      
    document.body.appendChild(script);
    
    // Cleanup aprimorado para evitar React Error #130
    return () => {
      try {
        console.log('🧹 Iniciando limpeza segura dos recursos Credere...');
        
        // Remove script de forma segura
        const scriptToRemove = document.getElementById("credereScript");
        if (scriptToRemove && scriptToRemove.parentNode) {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
          console.log('✅ Script Credere removido');
        }
        
        // Remove iframes do Credere que podem ter sido criados
        const credereIframes = document.querySelectorAll('iframe[src*="credere"]');
        credereIframes.forEach((iframe, index) => {
          try {
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
              console.log(`✅ Iframe Credere ${index + 1} removido`);
            }
          } catch (e) {
            // Silencia erros individuais de iframe
          }
        });
        
        // Limpa listeners de mensagem
        if (window._CREDERE_MESSAGE_LISTENER) {
          window.removeEventListener('message', window._CREDERE_MESSAGE_LISTENER);
          window._CREDERE_MESSAGE_LISTENER = null;
          console.log('✅ Message listeners removidos');
        }
        
        // Reset flags globais
        window._CREDERE_PNP_LISTENING = false;
        
        // Limpa objetos globais do Credere (com cuidado)
        if (window.CREDERE && typeof window.CREDERE === 'object') {
          try {
            delete window.CREDERE.onSimulation;
          } catch (e) {
            // Silencia erros de limpeza de objetos globais
          }
        }
        
      } catch (error) {
        // Silencia completamente qualquer erro de cleanup para evitar React Error #130
        console.debug('Cleanup Credere (silenciado):', error);
      }
      
      // Limpa timer de estabilidade
      clearTimeout(domStabilityTimer);
      setShowCredere(false);
    };
  }, []);

  return (
    <>
      <h4 className="title">Simulação de Financiamento</h4>
      
      {/* Informações do veículo - IMPORTANTE para o script detectar */}
      {carItem && (
        <>
          {/* Metadados estruturados para o Credere detectar */}
          <div 
            className="vehicle-info"
            data-price={carItem.preco}
            data-brand={carItem.marca}
            data-model={carItem.modelo}
            data-year={carItem.ano_modelo || carItem.ano_fabricacao}
            data-mileage={carItem.km}
            data-type={carItem.tipo_veiculo || 'usado'}
            style={{ display: 'none' }}
          >
            <meta itemProp="price" content={carItem.preco} />
            <meta itemProp="brand" content={carItem.marca} />
            <meta itemProp="model" content={carItem.modelo} />
            <meta itemProp="year" content={carItem.ano_modelo || carItem.ano_fabricacao} />
            <meta itemProp="mileage" content={carItem.km} />
            <meta itemProp="vehicleType" content={carItem.tipo_veiculo || 'usado'} />
          </div>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                {/* Título no formato esperado pelo script */}
                <h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>
                  {carItem.marca} {carItem.modelo} {carItem.versao} {carItem.ano_modelo || carItem.ano_fabricacao}
                </h2>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  {carItem.km ? `${carItem.km.toLocaleString('pt-BR')} km • ` : ''}
                  {carItem.cor} • {carItem.combustivel}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {/* Preço no formato esperado pelo script */}
                <h3 style={{ fontSize: '24px', color: '#28a745', fontWeight: 'bold', margin: 0 }}>
                  R$ {carItem.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Container onde o plugin do Credere será inserido - com render condicional */}
      {showCredere && (
        <div id="credere-pnp" style={{
        minHeight: '400px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        {/* O plugin do Credere será inserido aqui automaticamente */}
        </div>
      )}
      
      {/* Informações adicionais */}
      <div style={{
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        border: '1px solid #90caf9'
      }}>
        <p style={{ margin: 0, color: '#1565c0', fontSize: '14px' }}>
          <strong>Vantagens do financiamento:</strong>
        </p>
        <ul style={{ margin: '10px 0 0 20px', padding: 0, color: '#1565c0', fontSize: '14px' }}>
          <li>Simulação sem consulta ao CPF</li>
          <li>Condições reais e personalizadas</li>
          <li>Resposta imediata</li>
          <li>Parcele em até 60 meses</li>
        </ul>
      </div>
    </>
  );
}