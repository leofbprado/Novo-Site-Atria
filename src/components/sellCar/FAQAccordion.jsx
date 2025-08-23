import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const faqData = [
    {
      question: "Como posso vender meu carro para a Átria?",
      answer: "Preencha o formulário acima descrevendo seu carro. Nossa equipe faz uma avaliação completa por telefone em até 24h e apresenta uma proposta. Se aceitar, agendamos a finalização."
    },
    {
      question: "Vocês compram qualquer tipo de carro?",
      answer: "Avaliamos veículos de todas as marcas e anos. Nossa especialidade são carros de 2010 em diante, mas analisamos cada caso individualmente."
    },
    {
      question: "Posso usar meu carro como entrada para outro veículo?",
      answer: "Sim! Sua avaliação pode ser usada como entrada para qualquer veículo do nosso estoque, ou você pode receber o valor da venda."
    },
    {
      question: "Como vocês fazem a avaliação do meu carro?",
      answer: "Nossos especialistas fazem uma avaliação detalhada por telefone baseada nas informações que você fornecer. Consideramos estado geral, quilometragem, histórico de manutenção, tabela FIPE e demanda de mercado."
    },
    {
      question: "Quanto tempo demora o processo de venda?",
      answer: "Aceita nossa proposta? O pagamento é feito na hora da finalização."
    },
    {
      question: "Preciso levar meu carro até vocês?",
      answer: "Nossa avaliação inicial é feita por telefone. Para finalizar a venda, sim, é importante que nossa equipe veja o veículo pessoalmente para confirmar as condições e fazer a documentação."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  return (
    <div className="faq-accordion">
      {faqData.map((item, index) => (
        <div key={index} className="accordion-item" style={{ marginBottom: '16px' }}>
          <button
            className="accordion-header"
            onClick={() => toggleAccordion(index)}
            aria-expanded={activeIndex === index}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              backgroundColor: 'white',
              border: '2px solid #e1e5e9',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1a2332',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#ff6b35';
              e.target.style.backgroundColor = '#fff8f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e1e5e9';
              e.target.style.backgroundColor = 'white';
            }}
          >
            <span>{item.question}</span>
            <span 
              style={{ 
                fontSize: '24px', 
                fontWeight: '400',
                color: '#ff6b35',
                transition: 'transform 0.3s ease'
              }}
            >
              {activeIndex === index ? '−' : '+'}
            </span>
          </button>
          
          <AnimatePresence>
            {activeIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div 
                  className="accordion-content"
                  style={{
                    padding: '20px 24px',
                    backgroundColor: '#f8f9fa',
                    borderLeft: '2px solid #e1e5e9',
                    borderRight: '2px solid #e1e5e9',
                    borderBottom: '2px solid #e1e5e9',
                    borderTop: 'none',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    marginTop: '-2px'
                  }}
                >
                  <p style={{ 
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#666',
                    margin: '0'
                  }}>
                    {item.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;