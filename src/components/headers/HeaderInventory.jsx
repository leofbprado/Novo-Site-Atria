import React from "react";
import { Link } from "react-router-dom";
import LucideIcon from "@/components/icons/LucideIcon";

export default function HeaderInventory({
  headerClass = "header-style-v1 header-default",
}) {
  return (
    <>
      <style>{`
        /* Estilos para desktop - header mais alto */
        @media (min-width: 1024px) {
          .boxcar-header.style-two {
            min-height: 100px !important;
            background-color: #1a2332 !important;
          }
          .boxcar-header.style-two .header-inner {
            min-height: 100px !important;
            display: flex !important;
            align-items: center !important;
            padding: 1.5rem 0 !important;
          }
          .boxcar-header.style-two .inner-container {
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
            padding: 0 20px !important;
          }
          .boxcar-header.style-two .c-box {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .boxcar-header.style-two .logo-inner {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
          }
          .boxcar-header.style-two .logo {
            display: flex !important;
            align-items: center !important;
          }
          .boxcar-header.style-two .nav-out-bar {
            display: none !important;
          }
          .boxcar-header.style-two .right-box {
            margin-left: auto !important;
          }
          
          /* Estilos para fontes brancas */
          .boxcar-header.style-two * {
            color: #ffffff !important;
          }
          .boxcar-header.style-two a {
            color: #ffffff !important;
            text-decoration: none !important;
          }
          .boxcar-header.style-two a:hover {
            color: #e2e8f0 !important;
          }
        }
        
        /* Estilos para mobile */
        @media (max-width: 768px) {
          .boxcar-header .logo img {
            height: 40px !important;
            width: auto !important;
          }
          .boxcar-header .right-box {
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
          }
          .boxcar-header .box-account {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            color: #ffffff !important;
            font-size: 14px !important;
            text-decoration: none !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
            transition: all 0.3s ease !important;
          }
          .boxcar-header .nav-out-bar {
            display: none !important;
          }
          .boxcar-header .btn {
            display: none !important;
          }
        }
      `}</style>
      <header className={`boxcar-header style-two ${headerClass}`} style={{ backgroundColor: '#1a2332' }}>
      <div className="header-inner">
        <div className="inner-container">
          {/* Main box */}
          <div className="c-box">
            <div className="logo-inner">
              <div className="logo">
                <Link to={`/`}>
                  <img height="60" width="150" fetchpriority="high" decoding="async" loading="eager" alt="" title="Átria Veículos" src="/images/logos/logo-white.png" style={{ width: 'auto', height: '60px', maxWidth: '180px', imageRendering: '-webkit-optimize-contrast', msInterpolationMode: 'nearest-neighbor' }} />
                </Link>
              </div>
            </div>

            <div className="right-box" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Link 
                to={`/login`} 
                title="" 
                className="box-account" 
                style={{ 
                  color: '#ffffff',
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
                <LucideIcon name="user" size={16} />
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}