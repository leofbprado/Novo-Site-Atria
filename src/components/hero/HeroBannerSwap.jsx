import React, { useState, useEffect } from 'react';

const HeroBannerSwap = () => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Troca para vídeo após 5 segundos
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="hero-banner-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Imagem inicial para LCP otimizado */}
      {!showVideo && (
        <img fetchpriority="high" loading="eager" src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_1920,h_1080/v1/atria-site/banner-inicial.webp" alt="Átria Veículos - Banner Principal" fetchPriority="high" decoding="async" width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
      )}

      {/* Vídeo que aparece após 5 segundos */}
      {showVideo && (
        <video autoplay fetchpriority="low" preload="none" autoPlay muted loop playsInline loading="lazy" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2 }} >
          <source
            src="https://res.cloudinary.com/dyngqkiyl/video/upload/f_auto,q_auto,w_1920/v1/atria-site/banner-video.mp4"
            type="video/mp4"
          />
          Seu navegador não suporta vídeos.
        </video>
      )}

      {/* Overlay para conteúdo sobre o banner */}
      <div
        className="hero-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1))'
        }}
      >
        {/* Aqui pode ser adicionado conteúdo sobre o banner */}
        <div className="hero-content">
          {/* Conteúdo do hero será inserido aqui */}
        </div>
      </div>
    </div>
  );
};

export default HeroBannerSwap;