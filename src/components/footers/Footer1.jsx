import React from "react";
import { Link } from "react-router-dom";
import "../../styles/footer-mobile.css";

export default function Footer1() {
  const footerData = {
    institucional: [
      { name: "Sobre a Átria", link: "/sobre" },
      { name: "Trabalhe Conosco", link: "/trabalhe-conosco" },
      { name: "Blog", link: "/blog" }
    ],
    veiculos: [
      { name: "Estoque", link: "/estoque" },
      { name: "Financiamento", link: "/simulador" },
      { name: "Mais Vendidos", link: "/mais-vendidos" },
      { name: "Venda seu Carro", link: "/vender" },
      { name: "Oferta da Semana", link: "/ofertas-da-semana" }
    ],
    marcas: [
      { name: "• Volkswagen", link: "/marca/volkswagen" },
      { name: "• Chevrolet", link: "/marca/chevrolet" },
      { name: "• Fiat", link: "/marca/fiat" },
      { name: "• Toyota", link: "/marca/toyota" },
      { name: "• Honda", link: "/marca/honda" }
    ],
    lojas: [
      {
        nome: "Loja Abolição",
        endereco: "Rua Abolição Nº 1500 - VL Joaquim Inacio",
        cidade: "Campinas-SP - CEP: 13045-750",
        telefone: "Tel: (19) 3199-2552",
        maps: "https://maps.google.com/maps?q=Rua+Abolição+1500+Campinas+SP"
      },
      {
        nome: "Loja Campos Elíseos",
        endereco: "Rua Domicio Pacheco e Silva, 1328",
        cidade: "Jardim Campos Elíseos - CEP: 13060-190",
        telefone: "Tel: (19) 3500-8271",
        maps: "https://maps.google.com/maps?q=Rua+Domicio+Pacheco+e+Silva+1328+Campinas+SP"
      },
      {
        nome: "Loja Guanabara",
        endereco: "Avenida Brasil, 1277 - Jardim Guanabara",
        cidade: "CEP: 13070-178",
        telefone: "Tel: (19) 3094-0015",
        maps: "https://maps.google.com/maps?q=Avenida+Brasil+1277+Jardim+Guanabara+Campinas+SP"
      }
    ]
  };

  return (
    <footer 
      style={{
        backgroundColor: '#1a2332',
        color: '#fff',
        fontFamily: 'DM Sans, sans-serif',
        borderTopLeftRadius: '30px',
        borderTopRightRadius: '30px'
      }}
    >
      {/* Newsletter Section */}
      <div 
        className="footer-newsletter-section"
        style={{
          backgroundColor: '#1a2332',
          padding: '80px 0 40px',
          textAlign: 'center'
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px'
          }}
        >
          <div style={{ marginBottom: '35px', marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <img height="60" width="150" fetchpriority="low" src="/images/logos/logo-white.png" alt="Átria Veículos" className="footer-logo" style={{ height: '85px', maxWidth: '250px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))', display: 'block' }} loading="lazy" decoding="async" />
          </div>
          <div style={{ marginBottom: '35px' }}>
            <h6 
              className="footer-newsletter-title"
              style={{
                fontSize: '32px',
                fontWeight: '500',
                color: '#fff',
                margin: '0 0 12px 0',
                lineHeight: '1.2',
                letterSpacing: '-0.5px'
              }}
            >
              Receba Nossas Ofertas
            </h6>
            <div 
              className="footer-newsletter-subtitle"
              style={{
                fontSize: '16px',
                color: '#ccc',
                lineHeight: '1.5',
                opacity: '0.9'
              }}
            >
              Vídeos exclusivos e oportunidades toda semana!
            </div>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="footer-newsletter-form"
            style={{
              display: 'flex',
              justifyContent: 'center',
              maxWidth: '600px',
              margin: '0 auto',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            <input
              id="newsletter-email"
              type="email"
              name="email"
              placeholder="Seu e-mail"
              required
              autoComplete="email"
              style={{
                flex: '1',
                minWidth: '300px',
                height: '64px',
                minHeight: '64px',
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                borderRadius: '32px',
                padding: '18px 30px',
                fontSize: '16px',
                color: '#333',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <button
              type="button"
              style={{
                backgroundColor: '#405FF2',
                color: '#fff',
                border: 'none',
                borderRadius: '32px',
                padding: '0 40px',
                height: '64px',
                minHeight: '64px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '140px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#3348D9';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#405FF2';
              }}
            >
              Cadastrar
            </button>
          </form>
        </div>
      </div>

      {/* Footer Columns */}
      <div 
        className="footer-columns-section"
        style={{
          padding: '60px 0',
          backgroundColor: '#1a2332'
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
            className="footer-columns"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1.2fr',
              gap: '40px',
              alignItems: 'start'
            }}
          >

            {/* Column 1 - Institucional */}
            <div>
              <h4 
                className="footer-column-title"
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '20px',
                  lineHeight: '1.3'
                }}
              >
                Institucional
              </h4>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                {footerData.institucional.map((item, index) => (
                  <li key={index} style={{ marginBottom: '12px' }}>
                    <Link 
                      to={item.link}
                      style={{
                        color: '#ccc',
                        textDecoration: 'none',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#405FF2'}
                      onMouseLeave={(e) => e.target.style.color = '#ccc'}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 - Atendimento */}
            <div>
              <h4 
                className="footer-column-title"
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '20px',
                  lineHeight: '1.3'
                }}
              >
                Atendimento
              </h4>
              <div style={{ marginBottom: '20px' }}>
                <a 
                  href="https://wa.me/5519996525211" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#25D366',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  WhatsApp: (19) 99652-5211
                </a>
              </div>
              <div style={{ marginBottom: '15px', fontSize: '14px', color: '#ccc' }}>
                <strong style={{ color: '#fff' }}>Horário de Atendimento:</strong><br />
                Segunda a Sábado: 08:00 às 18:00
              </div>
            </div>

            {/* Column 3 - Veículos */}
            <div>
              <h4 
                className="footer-column-title"
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '20px',
                  lineHeight: '1.3'
                }}
              >
                Veículos
              </h4>
              <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                {footerData.veiculos.map((item, index) => (
                  <li key={index} style={{ marginBottom: '12px' }}>
                    <Link 
                      to={item.link}
                      style={{
                        color: '#ccc',
                        textDecoration: 'none',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#405FF2'}
                      onMouseLeave={(e) => e.target.style.color = '#ccc'}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 - Nossas Lojas */}
            <div>
              <h4 
                className="footer-column-title"
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '20px',
                  lineHeight: '1.3'
                }}
              >
                Nossas Lojas
              </h4>
              {footerData.lojas.map((loja, index) => (
                <div key={index} className="footer-store-info" style={{ marginBottom: '25px', fontSize: '14px', color: '#ccc' }}>
                  <strong style={{ color: '#fff' }}>{loja.nome}</strong><br />
                  {loja.endereco}<br />
                  {loja.cidade}<br />
                  {loja.telefone}
                  <div style={{ marginTop: '8px' }}>
                    <a 
                      href={loja.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#405FF2',
                        fontSize: '13px',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                    >
                      ➤ Como chegar (Google Maps)
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div 
        className="footer-social-section"
        style={{ 
          padding: '40px 0 60px', 
          borderTop: '1px solid #333',
          backgroundColor: '#1a2332'
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px',
            textAlign: 'center'
          }}
        >
          <h6 
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '25px'
            }}
          >
            Siga-nos:
          </h6>
          <div 
            className="footer-social-links"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '25px',
              marginBottom: '40px'
            }}
          >
            {/* Facebook */}
            <a
              href="https://facebook.com/atriaveiculos"
              aria-label="Siga-nos no Facebook"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '55px',
                height: '55px',
                backgroundColor: 'transparent',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '15px',
                textDecoration: 'none',
                fontSize: '24px',
                transition: 'all 0.3s ease',
                border: '2px solid #333'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.backgroundColor = '#1877F2';
                e.target.style.borderColor = '#1877F2';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#333';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/atriaveiculos"
              aria-label="Siga-nos no Instagram"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '55px',
                height: '55px',
                backgroundColor: 'transparent',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '15px',
                textDecoration: 'none',
                fontSize: '24px',
                transition: 'all 0.3s ease',
                border: '2px solid #333'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.background = 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)';
                e.target.style.borderColor = '#E4405F';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#333';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com/@atriaveiculos"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '55px',
                height: '55px',
                backgroundColor: 'transparent',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '15px',
                textDecoration: 'none',
                fontSize: '24px',
                transition: 'all 0.3s ease',
                border: '2px solid #333'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.backgroundColor = '#FF0000';
                e.target.style.borderColor = '#FF0000';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#333';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
          <div 
            style={{
              fontSize: '14px',
              color: '#888',
              lineHeight: '1.6'
            }}
          >
            © 2025 Átria Veículos. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div 
        className="footer-bottom-section"
        style={{
          backgroundColor: '#151924',
          padding: '25px 0 40px',
          borderTop: '1px solid #333'
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div 
            style={{
              color: '#ccc',
              fontSize: '14px'
            }}
          >
            © 2025 Átria Veículos - Todos os direitos reservados
          </div>
          <div 
            className="footer-bottom-links"
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            <Link 
              to="/politica-privacidade"
              style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#405FF2'}
              onMouseLeave={(e) => e.target.style.color = '#ccc'}
            >
              Política de Privacidade
            </Link>
            <Link 
              to="/termos-uso"
              style={{
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#405FF2'}
              onMouseLeave={(e) => e.target.style.color = '#ccc'}
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
