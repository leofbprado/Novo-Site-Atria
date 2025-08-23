import React, { useState } from 'react';
import Header1 from "../../components/headers/Header1";
import Footer1 from "../../components/footers/Footer1";

export default function CredereFinalSolution() {
  const [showQuickSolution, setShowQuickSolution] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    contacted: false,
    hasCredentials: false
  });

  return (
    <>
      <Header1 />
      <main className="boxcar-content">
        <section className="inventory-section pb-5 layout-radius">
          <div className="boxcar-container">
            <div className="boxcar-title-three" style={{ marginBottom: '12px' }}>
              <ul className="breadcrumb">
                <li><a href="/">Home</a></li>
                <li className="active">Solução Credere</li>
              </ul>
            </div>

            <h2 className="title" style={{ marginBottom: '36px' }}>
              Como Resolver a Integração do Credere
            </h2>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {/* Explicação principal */}
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #0284c7',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ color: '#0c4a6e', marginBottom: '16px', fontSize: '24px' }}>
                  ✅ A Resposta Definitiva
                </h3>
                <p style={{ color: '#075985', fontSize: '18px', lineHeight: '1.8', marginBottom: '16px' }}>
                  Suas credenciais <strong>leo@atriaveiculos.com.br / Atria2025</strong> são apenas para login.
                  Para integração, você precisa de <strong>credenciais OAuth2</strong> que são fornecidas 
                  <strong> pelo comercial do Credere</strong>.
                </p>
              </div>

              {/* O que fazer */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ color: '#166534', marginBottom: '20px', fontSize: '20px' }}>
                  📞 O Que Fazer Agora:
                </h3>
                
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: '#15803d', marginBottom: '12px' }}>
                    1. Entre em contato com o comercial do Credere
                  </h4>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #86efac'
                  }}>
                    <p style={{ marginBottom: '12px', lineHeight: '1.8' }}>
                      <strong>Diga exatamente isto:</strong>
                    </p>
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      padding: '16px',
                      borderRadius: '6px',
                      fontStyle: 'italic',
                      color: '#14532d'
                    }}>
                      "Preciso das credenciais OAuth2 para integrar o simulador embedded no meu site. 
                      Preciso do Client ID, Client Secret e o Scope para embedded. 
                      Meu CNPJ é 21.411.055/0001-64 (Átria Veículos)."
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: '#15803d', marginBottom: '12px' }}>
                    2. O comercial fornecerá:
                  </h4>
                  <ul style={{ lineHeight: '1.8', color: '#166534' }}>
                    <li><strong>Client ID:</strong> Um código único da sua aplicação</li>
                    <li><strong>Client Secret:</strong> Uma senha secreta</li>
                    <li><strong>Scope:</strong> Provavelmente será "embedded"</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: '#15803d', marginBottom: '12px' }}>
                    3. Após receber as credenciais:
                  </h4>
                  <p style={{ color: '#166534' }}>
                    Volte aqui e use o <a href="/admin" style={{ color: '#0284c7' }}>painel admin</a> para 
                    gerar o token de acesso.
                  </p>
                </div>
              </div>

              {/* Solução temporária */}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ color: '#92400e', marginBottom: '16px' }}>
                  ⚡ Solução Imediata (Enquanto Aguarda)
                </h3>
                <p style={{ color: '#78350f', marginBottom: '16px', lineHeight: '1.8' }}>
                  Enquanto não recebe as credenciais, você pode usar um link direto para o simulador:
                </p>
                
                <button
                  onClick={() => setShowQuickSolution(!showQuickSolution)}
                  style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {showQuickSolution ? 'Ocultar' : 'Ver Solução Rápida'}
                </button>

                {showQuickSolution && (
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ marginBottom: '12px', color: '#92400e' }}>
                      Adicione este botão nas páginas dos veículos:
                    </p>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      overflowX: 'auto'
                    }}>
                      <pre style={{ margin: 0 }}>{`<a href="https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64" 
   target="_blank" 
   style="background-color: #1A75FF; 
          color: white; 
          padding: 12px 24px; 
          border-radius: 8px; 
          text-decoration: none; 
          display: inline-block;">
   Simular Financiamento
</a>`}</pre>
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#92400e' }}>
                      ✓ Funciona imediatamente<br />
                      ✗ Usuários saem do seu site
                    </p>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '24px',
                borderRadius: '12px'
              }}>
                <h3 style={{ marginBottom: '16px' }}>📋 Checklist de Acompanhamento</h3>
                
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={contactInfo.contacted}
                    onChange={(e) => setContactInfo({...contactInfo, contacted: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ color: contactInfo.contacted ? '#059669' : '#4b5563' }}>
                    Entrei em contato com o comercial do Credere
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={contactInfo.hasCredentials}
                    onChange={(e) => setContactInfo({...contactInfo, hasCredentials: e.target.checked})}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ color: contactInfo.hasCredentials ? '#059669' : '#4b5563' }}>
                    Recebi Client ID e Client Secret
                  </span>
                </label>

                {contactInfo.hasCredentials && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#ecfdf5',
                    borderRadius: '8px',
                    border: '1px solid #86efac'
                  }}>
                    <p style={{ color: '#059669', fontWeight: 'bold' }}>
                      Ótimo! Agora acesse o <a href="/admin" style={{ color: '#0284c7' }}>painel admin</a> para 
                      configurar suas credenciais.
                    </p>
                  </div>
                )}
              </div>

              {/* Resumo dos passos OAuth2 */}
              <div style={{
                marginTop: '32px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ marginBottom: '12px', color: '#6b7280' }}>
                  📖 Entendendo o Processo OAuth2 do Credere:
                </h4>
                <ol style={{ color: '#6b7280', lineHeight: '1.8', fontSize: '14px' }}>
                  <li>Comercial cria sua aplicação → Recebe Client ID/Secret</li>
                  <li>Você autoriza a aplicação → Gera código temporário</li>
                  <li>Usa o código → Gera token de acesso (válido por 6 meses)</li>
                  <li>Usa o token → Acessa o simulador embedded</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer1 />
    </>
  );
}