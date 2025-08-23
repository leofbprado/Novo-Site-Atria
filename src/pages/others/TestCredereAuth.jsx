import React, { useState } from 'react';
import { testCredereCredentials } from '../../utils/credereAuth';

export default function TestCredereAuth() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    setLogs([]);
    
    // Usando as credenciais fornecidas
    const clientId = 'leo@atriaveiculos.com.br';
    const clientSecret = 'Atria2025';
    
    // Captura logs do console
    const originalLog = console.log;
    const originalError = console.error;
    const capturedLogs = [];
    
    console.log = (...args) => {
      originalLog(...args);
      capturedLogs.push({ type: 'log', message: args.join(' ') });
    };
    
    console.error = (...args) => {
      originalError(...args);
      capturedLogs.push({ type: 'error', message: args.join(' ') });
    };
    
    const testResult = await testCredereCredentials(clientId, clientSecret);
    
    // Restaura console
    console.log = originalLog;
    console.error = originalError;
    
    setLogs(capturedLogs);
    setResult(testResult);
    setTesting(false);
    
    if (testResult.success) {
      console.log('Token gerado:', testResult.token);
      // Salvar em localStorage temporariamente
      localStorage.setItem('credere_temp_token', testResult.token);
    }
  };
  
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Teste de Autenticação Credere</h2>
      
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p><strong>Client ID:</strong> leo@atriaveiculos.com.br</p>
        <p><strong>Client Secret:</strong> Atria2025</p>
      </div>
      
      <button
        onClick={handleTest}
        disabled={testing}
        style={{
          backgroundColor: '#1A75FF',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          cursor: testing ? 'not-allowed' : 'pointer',
          opacity: testing ? 0.7 : 1
        }}
      >
        {testing ? 'Testando...' : 'Testar Credenciais'}
      </button>
      
      {logs.length > 0 && (
        <div style={{
          marginTop: '20px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
            Log de Autenticação:
          </h3>
          <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {logs.map((log, index) => (
              <div 
                key={index} 
                style={{ 
                  color: log.type === 'error' ? '#dc2626' : '#374151',
                  padding: '4px 0'
                }}
              >
                {log.type === 'error' ? '❌' : '📝'} {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {result && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: result.success ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${result.success ? '#86efac' : '#fecaca'}`
        }}>
          {result.success ? (
            <>
              <p style={{ color: '#166534', fontWeight: 'bold' }}>✓ Autenticação bem-sucedida!</p>
              <p style={{ color: '#15803d', marginTop: '8px' }}>
                Token gerado com sucesso. O simulador Credere está pronto para uso.
              </p>
              <p style={{ color: '#166534', marginTop: '12px', fontSize: '14px' }}>
                O token foi salvo temporariamente. Você pode testar o simulador agora.
              </p>
            </>
          ) : (
            <>
              <p style={{ color: '#991b1b', fontWeight: 'bold' }}>✗ Falha na autenticação</p>
              <p style={{ color: '#dc2626', marginTop: '12px' }}>
                Suas credenciais de login (leo@atriaveiculos.com.br) estão sendo bloqueadas pela API.
              </p>
              
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '6px',
                padding: '12px',
                marginTop: '16px'
              }}>
                <p style={{ color: '#92400e', fontWeight: 'bold', marginBottom: '8px' }}>
                  Como obter as credenciais corretas:
                </p>
                <ol style={{ marginLeft: '20px', color: '#78350f', lineHeight: '1.6' }}>
                  <li>Entre no painel do Credere com seu login</li>
                  <li>Procure por "Configurações", "API" ou "Integrações"</li>
                  <li>Gere ou copie seu Client ID e Client Secret</li>
                  <li>Ou entre em contato com o suporte do Credere</li>
                </ol>
              </div>
              
              <p style={{ color: '#7f1d1d', marginTop: '16px', fontSize: '13px' }}>
                <strong>Nota:</strong> As credenciais OAuth2 são diferentes do seu login. 
                Elas parecem códigos longos, ex: "abc123def456..."
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}