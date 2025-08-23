import React from "react";
import Nav from "./Nav";
import { Link } from "react-router-dom";

export default function Header1({
  headerClass = "header-style-v1 header-default",
  white = false,
}) {
  // Determinar se é página interna baseado em white ou classe inner-header
  const isInnerPage = white || headerClass.includes('inner-header');
  
  return (
    <>
      <style>{`
        /* Header transparente para homepage, azul para páginas internas */
        .boxcar-header {
          background: ${isInnerPage ? '#1a2332' : 'transparent'} !important;
          border: none !important;
          box-shadow: none !important;
          position: ${isInnerPage ? 'sticky' : 'absolute'} !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 999 !important;
        }
        
        .boxcar-header .header-inner {
          width: 100% !important;
          background: transparent !important;
        }
        
        .boxcar-header .inner-container {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          width: 100% !important;
          max-width: 1200px !important;
          margin: 0 auto !important;
          padding: 20px 15px !important;
          position: relative !important;
          background: transparent !important;
        }
        
        /* Logo fixo na extrema esquerda */
        .boxcar-header .logo-inner {
          flex-shrink: 0 !important;
          margin-right: 0 !important;
        }
        
        .boxcar-header .logo {
          margin: 0 !important;
        }
        
        /* Menu de navegação alinhado à direita */
        .boxcar-header .nav-out-bar {
          display: flex !important;
          justify-content: flex-end !important;
          margin-right: 20px !important;
        }
        
        /* Links do menu - cor baseada no tipo de página */
        .boxcar-header .navigation a {
          color: ${isInnerPage ? '#ffffff' : '#000000'} !important;
        }
        
        .boxcar-header .navigation a:hover {
          color: ${isInnerPage ? '#e2e8f0' : '#333333'} !important;
        }
        
        /* Botão Entrar fixo na extrema direita */
        .boxcar-header .right-box {
          display: flex !important;
          align-items: center !important;
          gap: 15px !important;
          flex-shrink: 0 !important;
          margin-left: auto !important;
        }
        
        .boxcar-header .box-account {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          color: ${isInnerPage ? '#ffffff' : '#000000'} !important;
          font-size: 14px !important;
          text-decoration: none !important;
          padding: 8px 12px !important;
          border-radius: 6px !important;
          transition: all 0.3s ease !important;
          white-space: nowrap !important;
        }
        
        /* Responsividade Mobile - FORÇA posicionamento */
        @media (max-width: 768px) {
          .boxcar-header .nav-out-bar {
            display: none !important;
          }
          .boxcar-header .btn {
            display: none !important;
          }
          
          /* FORÇA distribuição esquerda-direita no mobile */
          .boxcar-header .inner-container {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            flex-wrap: nowrap !important;
            max-width: 100% !important;
            padding: 0 15px !important;
          }
          
          .boxcar-header .logo-inner {
            flex: 0 0 auto !important;
            margin: 0 !important;
          }
          
          .boxcar-header .right-box {
            flex: 0 0 auto !important;
            margin-left: auto !important;
            position: relative !important;
            right: 0 !important;
          }
          
          /* Remove qualquer centralização */
          .boxcar-header .header-inner,
          .boxcar-header .inner-container > * {
            text-align: left !important;
          }
        }
      `}</style>
      <header className={`boxcar-header  ${headerClass}`} style={{ 
        position: isInnerPage ? 'sticky' : 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: isInnerPage ? '#1a2332' : 'transparent',
        zIndex: 999 
      }}>
      <div className="header-inner" style={{ 
        width: '100%', 
        position: 'relative',
        background: 'transparent' 
      }}>
        <div className="inner-container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%',
          position: 'relative',
          background: 'transparent',
          padding: '20px 15px'
        }}>
          {/* Logo - Left Side */}
          <div className="logo-inner" style={{ flex: '0 0 auto' }}>
            <div className="logo">
              <Link to={`/`}>
                <img fetchpriority="high" decoding="async" loading="eager" alt="" title="Átria Veículos" src={isInnerPage ? "/images/logos/logo-white.png" : "/images/logos/logo-default.png"} width="120" height="40" style={{ imageRendering: '-webkit-optimize-contrast', msInterpolationMode: 'nearest-neighbor', maxWidth: '100%', height: 'auto' }} />
              </Link>
            </div>
          </div>

          {/* Navigation - Center */}
          <div className="nav-out-bar" style={{ flex: '1' }}>
            <nav className="nav main-menu">
              <ul className="navigation" id="navbar">
                <Nav white={isInnerPage} />
              </ul>
            </nav>
          </div>

          {/* Login Button - Right Side */}
          <div className="right-box" style={{ flex: '0 0 auto', marginLeft: 'auto' }}>
              <Link 
                to={`/login`} 
                title="" 
                className="box-account" 
                style={{ 
                  color: isInnerPage ? '#ffffff' : '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
              >
                <span className="icon">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_147_6490)">
                      <path
                        d="M7.99998 9.01221C3.19258 9.01221 0.544983 11.2865 0.544983 15.4161C0.544983 15.7386 0.806389 16.0001 1.12892 16.0001H14.871C15.1935 16.0001 15.455 15.7386 15.455 15.4161C15.455 11.2867 12.8074 9.01221 7.99998 9.01221ZM1.73411 14.8322C1.9638 11.7445 4.06889 10.1801 7.99998 10.1801C11.9311 10.1801 14.0362 11.7445 14.2661 14.8322H1.73411Z"
                        fill={isInnerPage ? "#ffffff" : "#000000"}
                      />
                      <path
                        d="M7.99999 0C5.79171 0 4.12653 1.69869 4.12653 3.95116C4.12653 6.26959 5.86415 8.15553 7.99999 8.15553C10.1358 8.15553 11.8735 6.26959 11.8735 3.95134C11.8735 1.69869 10.2083 0 7.99999 0ZM7.99999 6.98784C6.50803 6.98784 5.2944 5.62569 5.2944 3.95134C5.2944 2.3385 6.43231 1.16788 7.99999 1.16788C9.54259 1.16788 10.7056 2.36438 10.7056 3.95134C10.7056 5.62569 9.49196 6.98784 7.99999 6.98784Z"
                        fill={isInnerPage ? "#ffffff" : "#000000"}
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_147_6490">
                        <rect width={16} height={16} fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                Entrar
              </Link>
              <div className="btn" style={{ display: 'none' }}>
                <Link to={`/add-listings`} className="header-btn-two">
                  Adicionar Anúncio
                </Link>
              </div>
          </div>
        </div>
      </div>
      {/* Header Search */}
      <div className="search-popup">
        <span className="search-back-drop" />
        <button className="close-search">
          <span className="fa fa-times" />
        </button>
        <div className="search-inner">
          <form onSubmit={(e) => e.preventDefault()} method="post">
            <div className="form-group">
              <input
                type="search"
                name="search-field"
                defaultValue=""
                placeholder="Search..."
                required
              />
              <button type="submit">
                <i className="fa fa-search" />
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* End Header Search */}
      <div id="nav-mobile" />
    </header>
    </>
  );
}
