import React, { useEffect, useState } from "react";

export default function Financing({ carItem }) {
  const [loadingScript, setLoadingScript] = useState(true);
  
  useEffect(() => {
    if (!carItem) return;

    // Aguardar um pouco para garantir que o DOM esteja pronto
    const timeoutId = setTimeout(() => {
      // Remover schema anterior se existir
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      if (existingSchema) {
        existingSchema.remove();
      }

      // Criar schema.org JSON-LD com dados do veículo
      const vehicleSchema = {
        "@context": "https://schema.org",
        "@type": "Car",
        "brand": carItem.marca || "",
        "model": carItem.modelo || "",
        "vehicleModelDate": carItem.ano_modelo || carItem.ano_fabricacao || "",
        "mileageFromOdometer": {
          "@type": "QuantitativeValue",
          "value": carItem.km || 0,
          "unitCode": "KMT"
        },
        "fuelType": carItem.combustivel || "",
        "vehicleTransmission": carItem.cambio || "",
        "offers": {
          "@type": "Offer",
          "price": carItem.preco || 0,
          "priceCurrency": "BRL",
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/UsedCondition"
        }
      };

      // Adicionar schema JSON-LD ao head
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(vehicleSchema);
      document.head.appendChild(schemaScript);

      // Criar metadados específicos para o Credere
      window.credereVehicleData = {
        price: carItem.preco || 0,
        brand: carItem.marca || '',
        model: carItem.modelo || '',
        year: carItem.ano_modelo || carItem.ano_fabricacao || '',
        mileage: carItem.km || 0
      };

      // Adicionar o script da Credere dinamicamente
      const script = document.createElement('script');
      script.src = 'https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64/veiculo/detectar.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Script Credere carregado com sucesso');
        setLoadingScript(false);
      };
      
      script.onerror = () => {
        console.error('Erro ao carregar script Credere');
        setLoadingScript(false);
      };
      
      // Adicionar o script ao head
      document.head.appendChild(script);
    }, 500); // Aguardar 500ms para garantir que o DOM esteja pronto
    
    // Cleanup: remover elementos quando o componente for desmontado
    return () => {
      clearTimeout(timeoutId);
      
      const existingScript = document.querySelector('script[src="https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64/veiculo/detectar.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      if (existingSchema) {
        existingSchema.remove();
      }

      // Limpar dados globais
      if (window.credereVehicleData) {
        delete window.credereVehicleData;
      }
    };
  }, [carItem]);

  return (
    <>
      <h4 className="title">Simulação de Financiamento</h4>
      
      {/* Container com dados estruturados para o Credere */}
      <div 
        className="credere-vehicle-container"
        itemScope 
        itemType="https://schema.org/Car"
        style={{ marginBottom: '20px' }}
      >
        {/* Dados estruturados inline para detecção */}
        <meta itemProp="brand" content={carItem?.marca || ''} />
        <meta itemProp="model" content={carItem?.modelo || ''} />
        <meta itemProp="vehicleModelDate" content={carItem?.ano_modelo || carItem?.ano_fabricacao || ''} />
        <meta itemProp="offers" itemScope itemType="https://schema.org/Offer" />
        <meta itemProp="price" content={carItem?.preco || 0} />
        <meta itemProp="priceCurrency" content="BRL" />
        
        {/* Container principal do simulador */}
        <div 
          id="credere-pnp" 
          className="credere-simulator"
          data-credere-price={carItem?.preco || 0}
          data-credere-brand={carItem?.marca || ''}
          data-credere-model={carItem?.modelo || ''}
          data-credere-year={carItem?.ano_modelo || carItem?.ano_fabricacao || ''}
          data-credere-vehicle-type="usado"
          style={{
            minHeight: '500px',
            width: '100%',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #dee2e6',
            position: 'relative'
          }}
        >
          {loadingScript ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#6c757d' 
            }}>
              <div style={{ marginBottom: '20px' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                Carregando simulador de financiamento...
              </p>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '8px',
                display: 'inline-block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <strong>{carItem?.marca} {carItem?.modelo}</strong>
                <br />
                <span style={{ color: '#28a745', fontSize: '18px', fontWeight: 'bold' }}>
                  R$ {carItem?.preco?.toLocaleString('pt-BR') || '0'}
                </span>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Fallback - Link direto se o simulador não carregar */}
        {!loadingScript && (
          <div style={{ 
            marginTop: '20px', 
            padding: '20px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '15px', color: '#856404' }}>
              Se o simulador não carregar automaticamente:
            </p>
            <a 
              href={`https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64?price=${carItem?.preco || 0}&brand=${encodeURIComponent(carItem?.marca || '')}&model=${encodeURIComponent(carItem?.modelo || '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: '#1A75FF',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1A75FF'}
            >
              Simular Financiamento →
            </a>
          </div>
        )}
      </div>
    </>
  );
}
