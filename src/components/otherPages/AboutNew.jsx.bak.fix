import "../../styles/overrides.css";
import React from "react";
import { Link } from "react-router-dom";

const AboutNew = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="inventory-section pb-0 layout-radius">
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            <nav id="bc-sobre" aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/">Início</Link></li>
                <li className="bc-sep" aria-hidden="true">/</li>
                <li aria-current="page">Sobre a Átria</li>
              </ol>
            </nav>
            <h2 className="title">Sobre a Átria Veículos</h2>
          </div>
        </div>
      </section>
      <style>{`
        .about-section-main {
          position: relative;
          padding: 40px 0 80px 0;
          background: #fff;
        }
        
        .about-section-main.layout-radius {
          border-bottom-left-radius: 80px !important;
          border-bottom-right-radius: 80px !important;
          overflow: visible !important;
          position: relative !important;
          margin-bottom: 0 !important;
        }
        
        /* Breadcrumb e título */
        .about-section-main .boxcar-title {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .about-section-main .breadcrumb {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          list-style: none;
          padding: 0;
          margin: 0 0 20px 0;
        }
        
        .about-section-main .breadcrumb li {
          font-size: 15px;
          color: #666;
        }
        
        .about-section-main .breadcrumb li a {
          color: #666;
          text-decoration: none;
          transition: color 0.3s;
        }
        
        .about-section-main .breadcrumb li a:hover {
          color: #1A75FF;
        }
        
        .about-section-main .breadcrumb li span {
          color: #1A75FF;
          font-weight: 500;
        }
        
        .about-section-main .boxcar-title h2 {
          font-size: 48px;
          font-weight: 700;
          color: #1a2332;
          margin-bottom: 20px;
        }
        
        .about-section-main .lead-text {
          font-size: 20px;
          color: #666;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
        }
        
        /* Content box padrão */
        .about-content-box {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 60px;
          margin-bottom: 40px;
        }
        
        .about-content-box h3 {
          font-size: 32px;
          font-weight: 700;
          color: #1a2332;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .about-content-box .text {
          font-size: 16px;
          line-height: 1.8;
          color: #666;
          margin-bottom: 20px;
        }
        
        /* Values Grid */
        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }
        
        .value-card {
          background: #fff;
          text-align: center;
          padding: 40px 30px;
          border-radius: 16px;
          border: 1px solid #e1e1e1;
          transition: all 0.3s ease;
        }
        
        .value-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border-color: #1A75FF;
        }
        
        .value-card h4 {
          color: #1A75FF;
          font-size: 24px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .value-card p {
          color: #666;
          line-height: 1.6;
          font-size: 15px;
        }
        
        /* Stores Grid */
        .stores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }
        
        .store-card {
          background: #fff;
          padding: 40px;
          border-radius: 16px;
          border: 1px solid #e1e1e1;
          transition: all 0.3s ease;
        }
        
        .store-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border-color: #1A75FF;
        }
        
        .store-card h4 {
          color: #1A75FF;
          font-size: 22px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .store-photo {
          width: 100%;
          height: 200px;
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .store-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .store-card:hover .store-photo img {
          transform: scale(1.05);
        }
        
        .store-info {
          margin-bottom: 15px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #666;
          font-size: 15px;
        }
        
        .store-info i {
          color: #1A75FF;
          margin-top: 3px;
          font-size: 16px;
        }
        
        .store-info a {
          color: #666;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .store-info a:hover {
          color: #1A75FF;
          text-decoration: underline;
        }
        
        /* Stats Section - padrão do site */
        .stats-box {
          background: #1a2332;
          color: white;
          padding: 60px;
          border-radius: 16px;
          text-align: center;
          margin-top: 40px;
        }
        
        .stats-box h3 {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 40px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
        }
        
        .stat-item h4 {
          font-size: 48px;
          font-weight: 700;
          color: #1A75FF;
          margin-bottom: 10px;
        }
        
        .stat-item p {
          font-size: 18px;
          color: #fff;
          opacity: 0.9;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .about-section-main {
            padding: 80px 0 60px 0;
          }
          
          .about-section-main .boxcar-title h2 {
            font-size: 36px;
          }
          
          .about-content-box {
            padding: 40px 30px;
          }
          
          .about-content-box h3 {
            font-size: 28px;
          }
          
          .value-card {
            padding: 30px 20px;
          }
          
          .store-card {
            padding: 30px;
          }
          
          .stats-box {
            padding: 40px 30px;
          }
          
          .stat-item h4 {
            font-size: 40px;
          }
        }
      `}</style>
      
      {/* Hero padronizado com breadcrumb e título */}
        breadcrumbId="bc-sobre"
        breadcrumbItems={[{ text: "Sobre a Átria" }]}
        title="Sobre a Átria Veículos"
        className="page-hero-section"
      />
      
      <section className="about-section-main pb-0">
        <div className="boxcar-container">
          <div className="boxcar-title wow fadeInUp" style={{ textAlign: 'left', paddingTop: '20px' }}>
            <p className="lead-text" style={{ textAlign: 'left', margin: '0' }}>
              Desde 2014, a Átria Veículos transforma sonhos em realidade sobre rodas
            </p>
          </div>

          {/* História e Visão */}
          <div className="about-content-box wow fadeInUp">
            <h3>Nossa História</h3>
            <div className="text">
              Desde 2014, a Átria Veículos tem sido sinônimo de confiança e qualidade no mercado de veículos seminovos. Com lojas estrategicamente localizadas em Campinas e região, atendemos a toda região metropolitana com excelência e dedicação.
            </div>
            <div className="text">
              Nossa trajetória é marcada pela busca constante pela satisfação do cliente, oferecendo não apenas veículos de qualidade, mas uma experiência completa de compra que inclui financiamento facilitado, garantia estendida e atendimento personalizado.
            </div>
            <div className="text">
              Ao longo desses anos, construímos relacionamentos duradouros com nossos clientes, baseados na transparência, honestidade e compromisso com a qualidade. Cada veículo em nosso estoque passa por rigorosa inspeção técnica, garantindo segurança e tranquilidade na sua compra.
            </div>
          </div>

          {/* Missão, Visão e Valores */}
          <div className="about-content-box wow fadeInUp">
            <h3>Nossos Valores</h3>
            <div className="values-grid">
              <div className="value-card">
                <h4>Missão</h4>
                <p>
                  Proporcionar a melhor experiência de compra de veículos seminovos, com atendimento diferenciado, transparência nas negociações e soluções personalizadas para cada cliente.
                </p>
              </div>
              <div className="value-card">
                <h4>Visão</h4>
                <p>
                  Ser reconhecida como a concessionária de seminovos mais confiável e inovadora da região metropolitana de Campinas, referência em qualidade e atendimento ao cliente.
                </p>
              </div>
              <div className="value-card">
                <h4>Valores</h4>
                <p>
                  Transparência, ética, respeito ao cliente, qualidade em produtos e serviços, inovação constante e responsabilidade social e ambiental.
                </p>
              </div>
            </div>
          </div>

          {/* Nossas Lojas */}
          <div className="about-content-box wow fadeInUp">
            <h3>Nossas Lojas</h3>
            <div className="stores-grid">
              <div className="store-card">
                <h4>Loja Abolição</h4>
                <div className="store-photo">
                  <img height="300" width="400" fetchpriority="low" decoding="async" loading="lazy" src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2" alt="Loja Abolição - Átria Veículos" />
                </div>
                <div className="store-info">
                  <i className="fa fa-map-marker-alt"></i>
                  <a href="https://maps.google.com/maps?q=Rua+Abolição+1500+Campinas+SP" target="_blank" rel="noopener noreferrer">
                    Rua Abolição Nº 1500 - VL Joaquim Inacio<br/>Campinas-SP - CEP: 13045-750
                  </a>
                </div>
                <div className="store-info">
                  <i className="fa fa-phone"></i>
                  <a href="tel:+551931992552">(19) 3199-2552</a>
                </div>

                <div className="store-info">
                  <i className="fa fa-clock"></i>
                  <span>Segunda a Sexta: 8h às 18h<br/>Sábado: 8h às 14h</span>
                </div>
              </div>
              
              <div className="store-card">
                <h4>Loja Campos Elíseos</h4>
                <div className="store-photo">
                  <img height="600" width="800" fetchpriority="low" decoding="async" loading="lazy" src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2" alt="Loja Campos Elíseos - Átria Veículos" />
                </div>
                <div className="store-info">
                  <i className="fa fa-map-marker-alt"></i>
                  <a href="https://maps.google.com/maps?q=Rua+Domicio+Pacheco+e+Silva+1328+Campinas+SP" target="_blank" rel="noopener noreferrer">
                    Rua Domicio Pacheco e Silva, 1328<br/>Jardim Campos Elíseos - CEP: 13060-190
                  </a>
                </div>
                <div className="store-info">
                  <i className="fa fa-phone"></i>
                  <a href="tel:+551935008271">(19) 3500-8271</a>
                </div>

                <div className="store-info">
                  <i className="fa fa-clock"></i>
                  <span>Segunda a Sexta: 8h às 18h<br/>Sábado: 8h às 14h</span>
                </div>
              </div>
              
              <div className="store-card">
                <h4>Loja Guanabara</h4>
                <div className="store-photo">
                  <img height="600" width="800" fetchpriority="low" decoding="async" loading="lazy" src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/about/dealer1-2" alt="Loja Guanabara - Átria Veículos" />
                </div>
                <div className="store-info">
                  <i className="fa fa-map-marker-alt"></i>
                  <a href="https://maps.google.com/maps?q=Avenida+Brasil+1277+Jardim+Guanabara+Campinas+SP" target="_blank" rel="noopener noreferrer">
                    Avenida Brasil, 1277 - Jardim Guanabara<br/>CEP: 13070-178
                  </a>
                </div>
                <div className="store-info">
                  <i className="fa fa-phone"></i>
                  <a href="tel:+551930940015">(19) 3094-0015</a>
                </div>

                <div className="store-info">
                  <i className="fa fa-clock"></i>
                  <span>Segunda a Sexta: 8h às 18h<br/>Sábado: 8h às 14h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="stats-box wow fadeInUp">
            <h3>Números que Fazem a Diferença</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <h4>10+</h4>
                <p>Anos de Experiência</p>
              </div>
              <div className="stat-item">
                <h4>12.000+</h4>
                <p>Clientes Satisfeitos</p>
              </div>
              <div className="stat-item">
                <h4>3</h4>
                <p>Lojas na Região</p>
              </div>
              <div className="stat-item">
                <h4>250+</h4>
                <p>Carros em Estoque</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutNew;