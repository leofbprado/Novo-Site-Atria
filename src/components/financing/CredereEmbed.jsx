import React, { useEffect, useRef } from 'react';

export default function CredereEmbed({ 
  vehicleData = null, 
  onProposalCreated = null,
  environment = 'https://app.meucredere.com.br/api/v1',
  token = null,
  customStyles = null
}) {
  const embedContainerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Evita carregar múltiplas vezes
    if (scriptLoadedRef.current) return;

    // Configura o objeto CREDERE global
    window.CREDERE = window.CREDERE || {};
    
    // Configuração do ambiente (sem necessidade de token para embed)
    window.CREDERE.environment = environment;
    // Token não é necessário para o plugin embedded
    // window.CREDERE.authorization = token;
    
    // Personalização visual (opcional)
    if (customStyles || window.CREDERE.tokens) {
      window.CREDERE.tokens = customStyles || window.CREDERE.tokens || `
        :root {
          --token-font-size: 16px;
          --token-font-weight-bold: 600;
          --token-color-brand-primary: #1A75FF;
          --token-color-brand-secondary: #005AB5;
          --token-border-radius-small: 8px;
          --token-border-radius-medium: 12px;
          --token-border-radius-large: 16px;
        }

        .credere-button {
          --border-radius: var(--token-border-radius-medium);
          --font-size: var(--token-font-size-m);
        }

        .product--embed {
          --token-font-family-primary: 'DM Sans', Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `;
    }
    
    // Escolhendo o endpoint inicial (formulário de simulação)
    window.CREDERE.src = 'https://embed.meucredere.com.br/simulations/form';

    // Ajustando configurações avançadas do endpoint
    window.CREDERE.settings = {
      simulations: {
        form: {
          // Se tivermos dados do veículo, pré-preenche
          ...(vehicleData && {
            vehicle_price: vehicleData.price,
            vehicle_year: vehicleData.year,
            vehicle_brand: vehicleData.brand,
            vehicle_model: vehicleData.model,
          }),
          // Configurações adicionais
          enable_dynamic_banks: false,
          enable_price_commercial_control: false,
          enable_privacy_policy_checkbox: true,
          bank_codes: [], // Usa todos os bancos disponíveis
          
          // Configurações avançadas de condições
          _condition: {
            // Habilita campo para escolher parcela específica
            _enable_custom_installments: true,
            // Habilita campos de controle comercial personalizado
            _enable_custom_settings: false,
            // Prazos padrão para simulação
            installments: [12, 24, 36, 48, 60],
            // Preferências de retorno e parcela
            return_preference: 'min',
            quota_preference: 'min',
            // Inclusão de seguros e proteções
            include_financial_protection_insurance: false,
            product_options: {
              include_capitalization_bond: false,
              include_asset_insurance: false,
              include_personal_insurance: false,
            }
          }
        },
        read: {
          // Configurações para a página de resultados
          enable_best_conditions_only: false,
          enable_down_payment_field: true,
          enable_friendly_loading: true,
          enable_successful_conditions_only: true,
          enable_bank_ranking: false,
          enable_best_condition_return: false,
          enable_hide_bank_names: false,
          titles: {
            pre_approval_status_approved: "Aprovadas",
            pre_approval_status_3: "Com grandes chances de aprovação",
            pre_approval_status_2: "Com chance de aprovação",
            pre_approval_status_1: "Sem chance de aprovação",
            pre_approval_status_empty: "Sem condição disponível",
            header_title: "Selecione uma ou mais opções",
            header_subtitle: "Escolha parcelas para cadastrar em uma proposta ou compartilhar no WhatsApp"
          },
          buttons: {
            action_customers_form: "Cadastrar proposta"
          }
        }
      },
      leads: {
        form: {
          // Dados pessoais do cliente podem ser pré-preenchidos aqui
        }
      },
      customers: {
        form: {
          // Configurações do formulário de cliente
          buttons: {
            primary: "Salvar cliente",
            secondary: "Salvar cliente e adicionar avalista"
          },
          // bank_codes será sobrescrito pelos bancos das condições escolhidas
          bank_codes: []
        }
      }
    };

    // Callbacks para eventos disparados pelo embed
    window.CREDERE.callbacks = {
      // Quando uma simulação é criada
      'simulation:create': function(data) {
        console.log('Simulação criada:', data);
        window.alert(`Simulação (identificador ${data.data.uuid}) criada com sucesso!`);
        
        // Navega para a página de resultados da simulação
        window.CREDERE.src = 'https://embed.meucredere.com.br/simulations/read';
        
        // Atualiza configurações para a página de resultados
        window.CREDERE.settings.simulations.read = {
          store_id: data.data.payload.store_id,
          uuid: data.data.uuid,
          enable_best_conditions_only: false,
          enable_down_payment_field: true,
          enable_friendly_loading: true,
          enable_successful_conditions_only: true
        };
        
        // Recarrega o iframe com a nova URL
        const iframe = document.getElementById('credere-initializer-iframe');
        if (iframe) {
          iframe.src = window.CREDERE.src;
        }
        
        // Chama callback se fornecido
        if (onProposalCreated) {
          onProposalCreated(data);
        }
      },
      
      // Quando o usuário interage com os resultados da simulação
      'simulation:read:action': function(data) {
        console.log('Ação na página de resultados:', data);
        
        if (data.action === 'customers/form') {
          console.log('Usuário clicou em cadastrar proposta!');
          console.log('CPF:', data.settings.cpf);
          console.log('ID da Loja:', data.settings.store_id);
          console.log('UUID da Simulação:', data.settings.simulation_uuid);
          console.log('IDs das Condições:', data.settings.condition_ids);
          
          // Navega para o formulário de cliente
          window.CREDERE.src = 'https://embed.meucredere.com.br/customers/form';
          
          // Atualiza configurações para o formulário de cliente
          window.CREDERE.settings.customers = {
            form: {
              cpf: data.settings.cpf,
              _proposal: {
                store_id: data.settings.store_id,
                simulation_uuid: data.settings.simulation_uuid,
                condition_ids: data.settings.condition_ids,
              },
            },
          };
          
          // Recarrega o iframe
          const iframe = document.getElementById('credere-initializer-iframe');
          if (iframe) {
            iframe.src = window.CREDERE.src;
          }
        }
      },
      
      // Quando um lead é criado
      'lead:create': function(data) {
        console.log('Lead criado:', data);
      },
      
      'lead:update': function(data) {
        console.log('Lead atualizado:', data);
      },

      // Quando um cliente é criado/atualizado
      'customer:create': function(data) {
        console.log('Cliente criado:', data);
        window.alert(`Cliente ${data.customer.name} (identificador ${data.customer.id}) criado com sucesso!`);
      },
      
      'customer:update': function(data) {
        console.log('Cliente atualizado:', data);
        window.alert(`Cliente ${data.customer.name} (identificador ${data.customer.id}) atualizado com sucesso!`);
      },

      // Quando uma proposta é criada
      'proposal:create': function(data) {
        console.log('Proposta criada:', data);
        window.alert('Proposta de financiamento criada com sucesso!');
        
        // Chama callback se fornecido
        if (onProposalCreated) {
          onProposalCreated(data);
        }
      },
    };

    // Proteção segura contra conflitos React Router
    if (document.getElementById("credereMainScript")) {
      console.log('📌 Script Credere principal já existe, reutilizando...');
      return;
    }
    
    // Adicionando o embed ao site com proteção
    const credereJS = document.createElement('script');
    credereJS.id = "credereMainScript"; // ID único para controle React-safe
    credereJS.type = 'text/javascript';
    credereJS.src = 'https://embed.meucredere.com.br/initialize.js';
    credereJS.async = true;
    credereJS.defer = true; // Zero JS blocking
    
    credereJS.onload = () => {
      console.log('Credere script carregado com sucesso');
    };
    
    credereJS.onerror = () => {
      console.error('Erro ao carregar script do Credere');
    };

    document.body.appendChild(credereJS);
    scriptLoadedRef.current = true;

    // Cleanup
    return () => {
      // Remove o script se necessário
      if (credereJS && credereJS.parentNode) {
        credereJS.parentNode.removeChild(credereJS);
      }
    };
  }, [vehicleData, environment, token, onProposalCreated]);

  return (
    <div className="credere-embed-container">
      <style>{`
        .credere-embed-container {
          width: 100%;
          min-height: 600px;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
        }
        
        #credere {
          width: 100%;
          min-height: 500px;
        }
        
        #credere iframe {
          width: 100%;
          min-height: 500px;
          border: none;
          border-radius: 8px;
        }
        
        .credere-loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      `}</style>
      
      {/* Container onde o iframe será inserido */}
      <div id="credere" ref={embedContainerRef}>
        <div className="credere-loading">
          <p>Carregando simulador de financiamento...</p>
        </div>
      </div>
    </div>
  );
}