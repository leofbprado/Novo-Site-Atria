import React from "react";

export default function FinancingDirect({ carItem }) {
  // URL direta do simulador com os dados do veículo
  const simulatorUrl = `https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64/veiculo/simular?price=${carItem?.preco || 0}&brand=${encodeURIComponent(carItem?.marca || '')}&model=${encodeURIComponent(carItem?.modelo || '')}&year=${carItem?.ano_modelo || carItem?.ano_fabricacao || ''}`;

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

      {/* Iframe direto do simulador */}
      <div style={{
        marginBottom: '20px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #dee2e6',
        backgroundColor: '#fff'
      }}>
        <iframe
          src={simulatorUrl}
          width="100%"
          height="800"
          frameBorder="0"
          title="Simulador de Financiamento Credere"
          style={{
            border: 'none',
            backgroundColor: '#fff'
          }}
          allow="geolocation; microphone; camera"
        />
      </div>
      
      {/* Link para abrir em nova aba */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <a 
          href={simulatorUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#1A75FF',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          Abrir simulador em nova aba
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
      
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