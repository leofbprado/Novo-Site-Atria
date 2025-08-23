import React, { useState } from 'react';
import Header1 from "../../components/headers/Header1";
import Footer1 from "../../components/footers/Footer1";

export default function CredereSolutionGuide() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [tokenData, setTokenData] = useState({
    token: '',
    refreshToken: '',
    expiresIn: ''
  });
  const [saved, setSaved] = useState(false);

  const handleSaveTokenData = () => {
    if (tokenData.token) {
      // Salva o token temporariamente
      localStorage.setItem('credere_access_token', tokenData.token);
      if (tokenData.refreshToken) {
        localStorage.setItem('credere_refresh_token', tokenData.refreshToken);
      }
      if (tokenData.expiresIn) {
        const expiryTime = new Date().getTime() + (parseInt(tokenData.expiresIn) * 1000);
        localStorage.setItem('credere_token_expiry', expiryTime.toString());
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <>
      <Header1 />
      <main className="boxcar-content">
        <section className="inventory-section pb-5 layout-radius">
          <div className="boxcar-container">
            <div className="boxcar-title-three" style={{ marginBottom: '12px' }}>
              <ul className="breadcrumb">
                <li><a href="/">Home</a></li>
                <li className="active">Guia de Soluções Credere</li>
              </ul>
            </div>

            <h2 className="title" style={{ marginBottom: '36px' }}>
              Guia Completo de Integração Credere
            </h2>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {/* Explicação principal */}
              <div style={{
                backgroundColor: '#e0f2fe',
                border: '2px solid #0284c7',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h3 style={{ color: '#0c4a6e', marginBottom: '16px', fontSize: '20px' }}>
                  📌 Entendendo o Sistema Credere
                </h3>
                <p style={{ color: '#075985', lineHeight: '1.8', marginBottom: '16px' }}>
                  O Credere usa OAuth2 para autenticação. Isso significa que existem <strong>dois tipos de credenciais</strong>:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1'
                  }}>
                    <h4 style={{ color: '#0c4a6e', marginBottom: '8px' }}>1. Login de Usuário</h4>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                      <strong>Seu caso:</strong> leo@atriaveiculos.com.br / Atria2025<br />
                      <strong>Uso:</strong> Acessar o painel do Credere
                    </p>
                  </div>
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '16px', 
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1'
                  }}>
                    <h4 style={{ color: '#0c4a6e', marginBottom: '8px' }}>2. Credenciais OAuth2</h4>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                      <strong>Client ID:</strong> Código da aplicação<br />
                      <strong>Client Secret:</strong> Senha da aplicação<br />
                      <strong>Uso:</strong> Integração via API
                    </p>
                  </div>
                </div>
              </div>

              {/* Opções de solução */}
              <h3 style={{ marginBottom: '20px', fontSize: '24px' }}>
                Escolha sua Solução:
              </h3>

              <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
                {/* Opção 1 */}
                <div 
                  onClick={() => setSelectedOption(selectedOption === 1 ? null : 1)}
                  style={{
                    backgroundColor: selectedOption === 1 ? '#f0f9ff' : '#f8fafc',
                    border: `2px solid ${selectedOption === 1 ? '#0284c7' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <h4 style={{ marginBottom: '8px', color: '#1e293b' }}>
                    Opção 1: Obter Credenciais OAuth2 Corretas ✅ (Recomendado)
                  </h4>
                  <p style={{ color: '#64748b' }}>
                    Entre em contato com o Credere para obter suas credenciais de API
                  </p>
                </div>

                {selectedOption === 1 && (
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    padding: '20px',
                    borderRadius: '8px',
                    marginTop: '-12px',
                    marginBottom: '16px',
                    border: '1px solid #bae6fd'
                  }}>
                    <h5 style={{ marginBottom: '12px' }}>Como fazer:</h5>
                    <ol style={{ lineHeight: '1.8', color: '#475569' }}>
                      <li>Entre no painel Credere com seu login</li>
                      <li>Procure por: "Configurações" → "API" ou "Integrações"</li>
                      <li>Se não encontrar, contate o suporte:</li>
                      <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                        <li>Diga que precisa de "Client ID e Client Secret para integração OAuth2"</li>
                        <li>Mencione que é para usar o simulador embedded no seu site</li>
                      </ul>
                      <li>Após receber, use o gerador de token no <a href="/admin" style={{ color: '#0284c7' }}>painel admin</a></li>
                    </ol>
                  </div>
                )}

                {/* Opção 2 */}
                <div 
                  onClick={() => setSelectedOption(selectedOption === 2 ? null : 2)}
                  style={{
                    backgroundColor: selectedOption === 2 ? '#fef3c7' : '#f8fafc',
                    border: `2px solid ${selectedOption === 2 ? '#f59e0b' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <h4 style={{ marginBottom: '8px', color: '#1e293b' }}>
                    Opção 2: Já Tenho um Token Válido 🔑
                  </h4>
                  <p style={{ color: '#64748b' }}>
                    Se você já tem um token de acesso gerado em outro lugar
                  </p>
                </div>

                {selectedOption === 2 && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '20px',
                    borderRadius: '8px',
                    marginTop: '-12px',
                    marginBottom: '16px',
                    border: '1px solid #fde68a'
                  }}>
                    <h5 style={{ marginBottom: '12px' }}>Configure seu token:</h5>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                        Access Token: *
                      </label>
                      <input
                        type="text"
                        placeholder="Bearer abc123def456..."
                        value={tokenData.token}
                        onChange={(e) => setTokenData({...tokenData, token: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                        Refresh Token (opcional):
                      </label>
                      <input
                        type="text"
                        placeholder="refresh_abc123..."
                        value={tokenData.refreshToken}
                        onChange={(e) => setTokenData({...tokenData, refreshToken: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                        Validade em segundos (opcional):
                      </label>
                      <input
                        type="text"
                        placeholder="3600"
                        value={tokenData.expiresIn}
                        onChange={(e) => setTokenData({...tokenData, expiresIn: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSaveTokenData}
                      disabled={!tokenData.token}
                      style={{
                        backgroundColor: tokenData.token ? '#f59e0b' : '#9ca3af',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: tokenData.token ? 'pointer' : 'not-allowed',
                        fontSize: '16px'
                      }}
                    >
                      Salvar Token Temporariamente
                    </button>

                    {saved && (
                      <p style={{ color: '#059669', marginTop: '12px' }}>
                        ✓ Token salvo! Teste o simulador em <a href="/credere-test">/credere-test</a>
                      </p>
                    )}
                  </div>
                )}

                {/* Opção 3 */}
                <div 
                  onClick={() => setSelectedOption(selectedOption === 3 ? null : 3)}
                  style={{
                    backgroundColor: selectedOption === 3 ? '#fee2e2' : '#f8fafc',
                    border: `2px solid ${selectedOption === 3 ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <h4 style={{ marginBottom: '8px', color: '#1e293b' }}>
                    Opção 3: Usar Simulador Direto do Credere ⚡
                  </h4>
                  <p style={{ color: '#64748b' }}>
                    Redirecionar usuários para o simulador no site do Credere
                  </p>
                </div>

                {selectedOption === 3 && (
                  <div style={{
                    backgroundColor: '#fee2e2',
                    padding: '20px',
                    borderRadius: '8px',
                    marginTop: '-12px',
                    marginBottom: '16px',
                    border: '1px solid #fecaca'
                  }}>
                    <h5 style={{ marginBottom: '12px' }}>Como implementar:</h5>
                    <p style={{ lineHeight: '1.8', color: '#475569', marginBottom: '12px' }}>
                      Em vez de integrar o simulador no seu site, você pode adicionar um botão que 
                      redireciona para o simulador do Credere:
                    </p>
                    <div style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '12px', 
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      overflowX: 'auto'
                    }}>
                      https://app.meucredere.com.br/simulador/loja/21.411.055/0001-64
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                      Vantagem: Funciona imediatamente sem configuração<br />
                      Desvantagem: Usuários saem do seu site
                    </p>
                  </div>
                )}
              </div>

              {/* Resumo de tokens */}
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '32px'
              }}>
                <h4 style={{ marginBottom: '12px' }}>📝 Resumo sobre Tokens:</h4>
                <ul style={{ lineHeight: '1.8', color: '#475569' }}>
                  <li><strong>Access Token:</strong> Permite usar a API (validade limitada)</li>
                  <li><strong>Refresh Token:</strong> Permite renovar o access token sem novo login</li>
                  <li><strong>Expires In:</strong> Tempo em segundos até o token expirar</li>
                  <li><strong>Importante:</strong> Tokens devem ser guardados com segurança no servidor</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer1 />
    </>
  );
}