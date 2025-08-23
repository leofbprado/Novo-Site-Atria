import SmartSearchInput from "@/components/common/SmartSearchInput";
import { carTypes } from "@/data/categories";
import { Link, useNavigate } from "react-router-dom";
import { useFilters } from "@/contexts/FilterContext";
import React, { useEffect, useState } from "react";

export default function Hero() {
  const { updateFilters } = useFilters();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCarTypeClick = (carType) => {
    console.log(`🚗 Filtro de tipo clicado: ${carType}`);
    
    // Navegar para o estoque com parâmetro URL
    const typeParam = carType.toLowerCase();
    navigate(`/estoque?tipo=${typeParam}`);
    
    console.log(`✅ ${carType} clicked - redirecionando para /estoque?tipo=${typeParam}`);
  };
  return (
    <section 
      className={`boxcar-banner-section-v1 ${isMobile ? 'mobile-banner' : ''}`}
      data-wow-offset="9999"
    >
      <div className="relative w-full min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden pb-12 md:pb-0">
        <picture>
          <source type="image/avif" media="(min-width: 768px)"
            srcSet="
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_avif,q_auto,w_960/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.avif 960w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_avif,q_auto,w_1440/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.avif 1440w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_avif,q_auto,w_1920/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.avif 1920w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_avif,q_auto,w_2560/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.avif 2560w"
            sizes="100vw" />
          <source type="image/avif" media="(max-width: 767px)"
            srcSet="
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_avif,q_auto,w_400/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.avif 400w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_avif,q_auto,w_800/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.avif 800w"
            sizes="100vw" />
          <source type="image/webp" media="(min-width: 768px)"
            srcSet="
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto,w_960/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.webp 960w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto,w_1440/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.webp 1440w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto,w_1920/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.webp 1920w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto,w_2560/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.webp 2560w"
            sizes="100vw" />
          <source type="image/webp" media="(max-width: 767px)"
            srcSet="
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto,w_400/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.webp 400w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto,w_800/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.webp 800w"
            sizes="100vw" />
          <img
            src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_1920/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.jpg"
            srcSet="
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_400/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.jpg 400w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_800/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.jpg 800w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_1200/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.jpg 1200w,
              https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_1920/v1754491147/freepik__the-style-is-candid-image-photography-with-natural__92107_yf4xgx.jpg 1920w"
            sizes="100vw"
            alt="Átria Veículos - Sua concessionária de confiança"
            width="1920" height="1080"
            fetchpriority="high" decoding="async"
            style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', top:0, left:0, zIndex:1, backgroundColor:'transparent' }}
          />
        </picture>
        {/* Overlay escuro para melhorar contraste do texto */}
        <div 
          className="absolute inset-0 bg-black"
          style={{
            opacity: isMobile ? 0.4 : 0.3,
            zIndex: 2
          }}
        />
        {/* Content */}
        <div className="container">
          <div 
            className="banner-content"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              visibility: 'visible !important',
              opacity: '1 !important',
              display: 'block !important',
              width: isMobile ? '90%' : 'auto',
              textAlign: 'center'
            }}
          >
            <span style={{ 
              color: '#ffffff',
              fontSize: isMobile ? '1.1rem' : '1rem',
              display: 'block',
              marginBottom: '10px'
            }}>
              Compra segura, preço justo e carros de qualidade.
            </span>
            <h2 style={{ 
              color: '#ffffff',
              fontSize: isMobile ? '2.5rem' : '3.5rem',
              lineHeight: isMobile ? '1.2' : '1.1',
              marginBottom: '20px'
            }}>
              Encontre seu carro perfeito.
            </h2>
            <div className="form-tabs">
              <div className="form-tab-content">
                <div className="form-tab-pane current" id="tab-1">
                  <SmartSearchInput />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
