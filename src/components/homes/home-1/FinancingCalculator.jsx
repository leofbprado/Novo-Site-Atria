import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FinancingCalculator = () => {
  // Estados para as 3 etapas
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [progressWidth, setProgressWidth] = useState(0);

  // Estados da calculadora (Etapa 1)
  const [monthlyPayment, setMonthlyPayment] = useState(1200);
  const [downPayment, setDownPayment] = useState(15000);
  const [installments, setInstallments] = useState(48);
  const [category, setCategory] = useState('hatch');

  // Estados do formulário (Etapa 2)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Estados do resultado (Etapa 3)
  const [calculatedRange, setCalculatedRange] = useState({ min: 0, max: 0 });

  // Coeficientes de financiamento
  const coefficients = {
    24: 0.055,
    36: 0.048,
    48: 0.042,
    60: 0.039
  };

  // Categorias de veículos
  const categories = [
    { id: 'hatch', name: 'Hatch' },
    { id: 'sedan', name: 'Sedan' },
    { id: 'suv', name: 'SUV' },
    { id: 'pickup', name: 'Pick-up' }
  ];

  // Textos de loading
  const loadingTexts = [
    'Analisando suas preferências',
    'Consultando estoque disponível',
    'Calculando melhores condições'
  ];

  // Formatação do WhatsApp
  const formatWhatsApp = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // Validação do formulário
  const validateForm = () => {
    const errors = {};
    
    // Validar nome (mínimo 2 palavras)
    if (!name.trim()) {
      errors.name = "Nome é obrigatório";
    } else if (name.trim().split(' ').length < 2) {
      errors.name = "Digite nome completo (mínimo 2 palavras)";
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
      errors.name = "Nome deve conter apenas letras e espaços";
    }
    
    // Validar email
    if (!email.trim()) {
      errors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "E-mail inválido";
    }
    
    // Validar WhatsApp
    const whatsappRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!whatsapp.trim()) {
      errors.whatsapp = "WhatsApp é obrigatório";
    } else if (!whatsappRegex.test(whatsapp)) {
      errors.whatsapp = "Formato: (11) 99999-9999";
    }
    
    return errors;
  };

  // Cálculo do valor do carro
  const calculateCarValue = () => {
    const coeff = coefficients[installments];
    const financedValue = monthlyPayment / coeff;
    const totalValue = financedValue + downPayment;
    const margin = totalValue * 0.06;
    
    return {
      min: Math.max(totalValue - margin, 0),
      max: totalValue + margin
    };
  };

  // Animação de loading
  useEffect(() => {
    if (isLoading) {
      let textIndex = 0;
      let progress = 0;
      
      const textInterval = setInterval(() => {
        setLoadingText(loadingTexts[textIndex]);
        textIndex = (textIndex + 1) % loadingTexts.length;
      }, 800);

      const progressInterval = setInterval(() => {
        progress += 2;
        setProgressWidth(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          
          // Calcular resultado e ir para etapa 2
          setTimeout(() => {
            setIsLoading(false);
            setCurrentStep(2);
          }, 500);
        }
      }, 50);

      return () => {
        clearInterval(textInterval);
        clearInterval(progressInterval);
      };
    }
  }, [isLoading]);

  // Handlers
  const handleSearchCars = () => {
    setIsLoading(true);
    setProgressWidth(0);
  };

  const handleWhatsAppChange = (e) => {
    const formatted = formatWhatsApp(e.target.value);
    setWhatsapp(formatted);
  };

  const handleSubmitForm = async () => {
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      try {
        // Preparar dados do lead
        const leadData = {
          nome: name.trim(),
          telefone: whatsapp.trim(),
          email: email.trim() || '',
          mensagem: `Interesse em financiamento - Categoria: ${categories.find(c => c.id === category)?.name || 'N/A'}, Valor mensal: R$ ${monthlyPayment.toLocaleString()}, Entrada: R$ ${downPayment.toLocaleString()}, Parcelas: ${installments}x`,
          modelo: `Financiamento - ${categories.find(c => c.id === category)?.name || 'Categoria não especificada'}`,
          canal: 'Calculadora de Financiamento'
        };

        // Enviar para o endpoint de leads
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(leadData)
        });

        if (response.ok) {
          console.log('Lead de financiamento enviado com sucesso');
          
          // Continuar com o fluxo normal
          const range = calculateCarValue();
          setCalculatedRange(range);
          setCurrentStep(3);
        } else {
          console.error('Erro ao enviar lead de financiamento');
          // Mesmo assim, continuar com o fluxo para não interromper a experiência
          const range = calculateCarValue();
          setCalculatedRange(range);
          setCurrentStep(3);
        }
        
      } catch (error) {
        console.error('Erro na requisição de lead:', error);
        // Mesmo assim, continuar com o fluxo para não interromper a experiência
        const range = calculateCarValue();
        setCalculatedRange(range);
        setCurrentStep(3);
      }
    }
  };

  const handleNewSearch = () => {
    setCurrentStep(1);
    setName('');
    setEmail('');
    setWhatsapp('');
    setFormErrors({});
  };

  // Renderização das etapas
  const renderStep1 = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: '"DM Sans", sans-serif' }}>
      <h2 style={{ 
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '15px',
        lineHeight: '1.2',
        fontFamily: '"DM Sans", sans-serif'
      }}>
        Encontre carros na sua faixa de investimento
      </h2>
      <p style={{ 
        fontSize: '1.1rem',
        color: '#6b7280',
        marginBottom: '40px',
        fontFamily: '"DM Sans", sans-serif'
      }}>
        Configure suas preferências e descubra as melhores opções
      </p>

      {/* Investimento Mensal */}
      <div style={{ marginBottom: '35px' }}>
        <label style={{ 
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '15px',
          fontFamily: '"DM Sans", sans-serif'
        }}>
          Investimento mensal desejado
        </label>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="range"
            min="500"
            max="3000"
            step="50"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2563eb',
            marginTop: '10px',
            fontFamily: '"DM Sans", sans-serif'
          }}>
            R$ {monthlyPayment.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Entrada Disponível */}
      <div style={{ marginBottom: '35px' }}>
        <label style={{ 
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '15px'
        }}>
          Entrada disponível
        </label>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <input
            type="range"
            min="0"
            max="80000"
            step="1000"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#10b981',
            marginTop: '10px'
          }}>
            R$ {downPayment.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Prazo Desejado */}
      <div style={{ marginBottom: '35px' }}>
        <label style={{ 
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '15px'
        }}>
          Prazo desejado
        </label>
        <div style={{ 
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {[24, 36, 48, 60].map(months => (
            <button
              key={months}
              onClick={() => setInstallments(months)}
              style={{
                padding: '12px 20px',
                border: installments === months ? '2px solid #2563eb' : '2px solid #e2e8f0',
                borderRadius: '8px',
                background: installments === months ? '#2563eb' : 'white',
                color: installments === months ? 'white' : '#6b7280',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '60px'
              }}
            >
              {months}x
            </button>
          ))}
        </div>
      </div>

      {/* Categoria de Interesse */}
      <div style={{ marginBottom: '40px' }}>
        <label style={{ 
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '15px'
        }}>
          Categoria de interesse
        </label>
        <div style={{ 
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'nowrap',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                padding: '12px 16px',
                border: category === cat.id ? '2px solid #2563eb' : '2px solid #e2e8f0',
                borderRadius: '8px',
                background: category === cat.id ? '#2563eb' : 'white',
                color: category === cat.id ? 'white' : '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: '1',
                textAlign: 'center',
                minWidth: '0',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Botão Principal */}
      <button
        onClick={handleSearchCars}
        style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '18px 40px',
          fontSize: '18px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Buscar carros na minha faixa
      </button>
    </div>
  );

  const renderLoading = () => (
    <div style={{ textAlign: 'center', padding: '60px 20px', fontFamily: '"DM Sans", sans-serif' }}>
      <h2 style={{ 
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '40px',
        fontFamily: '"DM Sans", sans-serif'
      }}>
        Selecionando carros para seu perfil
      </h2>
      
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          fontSize: '18px',
          color: '#6b7280',
          marginBottom: '20px',
          minHeight: '22px'
        }}>
          {loadingText}
        </div>
        
        <div style={{
          width: '100%',
          maxWidth: '400px',
          height: '8px',
          background: '#e2e8f0',
          borderRadius: '4px',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: '#2563eb',
            width: `${progressWidth}%`,
            transition: 'width 0.1s ease',
            borderRadius: '4px'
          }} />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: '"DM Sans", sans-serif' }}>
      <h2 style={{ 
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '15px',
        fontFamily: '"DM Sans", sans-serif'
      }}>
        Para ver os carros selecionados para você
      </h2>
      
      <div style={{ 
        maxWidth: '400px',
        margin: '0 auto',
        textAlign: 'left'
      }}>
        {/* Nome */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="user-name" style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '5px'
          }}>
            Nome completo
          </label>
          <input
            id="user-name"
            name="userName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome completo"
            autoComplete="name"
            style={{
              width: '100%',
              padding: '12px',
              border: formErrors.name ? '2px solid #ef4444' : '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          {formErrors.name && (
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
              {formErrors.name}
            </div>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="user-email" style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '5px'
          }}>
            E-mail
          </label>
          <input
            id="user-email"
            name="userEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            style={{
              width: '100%',
              padding: '12px',
              border: formErrors.email ? '2px solid #ef4444' : '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          {formErrors.email && (
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
              {formErrors.email}
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div style={{ marginBottom: '30px' }}>
          <label htmlFor="user-whatsapp" style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '5px'
          }}>
            WhatsApp
          </label>
          <input
            id="user-whatsapp"
            name="userWhatsapp"
            type="tel"
            value={whatsapp}
            onChange={handleWhatsAppChange}
            placeholder="(11) 99999-9999"
            maxLength="15"
            autoComplete="tel"
            style={{
              width: '100%',
              padding: '12px',
              border: formErrors.whatsapp ? '2px solid #ef4444' : '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          {formErrors.whatsapp && (
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
              {formErrors.whatsapp}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmitForm}
          style={{
            width: '100%',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '15px'
          }}
        >
          Ver meus carros selecionados
        </button>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
          Resultado personalizado em 5 segundos
        </div>

        <div style={{ 
          fontSize: '10px', 
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: '1.3',
          padding: '10px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px'
        }}>
          Ao fornecer seus dados, você concorda com nossa política de privacidade e autoriza o contato para apresentação de ofertas personalizadas. Seus dados são protegidos conforme a LGPD.
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: '"DM Sans", sans-serif' }}>
      <h2 style={{ 
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '20px',
        fontFamily: '"DM Sans", sans-serif'
      }}>
        Carros selecionados para {name.split(' ')[0]}
      </h2>
      
      <div style={{
        background: '#f0f9ff',
        border: '2px solid #2563eb',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        maxWidth: '500px',
        margin: '0 auto 30px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '10px' }}>
            Faixa de investimento ideal:
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
            R$ {calculatedRange.min.toLocaleString('pt-BR')} a R$ {calculatedRange.max.toLocaleString('pt-BR')}
          </div>
        </div>

        <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>
          Com suas preferências:
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
          • Parcela mensal: R$ {monthlyPayment.toLocaleString('pt-BR')}<br/>
          • Entrada: R$ {downPayment.toLocaleString('pt-BR')}<br/>
          • Prazo: {installments} meses<br/>
          • Categoria: {categories.find(c => c.id === category)?.name}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '15px' }}>
          Alguns veículos disponíveis nesta faixa:
        </div>
        <div style={{ color: '#1e293b', fontWeight: '500' }}>
          • Honda Civic 2022 - R$ {(calculatedRange.min + 5000).toLocaleString('pt-BR')}<br/>
          • Toyota Corolla 2021 - R$ {(calculatedRange.min + 8000).toLocaleString('pt-BR')}<br/>
          • Chevrolet Onix 2023 - R$ {(calculatedRange.min + 3000).toLocaleString('pt-BR')}
        </div>
      </div>

      <button
        onClick={handleNewSearch}
        style={{
          background: '#e2e8f0',
          color: '#1e293b',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Fazer nova busca
      </button>

      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280',
        marginTop: '20px',
        lineHeight: '1.5'
      }}>
        Nossa equipe entrará em contato em até 2 horas para apresentar opções personalizadas.
      </div>

      <div style={{ 
        fontSize: '11px', 
        color: '#6b7280',
        marginTop: '25px',
        padding: '15px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        lineHeight: '1.4',
        textAlign: 'left'
      }}>
        <strong>Disclaimer:</strong> Os valores apresentados são simulações aproximadas e podem variar conforme análise de crédito, documentação e condições específicas do financiamento. Sujeito à aprovação do banco/financeira. Taxa de juros, prazos e condições finais serão definidos pela instituição financeira. Consulte sempre um consultor especializado para informações precisas sobre financiamento automotivo.
      </div>
    </div>
  );

  return (
    <section 
      className="financing-calculator"
      style={{ 
        backgroundColor: '#101a29',
        padding: '120px 0',
        position: 'relative',
        minHeight: '80vh',
        fontFamily: '"DM Sans", sans-serif'
      }}>
      <div className="boxcar-container">
        <div className="row g-0" style={{ display: 'flex', alignItems: 'stretch' }}>
          {/* image-column */}
          <div className="image-column col-lg-6 col-md-6 col-sm-12" style={{ display: 'flex' }}>
            <div className="inner-column" style={{ 
              display: 'flex',
              width: '100%'
            }}>
              <div className="image-box" style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1a2332',
                borderRadius: '16px 0 0 16px',
                width: '100%',
                overflow: 'hidden'
              }}>
                <figure className="image" style={{ margin: 0, width: '100%', height: '100%' }}>
                  <img height="572" width="382" fetchpriority="low" decoding="async" loading="lazy" alt="Calculadora de Financiamento" src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_382/v1754490506/freepik__upload__92106_xcwzfu.jpg" srcSet="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_382/v1754490506/freepik__upload__92106_xcwzfu.jpg 382w, https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_764/v1754490506/freepik__upload__92106_xcwzfu.jpg 764w" sizes="(max-width: 420px) 90vw, 382px" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px 0 0 16px' }} onLoad={() => console.log('✅ Imagem carregada com sucesso:', 'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_382/v1754490506/freepik__upload__92106_xcwzfu.jpg')}
                    onError={(e) => console.error('❌ Erro ao carregar imagem:', e.target.src)}
                  />
                </figure>
              </div>
            </div>
          </div>
          
          {/* content-column */}
          <div className="content-column col-lg-6 col-md-6 col-sm-12" style={{ display: 'flex' }}>
            <div className="inner-column" style={{ 
              background: 'white',
              borderRadius: '0 16px 16px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              width: '100%'
            }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%' }}
                >
                  {isLoading ? renderLoading() : 
                   currentStep === 1 ? renderStep1() :
                   currentStep === 2 ? renderStep2() :
                   renderStep3()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
};

export default FinancingCalculator;