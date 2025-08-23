import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function CredereTokenGenerator() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Configurações do Credere - estas devem ser fornecidas pelo administrador
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: window.location.origin + window.location.pathname
  });

  useEffect(() => {
    // Verifica se há um código de autorização na URL
    const code = searchParams.get('code');
    if (code && config.clientId && config.clientSecret) {
      exchangeCodeForToken(code);
    }
  }, [searchParams, config.clientId, config.clientSecret]);

  const exchangeCodeForToken = async (code) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://app.meucredere.com.br/api/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          grant_type: 'authorization_code',
          scope: 'embedded', // Escopo para o Embed
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setToken(data.access_token);
      
      // Limpa o código da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLoginUrl = () => {
    if (!config.clientId) return '#';
    
    const params = new URLSearchParams({
      response_type: 'code',
      scope: 'embedded',
      client_id: config.clientId,
      redirect_uri: config.redirectUri
    });
    
    return `https://app.meucredere.com.br/api/v1/authorize?${params.toString()}`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Gerador de Token Credere</h2>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p><strong>Como usar:</strong></p>
        <ol>
          <li>Preencha o Client ID e Client Secret fornecidos pelo Credere</li>
          <li>Clique em "Fazer login com o Credere"</li>
          <li>Faça login na sua conta Credere</li>
          <li>O token será gerado automaticamente</li>
          <li>Copie o token e adicione como REACT_APP_CREDERE_TOKEN nas variáveis de ambiente</li>
        </ol>
      </div>

      {/* Formulário de configuração */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Configurações</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Client ID (Application UID):
          </label>
          <input
            type="text"
            value={config.clientId}
            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            placeholder="Digite o Client ID fornecido pelo Credere"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Client Secret:
          </label>
          <input
            type="password"
            value={config.clientSecret}
            onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
            placeholder="Digite o Client Secret fornecido pelo Credere"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Redirect URI (já configurado):
          </label>
          <input
            type="text"
            value={config.redirectUri}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5'
            }}
          />
          <small style={{ color: '#666' }}>
            Esta URL precisa estar cadastrada no Credere
          </small>
        </div>
      </div>

      {/* Botão de login */}
      {!token && (
        <div style={{ marginBottom: '30px' }}>
          <a
            href={getLoginUrl()}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: config.clientId ? '#1A75FF' : '#ccc',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              pointerEvents: config.clientId ? 'auto' : 'none'
            }}
          >
            Fazer login com o Credere
          </a>
          {!config.clientId && (
            <p style={{ color: '#666', marginTop: '10px' }}>
              Preencha o Client ID para habilitar o login
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p>Gerando token de acesso...</p>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#c62828'
        }}>
          <p><strong>Erro:</strong> {error}</p>
        </div>
      )}

      {/* Token gerado */}
      {token && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e8f5e9',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#2e7d32' }}>✓ Token gerado com sucesso!</h3>
          
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Token de Acesso:
            </label>
            <div style={{
              padding: '10px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              {token}
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <p><strong>Próximos passos:</strong></p>
            <ol>
              <li>Copie o token acima</li>
              <li>Adicione como variável de ambiente: REACT_APP_CREDERE_TOKEN</li>
              <li>Reinicie a aplicação</li>
            </ol>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(token);
              alert('Token copiado para a área de transferência!');
            }}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#1A75FF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Copiar Token
          </button>
        </div>
      )}

      {/* Informações adicionais */}
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#fff3cd',
        borderRadius: '4px'
      }}>
        <h4>⚠️ Importante:</h4>
        <ul>
          <li>O token tem validade de 6 meses</li>
          <li>Mantenha o Client Secret seguro e nunca o exponha publicamente</li>
          <li>Esta página deve ser usada apenas em ambiente seguro</li>
          <li>Após gerar o token, remova esta página ou proteja o acesso a ela</li>
        </ul>
      </div>
    </div>
  );
}