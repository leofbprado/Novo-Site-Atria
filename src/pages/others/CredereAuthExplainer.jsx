import React, { useState } from 'react';

export default function CredereAuthExplainer() {
  const [showManualConfig, setShowManualConfig] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveToken = () => {
    if (manualToken) {
      localStorage.setItem('credere_manual_token', manualToken);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Configuração do Credere - Explicação</h2>
      
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#92400e', marginBottom: '12px' }}>
          ⚠️ Credenciais Diferentes são Necessárias
        </h3>
        <p style={{ color: '#78350f', lineHeight: '1.6' }}>
          Suas credenciais <strong>leo@atriaveiculos.com.br / Atria2025</strong> são para login no sistema Credere, 
          mas para integração via API são necessárias credenciais OAuth2 diferentes.
        </p>
      </div>

      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '16px' }}>📋 O que você precisa:</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#1f2937', marginBottom: '8px' }}>1. Client ID</h4>
          <p style={{ color: '#4b5563', marginLeft: '20px' }}>
            Um código longo fornecido pelo Credere (ex: "abc123def456...")
          </p>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#1f2937', marginBottom: '8px' }}>2. Client Secret</h4>
          <p style={{ color: '#4b5563', marginLeft: '20px' }}>
            Uma chave secreta também fornecida pelo Credere
          </p>
        </div>
        
        <div>
          <h4 style={{ color: '#1f2937', marginBottom: '8px' }}>3. Como obter:</h4>
          <ul style={{ marginLeft: '20px', color: '#4b5563', lineHeight: '1.8' }}>
            <li>Entre no painel Credere com seu login</li>
            <li>Procure por "API", "Integrações" ou "Desenvolvedores"</li>
            <li>Ou contate o suporte do Credere solicitando credenciais OAuth2</li>
          </ul>
        </div>
      </div>

      <div style={{
        backgroundColor: '#ecfdf5',
        border: '1px solid #86efac',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#166534', marginBottom: '12px' }}>
          💡 Solução Temporária
        </h3>
        <p style={{ color: '#15803d', marginBottom: '16px' }}>
          Se você já tem um token de acesso válido (gerado em outro lugar), pode configurá-lo manualmente:
        </p>
        
        <button
          onClick={() => setShowManualConfig(!showManualConfig)}
          style={{
            backgroundColor: '#1A75FF',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {showManualConfig ? 'Ocultar' : 'Configurar Token Manualmente'}
        </button>
      </div>

      {showManualConfig && (
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h4 style={{ marginBottom: '12px' }}>Inserir Token Manualmente</h4>
          
          <input
            type="text"
            placeholder="Cole seu token aqui..."
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '12px'
            }}
          />
          
          <button
            onClick={handleSaveToken}
            disabled={!manualToken}
            style={{
              backgroundColor: manualToken ? '#059669' : '#9ca3af',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: manualToken ? 'pointer' : 'not-allowed',
              fontSize: '16px'
            }}
          >
            Salvar Token
          </button>
          
          {saved && (
            <p style={{ color: '#059669', marginTop: '12px' }}>
              ✓ Token salvo com sucesso!
            </p>
          )}
        </div>
      )}

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h4 style={{ marginBottom: '12px' }}>📱 Próximos Passos</h4>
        <ol style={{ lineHeight: '1.8', color: '#4b5563' }}>
          <li>Obtenha as credenciais OAuth2 corretas do Credere</li>
          <li>Use o gerador de token no painel admin: <a href="/admin" style={{ color: '#1A75FF' }}>/admin</a></li>
          <li>Configure o token gerado nas variáveis de ambiente</li>
          <li>O simulador funcionará automaticamente em todo o site</li>
        </ol>
      </div>
    </div>
  );
}