import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header1 from '../headers/Header1';
import Footer1 from '../footers/Footer1';
import FixedBottomMenu from '../common/FixedBottomMenu';
import FAQAccordion from './FAQAccordion';
import { analytics } from '@/lib/analytics';

const SellCarPage = () => {
  const [formData, setFormData] = useState({
    vehicle: '',
    name: '',
    email: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.vehicle.trim() || !formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setSubmitMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Enviar lead para o sistema admin
      const leadData = {
        nome: formData.name.trim(),
        telefone: formData.phone.trim(),
        email: formData.email.trim(),
        mensagem: `Olá, quero vender meu veículo. Informações do carro: ${formData.vehicle.trim()}`,
        modelo: formData.vehicle.trim(),
        canal: 'Formulário Vender Meu Carro'
      };

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Lead enviado com sucesso:', result);
        
        // Analytics: Track lead generation
        analytics.generateLead('sell_car_form', null, {
          vehicle_description: formData.vehicle.trim(),
          lead_source: 'Vender Meu Carro'
        });
        
        setSubmitMessage('✅ Sua solicitação foi enviada com sucesso! Entraremos em contato em breve.');
        
        // Limpar formulário
        setFormData({
          vehicle: '',
          name: '',
          email: '',
          phone: ''
        });

      } else {
        const errorText = await response.text();
        console.error('Erro HTTP:', response.status, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      console.error('Detalhes do erro:', error.message);
      setSubmitMessage(`❌ Erro ao enviar solicitação: ${error.message}. Tente novamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
      
      <section className="inventory-section pb-0 layout-radius">
        <div className="boxcar-container">
          {/* Breadcrumb integrado igual às outras páginas */}
          <div className="boxcar-title-three">
            <nav id="bc-vender" aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/">Início</Link></li>
                <li className="bc-sep" aria-hidden="true">/</li>
                <li aria-current="page">Vender Meu Carro</li>
              </ol>
            </nav>
            <h2 className="title">
              Vender Meu Carro
            </h2>
          </div>
          
          {/* Hero Section - Compacto */}
          <div className="sell-car-hero" style={{ 
            backgroundColor: 'transparent', 
            padding: '40px 0 30px', 
            color: '#000000'
          }}>
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '15px', color: '#000000' }}>
                  Transforme seu carro em uma boa negociação
                </h1>
                <p style={{ fontSize: '18px', marginBottom: '25px', color: '#666666' }}>
                  Avaliação justa, processo transparente e atendimento especializado.
                </p>
                
                <div className="row justify-content-center">
                  <div className="col-md-4 mb-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fa fa-tachometer" style={{ fontSize: '20px', color: '#ff6b35', marginRight: '12px' }}></i>
                      <span style={{ color: '#000000', fontSize: '14px', fontWeight: '600' }}>
                        Avaliação Imediata
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fa fa-dollar-sign" style={{ fontSize: '20px', color: '#ff6b35', marginRight: '12px' }}></i>
                      <span style={{ color: '#000000', fontSize: '14px', fontWeight: '600' }}>
                        Proposta personalizada
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="fa fa-check-circle" style={{ fontSize: '20px', color: '#ff6b35', marginRight: '12px' }}></i>
                      <span style={{ color: '#000000', fontSize: '14px', fontWeight: '600' }}>
                        Processo transparente
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Section - Compacto */}
          <div style={{ backgroundColor: 'transparent', padding: '40px 0' }}>
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="text-center mb-4">
                  <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '15px', color: '#000000' }}>
                    Informe os dados do seu veículo
                  </h2>
                </div>

                <div className="form-box" style={{ 
                    background: 'white', 
                    padding: '40px', 
                    borderRadius: '12px',
                    boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
                    border: '1px solid #e1e1e1'
                  }}>
                  <form onSubmit={handleSubmit}>
                    <div className="row justify-content-center">
                      <div className="col-12 mb-3">
                        <fieldset className="input-box">
                          <label htmlFor="vehicle">Qual é o seu carro:</label>
                          <input
                            type="text"
                            id="vehicle"
                            name="vehicle"
                            value={formData.vehicle}
                            onChange={handleInputChange}
                            placeholder="Ex: Honda Civic 2018 LX automático"
                            required
                          />
                        </fieldset>
                      </div>
                      
                      <div className="col-12 mb-3">
                        <fieldset className="input-box">
                          <label htmlFor="name">Seu nome:</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Seu nome completo"
                            required
                          />
                        </fieldset>
                      </div>
                      
                      <div className="col-12 mb-3">
                        <fieldset className="input-box">
                          <label htmlFor="email">Seu email:</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="seu@email.com"
                            required
                          />
                        </fieldset>
                      </div>
                      
                      <div className="col-12 mb-4">
                        <fieldset className="input-box">
                          <label htmlFor="phone">Seu telefone/WhatsApp:</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(19) 99999-9999"
                            required
                          />
                        </fieldset>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="tf-btn primary"
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => !isSubmitting && (e.target.style.transform = 'translateY(-1px)')}
                      onMouseLeave={(e) => !isSubmitting && (e.target.style.transform = 'translateY(0)')}
                    >
                      {isSubmitting ? 'Enviando...' : 'Solicitar Avaliação'}
                    </button>
                    
                    {/* Mensagem de feedback */}
                    {submitMessage && (
                      <div className="mt-3 text-center">
                        <p style={{ 
                          fontSize: '14px', 
                          margin: '0',
                          padding: '12px',
                          borderRadius: '6px',
                          backgroundColor: submitMessage.includes('✅') ? '#d4edda' : '#f8d7da',
                          color: submitMessage.includes('✅') ? '#155724' : '#721c24',
                          border: `1px solid ${submitMessage.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
                        }}>
                          {submitMessage}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-center mt-3">
                      <p style={{ fontSize: '14px', color: '#666666', margin: '0' }}>
                        Ou chame no WhatsApp através da barra inferior
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* How it Works Section - Compacto */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '40px 0', borderRadius: '12px', margin: '20px 0' }}>
            <div className="text-center mb-4">
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#000000' }}>
                Como Funciona
              </h2>
            </div>
            
            <div className="row">
              {[
                { number: '1', title: 'Você envia os dados', description: 'Preencha o formulário com as informações do seu carro.' },
                { number: '2', title: 'Avaliação por telefone', description: 'Nossa equipe entra em contato em até 24h.' },
                { number: '3', title: 'Proposta personalizada', description: 'Apresentamos nossa melhor oferta.' },
                { number: '4', title: 'Fechamento', description: 'Agendamos a finalização e documentação.' }
              ].map((step, index) => (
                <div key={index} className="col-lg-3 col-md-6 mb-3">
                  <div className="text-center" style={{
                      background: 'white',
                      padding: '20px 15px',
                      borderRadius: '8px',
                      height: '100%',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      border: '1px solid #e1e1e1'
                    }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '18px', 
                      fontWeight: '600',
                      margin: '0 auto 15px auto'
                    }}>
                      {step.number}
                    </div>
                    <h4 style={{ fontWeight: '600', marginBottom: '10px', fontSize: '16px', color: '#000000' }}>
                      {step.title}
                    </h4>
                    <p style={{ color: '#666', lineHeight: '1.5', fontSize: '14px', margin: '0' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options Section - Compacto */}
          <div style={{ padding: '40px 0' }}>
            <div className="text-center mb-4">
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#000000' }}>
                Conheça Suas Opções
              </h2>
            </div>
            
            <div className="row">
              {[
                {
                  number: '01',
                  title: 'VENDA DIRETA',
                  subtitle: 'Para quem precisa de uma negociação rápida',
                  description: 'Compramos seu veículo e você recebe o valor à vista. Processo simples e direto.'
                },
                {
                  number: '02',
                  title: 'TROCA NA TROCA',
                  subtitle: 'Para quem quer trocar de carro',
                  description: 'Você pode trocar seu veículo por outro de maior ou menor valor. Se for maior, negociamos a diferença. Se for menor, você sai com o dinheiro no bolso.'
                },
                {
                  number: '03',
                  title: 'CONSIGNAÇÃO',
                  subtitle: 'Mais segurança e rentabilidade',
                  description: 'Anunciamos seu veículo em nossos principais portais e showroom. Quando vendido, você recebe o valor à vista.'
                }
              ].map((option, index) => (
                <div key={index} className="col-lg-4 mb-3">
                  <div style={{
                      border: '1px solid #e1e1e1',
                      borderRadius: '8px',
                      padding: '20px',
                      height: '100%',
                      background: 'white'
                    }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ff6b35',
                      marginBottom: '8px'
                    }}>
                      {option.number}
                    </div>
                    <h3 style={{ fontWeight: '600', marginBottom: '6px', fontSize: '16px', color: '#000000' }}>
                      {option.title}
                    </h3>
                    <p style={{ fontWeight: '500', color: '#666', marginBottom: '10px', fontSize: '14px' }}>
                      {option.subtitle}
                    </p>
                    <p style={{ color: '#666', lineHeight: '1.5', fontSize: '14px', margin: '0' }}>
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Section - Compacto */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '40px 0', borderRadius: '12px', margin: '20px 0' }}>
            <div className="text-center mb-4">
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#000000' }}>
                Por Que Escolher a Átria?
              </h2>
            </div>
            
            <div className="row">
              {[
                {
                  icon: '🎯',
                  title: 'Processo Transparente',
                  description: 'Explicamos cada etapa da avaliação e não escondemos critérios de você.'
                },
                {
                  icon: '⚡',
                  title: 'Agilidade no Atendimento',
                  description: 'Pré-avaliação em 24h e processo de compra em poucos dias.'
                },
                {
                  icon: '🤝',
                  title: 'Negociação Justa',
                  description: 'Conhecemos o mercado local e oferecemos valores competitivos.'
                },
                {
                  icon: '📍',
                  title: 'Tradição Regional',
                  description: '3 lojas na região de Campinas. Mais de 13.000 veículos vendidos desde 2014.'
                },
                {
                  icon: '🔧',
                  title: 'Avaliação Técnica',
                  description: 'Nossa equipe especializada avalia todos os aspectos do seu veículo.'
                }
              ].map((item, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-3">
                  <div className="d-flex align-items-start" style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                    <div style={{ 
                      width: '35px', 
                      height: '35px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', 
                      color: 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '16px',
                      marginRight: '12px',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: '600', marginBottom: '6px', fontSize: '14px', color: '#000000' }}>
                        {item.title}
                      </h4>
                      <p style={{ color: '#666', lineHeight: '1.4', margin: '0', fontSize: '13px' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section - Compacto */}
          <div style={{ padding: '40px 0' }}>
            <div className="text-center mb-4">
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px', color: '#000000' }}>
                Depoimentos
              </h2>
              <p style={{ fontSize: '16px', color: '#666' }}>
                "Processo profissional e transparente"
              </p>
            </div>
            
            <div className="row">
              {[
                {
                  name: 'Marcos Oliveira',
                  rating: '⭐⭐⭐⭐⭐ 4.0',
                  vehicle: 'Vendeu um Kia Rio',
                  testimonial: 'Minha experiência vendendo meu carro na Átria foi excelente, desde a avaliação até a negociação final. Seriedade e transparência absolutas.'
                },
                {
                  name: 'Murilo Silva',
                  rating: '⭐⭐⭐⭐⭐ 5.0',
                  vehicle: 'Vendeu um Yaris Toyota',
                  testimonial: 'Muito boa a avaliação e negociação. Preço justo e condições claras desde o início. Altamente recomendado.'
                },
                {
                  name: 'Gabriel Ferreira',
                  rating: '⭐⭐⭐⭐⭐ 4.0',
                  vehicle: 'Vendeu um Volkswagen Jetta',
                  testimonial: 'Atendimento profissional, cuidaram de todo o processo. Explicaram cada detalhe da avaliação e da documentação.'
                }
              ].map((testimonial, index) => (
                <div key={index} className="col-lg-4 mb-3">
                  <div style={{
                      background: '#f8f9fa',
                      padding: '20px',
                      borderRadius: '8px',
                      height: '100%',
                      border: '1px solid #e1e1e1'
                    }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontWeight: '600', fontSize: '16px', color: '#000000' }}>
                        {testimonial.name}
                      </div>
                      <div style={{ color: '#ff6b35', marginBottom: '4px', fontSize: '14px' }}>
                        {testimonial.rating}
                      </div>
                      <div style={{ color: '#666', fontSize: '13px' }}>
                        {testimonial.vehicle}
                      </div>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.5', fontStyle: 'italic', fontSize: '14px', margin: '0' }}>
                      "{testimonial.testimonial}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section - Compacto */}
          <div style={{ backgroundColor: '#f8f9fa', padding: '40px 0', borderRadius: '12px', margin: '20px 0' }}>
            <div className="text-center mb-4">
              <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#000000' }}>
                FAQ - Perguntas Frequentes
              </h2>
            </div>
            
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <FAQAccordion />
              </div>
            </div>
          </div>

          {/* Final CTA Section - Compacto */}
          <div style={{ 
            backgroundColor: 'transparent', 
            padding: '40px 0', 
            color: '#000000'
          }}>
            <div className="text-center">
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px', color: '#000000' }}>
                  Pronto para conhecer o valor do seu carro?
                </h2>
                <p style={{ fontSize: '16px', marginBottom: '25px', color: '#666666' }}>
                  Nossa equipe está preparada para fazer uma avaliação justa e transparente.
                </p>
                
                <div className="row justify-content-center">
                  <div className="col-lg-6">
                    <button
                      onClick={() => {
                        const form = document.querySelector('form');
                        if (form) {
                          setTimeout(() => {
                            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }
                      }}
                      className="tf-btn primary"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      Solicitar Avaliação
                    </button>
                    
                    <div className="text-center mt-3">
                      <p style={{ fontSize: '14px', color: '#666666', margin: '0' }}>
                        Ou chame no WhatsApp através da barra inferior
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
      <FixedBottomMenu />
    </>
  );
};

export default SellCarPage;