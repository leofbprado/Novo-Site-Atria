import React from "react";

export default function Features2() {
  const features = [
    {
      title: "Conteúdo Exclusivo",
      description: "Oportunidades que você não encontra no estoque normal",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#405FF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      title: "Ofertas Relâmpago",
      description: "7 dias de validade - viu, gostou, garantiu!",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#405FF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      )
    },
    {
      title: "Tour Virtual",
      description: "Conheça o carro em detalhes sem sair de casa",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#405FF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )
    },
    {
      title: "Preço de Lançamento",
      description: "Desconto especial para quem vem pelo vídeo",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#405FF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
      )
    }
  ];

  return (
    <section 
      style={{
        padding: '42px 0',
        backgroundColor: '#fff',
        position: 'relative'
      }}
    >
      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 15px'
        }}
      >
        <div 
          style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}
        >
          <h2 
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1a2332',
              margin: '0',
              lineHeight: '1.2'
            }}
          >
            O que tem nos vídeos?
          </h2>
        </div>
        
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            alignItems: 'stretch'
          }}
        >
          {features.map((feature, index) => (
            <div 
              key={index}
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div 
                style={{
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {feature.icon}
              </div>
              <h6 
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a2332',
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}
              >
                {feature.title}
              </h6>
              <div 
                style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.5'
                }}
              >
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}