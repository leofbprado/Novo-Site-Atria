import React from 'react';
import CredereEmbed from '../../components/financing/CredereEmbed';
import Header1 from "../../components/headers/Header1";
import Footer1 from "../../components/footers/Footer1";

export default function CredereTest() {
  const handleProposalCreated = (data) => {
    console.log('Proposta criada com sucesso:', data);
  };

  // Verifica se o token está configurado
  const hasToken = !!(import.meta.env.VITE_REACT_APP_CREDERE_TOKEN);

  return (
    <>
      <Header1 />
      <main className="boxcar-content">
        <section className="inventory-section pb-5 layout-radius">
          <div className="boxcar-container">
            {/* Breadcrumb */}
            <div className="boxcar-title-three" style={{ marginBottom: '12px' }}>
              <ul className="breadcrumb">
                <li><a href="/">Home</a></li>
                <li className="active">Teste Credere</li>
              </ul>
            </div>

            {/* Título da Página */}
            <h2 className="title" style={{ marginBottom: '36px' }}>
              Teste do Simulador Credere
            </h2>

            {/* Instruções */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '12px'
              }}>
                📝 Instruções para Configuração
              </h4>
              <ol style={{
                fontSize: '14px',
                color: '#075985',
                paddingLeft: '20px'
              }}>
                <li style={{ marginBottom: '8px' }}>
                  Certifique-se de ter o token REACT_APP_CREDERE_TOKEN configurado nas variáveis de ambiente
                </li>
                <li style={{ marginBottom: '8px' }}>
                  O token pode ser gerado através do painel administrativo na aba "Token Credere"
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Use o Client ID e Client Secret fornecidos pelo Credere
                </li>
                <li>
                  O simulador aparecerá abaixo quando o token estiver configurado corretamente
                </li>
              </ol>
            </div>

            {/* Status do Token */}
            <div style={{
              backgroundColor: hasToken ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${hasToken ? '#86efac' : '#fecaca'}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>
                {hasToken ? '✅' : '❌'}
              </span>
              <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: hasToken ? '#166534' : '#991b1b',
                  margin: 0
                }}>
                  Status do Token: {hasToken ? 'Configurado' : 'Não Configurado'}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: hasToken ? '#15803d' : '#dc2626',
                  margin: '4px 0 0 0'
                }}>
                  {hasToken 
                    ? 'O token está configurado e pronto para uso' 
                    : 'Configure o token REACT_APP_CREDERE_TOKEN para usar o simulador'}
                </p>
              </div>
            </div>

            {/* Embed do Credere */}
            <CredereEmbed 
              onProposalCreated={handleProposalCreated}
            />
          </div>
        </section>
      </main>
      <Footer1 />
    </>
  );
}