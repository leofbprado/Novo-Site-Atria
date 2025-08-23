import React, { useState } from 'react';
import Header1 from "../../components/headers/Header1";
import Footer1 from "../../components/footers/Footer1";

export default function CrederePluginSolution() {
  const [showCode, setShowCode] = useState(false);

  return (
    <>
      <Header1 />
      <main className="boxcar-content">
        <section className="inventory-section pb-5 layout-radius">
          <div className="boxcar-container">
            <div className="boxcar-title-three" style={{ marginBottom: '12px' }}>
              <ul className="breadcrumb">
                <li><a href="/">Home</a></li>
                <li className="active">Plugin Credere - Solução</li>
              </ul>
            </div>

            <h2 className="title" style={{ marginBottom: '36px' }}>
              Como Usar o Plugin Credere (Sem OAuth2)
            </h2>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {/* Boa notícia */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ color: '#166534', marginBottom: '16px', fontSize: '24px' }}>
                  ✅ Boa Notícia!
                </h3>
                <p style={{ color: '#15803d', fontSize: '18px', lineHeight: '1.8' }}>
                  O plugin embedded do Credere <strong>NÃO precisa de OAuth2</strong>!
                  <br />
                  Toda aquela configuração é apenas para quem quer fazer chamadas diretas à API.
                </p>
              </div>

              {/* Como funciona */}
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #60a5fa',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ color: '#1e40af', marginBottom: '16px' }}>
                  📌 Como o Plugin Funciona
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#1e3a8a', marginBottom: '12px' }}>
                    Para páginas de veículos:
                  </h4>
                  <p style={{ color: '#3730a3', lineHeight: '1.8' }}>
                    O plugin usa um script de detecção automática que identifica os dados do veículo
                    na página e preenche automaticamente o simulador.
                  </p>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    marginTop: '8px',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }}>
                    https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64/veiculo/detectar.js
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#1e3a8a', marginBottom: '12px' }}>
                    Para outras páginas (como Financiamento):
                  </h4>
                  <p style={{ color: '#3730a3', lineHeight: '1.8' }}>
                    Use o embed completo que permite simulação manual com todos os recursos.
                  </p>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    marginTop: '8px',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }}>
                    https://embed.meucredere.com.br/initialize.js
                  </div>
                </div>
              </div>

              {/* Implementação atual */}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ color: '#92400e', marginBottom: '16px' }}>
                  ⚡ Implementação Atual
                </h3>
                
                <p style={{ color: '#78350f', marginBottom: '16px' }}>
                  O componente <code>CredereEmbed</code> já está configurado corretamente:
                </p>
                
                <ul style={{ color: '#92400e', lineHeight: '1.8' }}>
                  <li>✓ Carrega o script do embed automaticamente</li>
                  <li>✓ Configura os callbacks para navegação entre páginas</li>
                  <li>✓ Permite pré-preenchimento com dados do veículo</li>
                  <li>✓ Funciona sem necessidade de token ou OAuth2</li>
                </ul>

                <button
                  onClick={() => setShowCode(!showCode)}
                  style={{
                    marginTop: '16px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showCode ? 'Ocultar' : 'Ver'} Exemplo de Uso
                </button>

                {showCode && (
                  <div style={{
                    marginTop: '16px',
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    overflowX: 'auto'
                  }}>
                    <pre style={{ margin: 0 }}>{`// Em qualquer página:
import CredereEmbed from './components/financing/CredereEmbed';

// Uso básico (sem dados do veículo)
<CredereEmbed />

// Com dados do veículo pré-preenchidos
<CredereEmbed 
  vehicleData={{
    price: 89900,
    year: 2022,
    brand: 'Volkswagen',
    model: 'T-Cross'
  }}
/>`}</pre>
                  </div>
                )}
              </div>

              {/* O que NÃO é necessário */}
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>
                  ❌ O que NÃO é necessário:
                </h3>
                <ul style={{ color: '#991b1b', lineHeight: '1.8' }}>
                  <li>Client ID e Client Secret</li>
                  <li>Token de autorização OAuth2</li>
                  <li>Configuração de redirect URI</li>
                  <li>Processo de autenticação</li>
                </ul>
              </div>

              {/* Resumo */}
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: '16px' }}>
                  🎯 Resumo
                </h3>
                <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#374151' }}>
                  O plugin Credere já está <strong>funcionando corretamente</strong> no seu site!
                  <br />
                  Não precisa de configuração adicional.
                </p>
                
                <div style={{ marginTop: '20px' }}>
                  <a 
                    href="/financiamento"
                    style={{
                      backgroundColor: '#1A75FF',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-block',
                      marginRight: '12px'
                    }}
                  >
                    Ver na Página de Financiamento
                  </a>
                  <a 
                    href="/carros"
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Ver nos Veículos
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer1 />
    </>
  );
}