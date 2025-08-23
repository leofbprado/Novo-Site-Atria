import React, { useState } from "react";
import { Link } from "react-router-dom";
import FinancingCalculator from "../homes/home-1/FinancingCalculator";

export default function LoanCalculator() {
  const [activeTab, setActiveTab] = useState('escolheu');

  return (
    <>
      <style>{`
        /* Match inventory page structure exactly */
        .financing-page-breadcrumb {
          padding: 0 !important;
          background: transparent !important;
          margin-bottom: 0 !important;
        }
        .financing-page-breadcrumb .boxcar-title-three {
          margin-bottom: 0 !important;
        }
        .financing-page-breadcrumb .boxcar-title-three .breadcrumb {
          margin-bottom: 20px !important;
        }
        .financing-page-breadcrumb .boxcar-title-three .title {
          font-size: 40px !important;
          font-weight: 700 !important;
          color: #1a2332 !important;
          margin: 0 !important;
          line-height: 1.2 !important;
        }
        .financing-content {
          margin-top: 30px !important;
          padding-top: 0 !important;
        }
        
        /* Hide any "Loan Calculator" text that might appear */
        .financing-page-breadcrumb::before,
        .financing-page-breadcrumb *::before,
        .boxcar-title-three::before,
        .boxcar-title-three *::before {
          content: none !important;
          display: none !important;
        }
        
        /* Ensure no gray subtitle text appears */
        .financing-page-breadcrumb .subtitle,
        .financing-page-breadcrumb .sub-title,
        .financing-page-breadcrumb .page-subtitle {
          display: none !important;
        }
        
        .financing-tabs {
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 40px;
        }
        .financing-tabs .tab-button {
          background: none;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }
        .financing-tabs .tab-button.active {
          color: #1A75FF;
          border-bottom-color: #1A75FF;
        }
        .financing-tabs .tab-button:hover {
          color: #1A75FF;
        }
        
        .info-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .info-card h3 {
          color: #1a2332;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 15px;
        }
        .info-card p {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .info-card ul {
          list-style: none;
          padding: 0;
        }
        .info-card ul li {
          color: #64748b;
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
        }
        .info-card ul li:before {
          content: "✓";
          color: #10b981;
          font-weight: bold;
          position: absolute;
          left: 0;
          top: 8px;
        }
        
        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        .partner-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
        }
        .partner-item:hover {
          border-color: #1A75FF;
          box-shadow: 0 4px 12px rgba(26, 117, 255, 0.1);
          transform: translateY(-2px);
        }
        .partner-item img {
          max-width: 100%;
          max-height: 50px;
          object-fit: contain;
          transition: all 0.3s ease;
        }
        .partner-item.text-only {
          font-weight: 600;
          color: #1a2332;
          font-size: 14px;
        }
        
        .faq-item {
          border-bottom: 1px solid #e2e8f0;
          padding: 20px 0;
        }
        .faq-item:last-child {
          border-bottom: none;
        }
        .faq-question {
          font-weight: 600;
          color: #1a2332;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .faq-answer {
          color: #64748b;
          line-height: 1.6;
        }
        
        .cta-button {
          background: linear-gradient(135deg, #1A75FF 0%, #0066FF 100%);
          color: white;
          padding: 15px 30px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 117, 255, 0.3);
          color: white;
          text-decoration: none;
        }
        
        .contact-form {
          background: #f8fafc;
          border-radius: 12px;
          padding: 30px;
          margin-top: 30px;
        }
        .contact-form h4 {
          color: #1a2332;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #1a2332;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1A75FF;
          box-shadow: 0 0 0 3px rgba(26, 117, 255, 0.1);
        }
      `}</style>

      <section className="inventory-section pb-0 layout-radius">
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            <nav id="bc-financiamento" aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/">Início</Link></li>
                <li className="bc-sep" aria-hidden="true">/</li>
                <li aria-current="page">Financiamento</li>
              </ol>
            </nav>
            <h2 className="title">Financiamento de Veículos</h2>
          </div>
          
          {/* Content within the same section like inventory page */}
          <div className="financing-content">
          {/* Hero Section */}
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h3 style={{ fontSize: '28px', color: '#1a2332', marginBottom: '15px' }}>
                Simule condições reais sem comprometer seu CPF
              </h3>
              <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                Entenda como funciona o financiamento de veículos na Átria e descubra a melhor forma de adquirir seu próximo carro com segurança e transparência.
              </p>
            </div>
          </div>

          {/* Tabs para as opções */}
          <div className="financing-tabs">
            <button 
              className={`tab-button ${activeTab === 'escolheu' ? 'active' : ''}`}
              onClick={() => setActiveTab('escolheu')}
            >
              Já escolheu o veículo
            </button>
            <button 
              className={`tab-button ${activeTab === 'busca' ? 'active' : ''}`}
              onClick={() => setActiveTab('busca')}
            >
              Busca por valor de parcela
            </button>
          </div>

          {/* Conteúdo das tabs */}
          {activeTab === 'escolheu' && (
            <div className="row">
              <div className="col-lg-8">
                <div className="info-card">
                  <h3>Opção 1: Já escolheu o veículo</h3>
                  <p>Se você já sabe qual carro deseja, acesse a página do veículo e utilize nosso simulador integrado para condições reais e imediatas.</p>
                  
                  <h4 style={{ color: '#1a2332', fontSize: '18px', marginBottom: '15px', marginTop: '25px' }}>Vantagens:</h4>
                  <ul>
                    <li>Simulação sem consulta ao CPF</li>
                    <li>Condições reais de financiamento</li>
                    <li>Resposta imediata</li>
                    <li>Análise personalizada para o veículo escolhido</li>
                  </ul>
                  
                  <div style={{ marginTop: '30px' }}>
                    <Link to="/estoque" className="cta-button">
                      Ver veículos disponíveis
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="info-card" style={{ background: '#f8fafc' }}>
                  <h4 style={{ color: '#1a2332', fontSize: '18px', marginBottom: '15px' }}>💡 Dica</h4>
                  <p style={{ fontSize: '14px', margin: 0 }}>
                    Navegue pelo nosso estoque e encontre o veículo ideal. Na página do carro, você terá acesso ao simulador com condições exclusivas para aquele modelo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'busca' && (
            <div className="row">
              <div className="col-12">
                <div className="info-card">
                  <h3>Opção 2: Busca por valor de parcela</h3>
                  <p>Não sabe ainda qual carro comprar? Informe o valor da entrada e parcela desejada para conhecer os veículos disponíveis dentro do seu orçamento.</p>
                </div>
                
                {/* Calculadora integrada */}
                <FinancingCalculator />
              </div>
            </div>
          )}



          {/* Como funciona */}
          <div className="row mt-5">
            <div className="col-12">
              <h2 style={{ color: '#1a2332', fontSize: '32px', textAlign: 'center', marginBottom: '50px' }}>
                Como funciona o financiamento de veículos
              </h2>
            </div>
            
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="info-card text-center" style={{ height: '100%' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px', color: '#1A75FF' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h4 style={{ color: '#1a2332', fontSize: '18px', marginBottom: '15px' }}>Análise de crédito</h4>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  Avaliamos sua capacidade de pagamento considerando renda e histórico financeiro.
                </p>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="info-card text-center" style={{ height: '100%' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px', color: '#1A75FF' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <path d="M10 13h4"/>
                    <path d="M10 17h4"/>
                    <path d="M10 9h1"/>
                  </svg>
                </div>
                <h4 style={{ color: '#1a2332', fontSize: '18px', marginBottom: '15px' }}>Documentação</h4>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  RG, CPF, comprovante de renda e residência. Processo simplificado.
                </p>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="info-card text-center" style={{ height: '100%' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px', color: '#1A75FF' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <h4 style={{ color: '#1a2332', fontSize: '18px', marginBottom: '15px' }}>Aprovação</h4>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  Resposta em até 24 horas úteis com condições personalizadas.
                </p>
              </div>
            </div>
            
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="info-card text-center" style={{ height: '100%' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px', color: '#1A75FF' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    <path d="M15 5l4 4"/>
                  </svg>
                </div>
                <h4 style={{ color: '#1a2332', fontSize: '18px', marginBottom: '15px' }}>Assinatura</h4>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  Contrato digital ou presencial, conforme sua preferência.
                </p>
              </div>
            </div>
          </div>

          {/* Parceiros */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="info-card">
                <h3>Nossos parceiros financeiros</h3>
                <p>Trabalhamos com as principais instituições do mercado:</p>
                
                <div className="partners-grid">
                  <div className="partner-item">
                    <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/banks/itau-seeklogo.png" alt="Itaú Unibanco" title="Itaú Unibanco" />
                  </div>
                  <div className="partner-item">
                    <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/banks/banco-santander-seeklogo.png" alt="Banco Santander" title="Banco Santander" />
                  </div>
                  <div className="partner-item">
                    <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/banks/bv-seeklogo.png" alt="Banco BV" title="Banco BV" />
                  </div>
                  <div className="partner-item">
                    <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/banks/bradesco-seeklogo.png" alt="Banco Bradesco" title="Banco Bradesco" />
                  </div>
                  <div className="partner-item">
                    <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/banks/c6-bank-seeklogo.png" alt="C6 Bank" title="C6 Bank" />
                  </div>
                  <div className="partner-item">
                    <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/banks/banco-pan-seeklogo.png" alt="Banco Pan" title="Banco Pan" />
                  </div>
                  <div className="partner-item">
                    <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/banks/banco-safra-seeklogo.png" alt="Banco Safra" title="Banco Safra" />
                  </div>
                  <div className="partner-item text-only">
                    Outras financeiras
                  </div>
                </div>
                
                <p style={{ fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
                  Esta parceria garante as melhores condições e maior chance de aprovação para nossos clientes.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="row mt-5">
            <div className="col-lg-8">
              <div className="info-card">
                <h3>Perguntas frequentes</h3>
                
                <div className="faq-item">
                  <div className="faq-question">Posso financiar sem entrada?</div>
                  <div className="faq-answer">Sim, dependendo da análise de crédito e do veículo escolhido.</div>
                </div>
                
                <div className="faq-item">
                  <div className="faq-question">Aceito meu carro como entrada?</div>
                  <div className="faq-answer">Sim. Fazemos a avaliação e aceitamos como parte do pagamento.</div>
                </div>
                
                <div className="faq-item">
                  <div className="faq-question">O financiamento compromete meu score?</div>
                  <div className="faq-answer">A simulação inicial não afeta seu CPF. Apenas a contratação gera consulta oficial.</div>
                </div>
                
                <div className="faq-item">
                  <div className="faq-question">Qual o prazo máximo de financiamento?</div>
                  <div className="faq-answer">Até 60 meses, dependendo do ano e valor do veículo.</div>
                </div>
                
                <div className="faq-item">
                  <div className="faq-question">Posso antecipar parcelas?</div>
                  <div className="faq-answer">Sim, com desconto dos juros proporcionais.</div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="info-card">
                <h4 style={{ color: '#1a2332', fontSize: '18px', marginBottom: '15px' }}>Documentos necessários</h4>
                
                <h5 style={{ color: '#1a2332', fontSize: '16px', marginBottom: '10px', marginTop: '20px' }}>Pessoa Física:</h5>
                <ul style={{ fontSize: '14px' }}>
                  <li>RG e CPF</li>
                  <li>Comprovante de renda (3 últimos)</li>
                  <li>Comprovante de residência atualizado</li>
                </ul>
                
                <h5 style={{ color: '#1a2332', fontSize: '16px', marginBottom: '10px', marginTop: '20px' }}>Pessoa Jurídica:</h5>
                <ul style={{ fontSize: '14px' }}>
                  <li>CNPJ e contrato social</li>
                  <li>Últimas declarações de IR</li>
                  <li>Extratos bancários (3 meses)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="row mt-5">
            <div className="col-lg-8">
              <div className="info-card">
                <h3>Dúvidas sobre financiamento?</h3>
                <p>Nossa equipe especializada está pronta para esclarecer todas as suas questões sobre financiamento de veículos.</p>
                
                <div style={{ marginBottom: '20px' }}>
                  <a 
                    href="https://wa.me/5519996525211?text=Olá, tenho dúvidas sobre financiamento de veículos" 
                    className="cta-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Falar com especialista - WhatsApp
                  </a>
                </div>

                <div className="contact-form">
                  <h4>Ou preencha o formulário que entraremos em contato:</h4>
                  <form>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Nome completo</label>
                          <input type="text" placeholder="Seu nome completo" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>WhatsApp</label>
                          <input type="tel" placeholder="(11) 99999-9999" />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label>E-mail</label>
                          <input type="email" placeholder="seu@email.com" />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label>Mensagem (opcional)</label>
                          <textarea rows="3" placeholder="Conte-nos sobre suas dúvidas..."></textarea>
                        </div>
                      </div>
                      <div className="col-12">
                        <button type="submit" className="cta-button">
                          Enviar mensagem
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="info-card text-center" style={{ background: '#f0f7ff' }}>
                <h4 style={{ color: '#1a2332', fontSize: '18px', marginBottom: '15px' }}>Átria Veículos</h4>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#1A75FF', margin: '10px 0' }}>
                  +13.000
                </p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  veículos vendidos desde 2014
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
    </>
  );
}