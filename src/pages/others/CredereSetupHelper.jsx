import React, { useState } from 'react';
import Header1 from "../../components/headers/Header1";
import Footer1 from "../../components/footers/Footer1";

export default function CredereSetupHelper() {
  const [setupInfo, setSetupInfo] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: window.location.origin + '/admin',
    scope: 'embedded'
  });
  const [showInstructions, setShowInstructions] = useState(true);

  const handleInputChange = (field, value) => {
    setSetupInfo({ ...setupInfo, [field]: value });
  };

  const generateEnvConfig = () => {
    if (!setupInfo.clientId || !setupInfo.clientSecret) {
      alert('Por favor, preencha o Client ID e Client Secret primeiro');
      return;
    }

    const envText = `# Credenciais Credere OAuth2
VITE_CREDERE_CLIENT_ID=${setupInfo.clientId}
VITE_CREDERE_CLIENT_SECRET=${setupInfo.clientSecret}
VITE_CREDERE_REDIRECT_URI=${setupInfo.redirectUri}
VITE_CREDERE_SCOPE=${setupInfo.scope}`;

    navigator.clipboard.writeText(envText);
    alert('Configuração copiada para a área de transferência!');
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
                <li className="active">Configuração Credere</li>
              </ul>
            </div>

            <h2 className="title" style={{ marginBottom: '36px' }}>
              Assistente de Configuração Credere
            </h2>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {showInstructions && (
                <div style={{
                  backgroundColor: '#dbeafe',
                  border: '2px solid #3b82f6',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '32px'
                }}>
                  <h3 style={{ color: '#1e40af', marginBottom: '16px' }}>
                    📖 O que procurar na documentação:
                  </h3>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1e3a8a', marginBottom: '12px' }}>
                      1. Clique em "Autenticação" na documentação
                    </h4>
                    <ul style={{ color: '#3730a3', lineHeight: '1.8', marginLeft: '20px' }}>
                      <li>Procure por: <strong>"OAuth2"</strong> ou <strong>"Authorization Code"</strong></li>
                      <li>Localize: <strong>"Client ID"</strong> e <strong>"Client Secret"</strong></li>
                      <li>Verifique se menciona: <strong>"Embedded"</strong> ou <strong>"Simulador"</strong></li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1e3a8a', marginBottom: '12px' }}>
                      2. Informações importantes para copiar:
                    </h4>
                    <div style={{ 
                      backgroundColor: 'white', 
                      padding: '16px', 
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1'
                    }}>
                      <p style={{ marginBottom: '8px', fontFamily: 'monospace' }}>
                        <strong>Client ID:</strong> [código longo, ex: "abc123def456..."]
                      </p>
                      <p style={{ marginBottom: '8px', fontFamily: 'monospace' }}>
                        <strong>Client Secret:</strong> [senha secreta da aplicação]
                      </p>
                      <p style={{ marginBottom: '8px', fontFamily: 'monospace' }}>
                        <strong>Redirect URI:</strong> {window.location.origin}/admin
                      </p>
                      <p style={{ fontFamily: 'monospace' }}>
                        <strong>Scopes disponíveis:</strong> embedded, simulador, leads
                      </p>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #fbbf24'
                  }}>
                    <p style={{ color: '#92400e', fontWeight: 'bold' }}>
                      ⚠️ Atenção: NÃO são suas credenciais de login!
                    </p>
                    <p style={{ color: '#78350f', fontSize: '14px', marginTop: '8px' }}>
                      Client ID e Client Secret são específicos para integração API, 
                      diferentes de email/senha de usuário.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowInstructions(false)}
                    style={{
                      marginTop: '20px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Já tenho as informações →
                  </button>
                </div>
              )}

              {!showInstructions && (
                <>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    padding: '24px',
                    borderRadius: '12px',
                    marginBottom: '32px'
                  }}>
                    <h3 style={{ marginBottom: '20px' }}>
                      Configure suas credenciais OAuth2:
                    </h3>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Client ID: *
                      </label>
                      <input
                        type="text"
                        placeholder="Cole o Client ID da documentação"
                        value={setupInfo.clientId}
                        onChange={(e) => handleInputChange('clientId', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Client Secret: *
                      </label>
                      <input
                        type="password"
                        placeholder="Cole o Client Secret da documentação"
                        value={setupInfo.clientSecret}
                        onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Redirect URI: (já configurado)
                      </label>
                      <input
                        type="text"
                        value={setupInfo.redirectUri}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          backgroundColor: '#f9fafb'
                        }}
                      />
                      <small style={{ color: '#6b7280', fontSize: '14px' }}>
                        Esta URL precisa estar cadastrada no Credere
                      </small>
                    </div>

                    <button
                      onClick={generateEnvConfig}
                      disabled={!setupInfo.clientId || !setupInfo.clientSecret}
                      style={{
                        backgroundColor: setupInfo.clientId && setupInfo.clientSecret ? '#10b981' : '#9ca3af',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: setupInfo.clientId && setupInfo.clientSecret ? 'pointer' : 'not-allowed',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      Copiar Configuração para .env
                    </button>
                  </div>

                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <h4 style={{ color: '#166534', marginBottom: '12px' }}>
                      ✓ Próximos passos após copiar:
                    </h4>
                    <ol style={{ color: '#15803d', lineHeight: '1.8' }}>
                      <li>Cole a configuração no arquivo .env do projeto</li>
                      <li>Acesse o <a href="/admin" style={{ color: '#0284c7' }}>painel admin</a></li>
                      <li>Use o gerador de token OAuth2</li>
                      <li>O simulador funcionará automaticamente</li>
                    </ol>
                  </div>

                  <button
                    onClick={() => setShowInstructions(true)}
                    style={{
                      marginTop: '20px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ← Voltar às instruções
                  </button>
                </>
              )}

              {/* Seção de possíveis endpoints */}
              <div style={{
                marginTop: '40px',
                backgroundColor: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h4 style={{ color: '#6b21a8', marginBottom: '16px' }}>
                  🔍 Possíveis endpoints na documentação:
                </h4>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '16px', 
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#4c1d95'
                }}>
                  <p style={{ marginBottom: '8px' }}>
                    POST /api/v1/token - Gerar token
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    GET /api/v1/authorize - Autorização OAuth2
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    POST /api/v1/token/refresh - Renovar token
                  </p>
                  <p>
                    GET /api/v1/simulador/embed - Configurações do embed
                  </p>
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