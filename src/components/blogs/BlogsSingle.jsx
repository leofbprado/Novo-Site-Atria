import React from "react";
import { Link } from "react-router-dom";

export default function BlogsSingle({ blogItem }) {
  if (!blogItem) {
    return (
      <section 
        className="blog-section-five layout-radius"
        style={{
          borderBottomLeftRadius: '30px',
          borderBottomRightRadius: '30px',
          backgroundColor: '#fff',
          overflow: 'hidden',
          minHeight: '70vh',
          paddingBottom: '80px'
        }}
      >
        <div className="boxcar-container">
          <div className="boxcar-title wow fadeInUp">
            <p>Post não encontrado</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        /* Fix layout and positioning issues for blog single */
        .blog-single-breadcrumb {
          position: relative !important;
          z-index: 1 !important;
          padding: 42px 0 !important;
          background: #fff !important;
          margin-bottom: 0 !important;
        }
        .blog-single-breadcrumb .boxcar-title-three {
          margin-bottom: 0 !important;
          position: relative !important;
        }
        .blog-single-breadcrumb .boxcar-title-three .breadcrumb {
          margin-bottom: 12px !important;
          position: relative !important;
          z-index: 10 !important;
        }
        .blog-single-breadcrumb .boxcar-title-three .title {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          font-size: 40px !important;
          font-weight: 700 !important;
          color: #1a2332 !important;
          margin: 0 0 36px 0 !important;
          text-align: left !important;
          line-height: 1.2 !important;
          position: relative !important;
          z-index: 10 !important;
        }
        /* Ensure blog content doesn't overlap */
        .blog-section-five {
          position: relative !important;
          z-index: 2 !important;
          margin-top: 0 !important;
          clear: both !important;
        }
        /* Remove pseudo-elements that might interfere */
        .blog-single-breadcrumb .boxcar-title-three::after,
        .blog-single-breadcrumb .boxcar-title-three::before,
        .blog-single-breadcrumb .boxcar-title-three > *::after,
        .blog-single-breadcrumb .boxcar-title-three > *::before,
        .blog-single-breadcrumb .boxcar-title-three h2::after,
        .blog-single-breadcrumb .boxcar-title-three h2::before,
        .blog-single-breadcrumb .boxcar-title-three .title::after,
        .blog-single-breadcrumb .boxcar-title-three .title::before {
          content: none !important;
          display: none !important;
        }
        .blog-single-breadcrumb .boxcar-title-three .breadcrumb li::before {
          content: "/" !important;
          position: absolute !important;
          top: 0 !important;
          right: -14px !important;
        }
        .blog-single-breadcrumb .boxcar-title-three .breadcrumb li:last-child::before {
          display: none !important;
        }
      `}</style>
      {/* Breadcrumb separado com mesmo padrão das outras páginas */}
      <section className="inventory-section pb-0 layout-radius blog-single-breadcrumb">
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            <ul className="breadcrumb">
              <li>
                <Link to="/">Início</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <span>{blogItem.title}</span>
              </li>
            </ul>
            <h2 className="title">{blogItem.title}</h2>
          </div>
        </div>
      </section>

      {/* Conteúdo do blog */}
      <style>{`
        .blog-section-five.layout-radius {
          border-bottom-left-radius: 80px !important;
          border-bottom-right-radius: 80px !important;
          overflow: hidden !important;
          position: relative !important;
          z-index: 2 !important;
          clear: both !important;
        }
        .blog-section-five .right-box,
        .blog-section-five .large-container,
        .blog-section-five .content-box,
        .blog-section-five .right-box-two {
          border-bottom-left-radius: 80px !important;
          border-bottom-right-radius: 80px !important;
          overflow: hidden !important;
          position: relative !important;
        }
      `}</style>
      <section 
        className="blog-section-five"
        style={{
          borderBottomLeftRadius: '80px',
          borderBottomRightRadius: '80px',
          backgroundColor: '#fff',
          overflow: 'hidden',
          paddingBottom: '40px',
          paddingTop: '30px',
          position: 'relative',
          zIndex: 2,
          marginTop: '0px',
          clear: 'both'
        }}
      >
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp" style={{ paddingTop: '20px' }}>
          <ul className="post-info">
            <li>
              <span>{blogItem.author || 'Átria Veículos'}</span>
            </li>
            <li>
              <span>•</span>
            </li>
            <li>
              <span>News</span>
            </li>
            <li>{blogItem.date}</li>
          </ul>
        </div>
      </div>
      <div className="right-box" style={{ borderBottomLeftRadius: '80px !important', borderBottomRightRadius: '80px !important', overflow: 'hidden !important' }}>
        <div className="large-container" style={{ borderBottomLeftRadius: '80px !important', borderBottomRightRadius: '80px !important', overflow: 'hidden !important' }}>
          <div className="content-box" style={{ borderBottomLeftRadius: '80px !important', borderBottomRightRadius: '80px !important', overflow: 'hidden !important' }}>
            <figure className="outer-image">
              <img fetchpriority="low" alt={blogItem.title} width={1700} height={600} src={blogItem.coverImage} loading="lazy" decoding="async" style={{ objectFit: 'cover' }} />
            </figure>
            <div className="right-box-two" style={{ minHeight: '70vh', paddingBottom: '20px', borderBottomLeftRadius: '80px !important', borderBottomRightRadius: '80px !important', overflow: 'hidden !important' }}>
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: blogItem.content }}
                style={{
                  lineHeight: '1.8',
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '40px'
                }}
              />

              {/* Botões de Navegação na Área Branca */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '30px 0',
                  borderTop: '1px solid #e5e7eb',
                  marginBottom: '60px',
                  gap: '20px'
                }}
              >
                <Link 
                  to="/blog-list-02" 
                  style={{ 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#405FF2',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#3348D9';
                    e.target.style.transform = 'translateX(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#405FF2';
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  <i className="fa-solid fa-angle-left" />
                  Voltar ao Blog
                </Link>
                
                <Link 
                  to="/estoque" 
                  style={{ 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#405FF2',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#3348D9';
                    e.target.style.transform = 'translateX(3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#405FF2';
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  Ver Veículos
                  <i className="fa-solid fa-angle-right" />
                </Link>
              </div>
              
              <div className="social-section" style={{ marginBottom: '20px' }}>
                <div className="inner-column">
                  <ul className="social-icons">
                    <li>Compartilhar este post</li>
                    <li>
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fa-brands fa-facebook-f" />
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fa-brands fa-twitter" />
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fa-brands fa-instagram" />
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fa-brands fa-linkedin-in" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}