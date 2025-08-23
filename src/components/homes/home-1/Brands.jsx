import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { carBrands } from "@/data/brands";
import BrandLogo from "@/components/BrandLogo";
import "@/styles/brand-logo.css";
import Slider from "react-slick";
export default function Brands() {
  const [isVisible, setIsVisible] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sliderReady, setSliderReady] = useState(false);
  const [carouselCssLoaded, setCarouselCssLoaded] = useState(false);
  const sectionRef = useRef(null);

  // Load available brands from inventory
  const loadAvailableBrands = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando marcas disponíveis do estoque...');
      
      // ⚡ Firebase lazy loading - só carrega quando necessário
      const { db } = await import('@/firebase/config');
      const { collection, getDocs } = await import('firebase/firestore');
      
      const vehiclesCollection = collection(db, 'veiculos');
      const querySnapshot = await getDocs(vehiclesCollection);
      
      // Extract unique brands from active vehicles
      const brandsSet = new Set();
      
      querySnapshot.forEach((doc) => {
        const vehicleData = doc.data();
        
        // Only include active vehicles
        if (vehicleData.ativo !== false && vehicleData.marca) {
          brandsSet.add(vehicleData.marca.trim());
        }
      });
      
      // Match extracted brands with brand data (logo, etc.)
      const matchedBrands = [];
      
      [...brandsSet].forEach(brandName => {
        // Find matching brand from static data
        const brandData = carBrands.find(brand => 
          brand.title.toLowerCase() === brandName.toLowerCase() ||
          brand.title.toLowerCase().includes(brandName.toLowerCase()) ||
          brandName.toLowerCase().includes(brand.title.toLowerCase())
        );
        
        if (brandData) {
          matchedBrands.push({
            ...brandData,
            realBrandName: brandName // Store the exact brand name from inventory
          });
        } else {
          // If no logo found, create a basic entry with Cloudinary optimized logo
          matchedBrands.push({
            src: `https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto,w_100,h_60,c_fit/v1754490506/brands/${brandName.toLowerCase().replace(/\s+/g, '-')}-logo.png`,
            width: 100,
            height: 60,
            title: brandName,
            realBrandName: brandName,
            wowDelay: "0ms"
          });
        }
      });
      
      // Sort brands alphabetically
      matchedBrands.sort((a, b) => a.title.localeCompare(b.title));
      
      console.log(`✅ ${matchedBrands.length} marcas disponíveis no estoque:`, matchedBrands.map(b => b.title));
      setAvailableBrands(matchedBrands);
      
    } catch (error) {
      console.error('❌ Erro ao carregar marcas:', error);
      // Fallback to static brands if Firebase fails
      setAvailableBrands(carBrands.slice(0, 12));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Load brands from inventory
    loadAvailableBrands();
    
    // Carregar CSS e inicializar carrossel
    const initializeCarousel = async () => {
      console.log('🎯 Inicializando carrossel de marcas...');
      
      // Carregar CSS primeiro
      const cssFiles = ['/css/slick.css', '/css/slick-theme.css'];
      const cssPromises = cssFiles.map(file => {
        const id = file.replace(/[^a-zA-Z0-9]/g, '-');
        if (document.getElementById(id)) {
          return Promise.resolve();
        }
        
        return new Promise((resolve) => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = file;
          link.id = id;
          link.onload = () => resolve();
          link.onerror = () => resolve();
          document.head.appendChild(link);
        });
      });
      
      try {
        await Promise.allSettled(cssPromises);
        console.log('✅ CSS do carousel de marcas carregado');
        setCarouselCssLoaded(true);
        
        // Aguardar um pouco e habilitar slider
        setTimeout(() => {
          console.log('✅ Carrossel de marcas habilitado');
          setSliderReady(true);
        }, 50);
        
      } catch (error) {
        console.warn('⚠️ Erro no carrossel de marcas:', error);
        setSliderReady(true); // Habilitar mesmo com erro
      }
    };
    
    initializeCarousel();
    
    // ✅ UNIVERSAL ANIMATION: Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Fix aria-hidden cloned elements (same as Cars.jsx)
  useEffect(() => {
    const fixClonedElements = () => {
      const clonedSlides = document.querySelectorAll('.slick-slide.slick-cloned[aria-hidden="true"]');
      clonedSlides.forEach(slide => {
        const links = slide.querySelectorAll('a');
        const buttons = slide.querySelectorAll('button');
        const inputs = slide.querySelectorAll('input, select, textarea');
        
        [...links, ...buttons, ...inputs].forEach(element => {
          element.setAttribute('tabindex', '-1');
          element.setAttribute('aria-hidden', 'true');
        });
      });
    };
    
    // Execute após render do carousel
    const timer = setTimeout(fixClonedElements, 100);
    return () => clearTimeout(timer);
  }, [sliderReady]);

  // 🎯 Configurações otimizadas para carrossel touch-friendly (mesmas do Cars.jsx)
  const options = {
    dots: isMobile, // Pontos de navegação no mobile
    infinite: true,
    slidesToShow: 6, // Mais slides para marcas (são menores)
    slidesToScroll: 1,
    arrows: !isMobile, // Setas apenas no desktop
    speed: 400,
    autoplay: false,
    pauseOnHover: true,
    swipe: true, // Habilitar swipe/deslize
    swipeToSlide: true, // Permitir deslizar direto para qualquer slide
    touchMove: true, // Movimento por toque habilitado
    touchThreshold: 5, // Sensibilidade do toque
    draggable: true, // Permitir arrastar
    useCSS: true,
    useTransform: true,
    cssEase: 'ease-in-out',
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 6,
          arrows: true,
          dots: false,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 5,
          arrows: true,
          dots: false,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 4,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 3,
          arrows: false,
          dots: true,
          centerMode: true,
          centerPadding: '20px',
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
          arrows: false,
          dots: true,
          centerMode: true,
          centerPadding: '15px',
        },
      },
    ],
  };

  // ✅ CSS para as marcas no carrossel (adaptado para React Slick)
  const brandCarouselStyle = `
    .brands-carousel-container {
      position: relative;
      background: transparent;
      padding: 0 40px;
    }
    
    /* Container principal dos dots com posicionamento absoluto */
    .boxcar-brand-section .slick-slider {
      position: relative !important;
      padding-bottom: 60px !important;
    }
    
    /* Força apenas um conjunto de dots centralizado */
    .boxcar-brand-section .slick-dots {
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      list-style: none !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }
    
    /* Esconde qualquer duplicação */
    .boxcar-brand-section .slick-initialized .slick-dots:not(:first-of-type),
    .boxcar-brand-section .slick-dots ~ .slick-dots {
      display: none !important;
    }
    
    .boxcar-brand-section .slick-dots li {
      margin: 0 4px !important;
      width: auto !important;
      height: auto !important;
      display: inline-block !important;
      line-height: 0 !important;
    }
    
    .boxcar-brand-section .slick-dots li button {
      width: 5px !important;
      height: 5px !important;
      border-radius: 50% !important;
      border: none !important;
      background: #d1d5db !important;
      font-size: 0 !important;
      text-indent: -9999px !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      padding: 0 !important;
      display: block !important;
      line-height: 0 !important;
      outline: none !important;
      opacity: 1 !important;
    }
    
    /* Remove completamente o pseudo-elemento padrão */
    .boxcar-brand-section .slick-dots li button:before,
    .boxcar-brand-section .slick-dots li button:after {
      display: none !important;
      content: none !important;
    }
    
    .boxcar-brand-section .slick-dots li.slick-active button {
      background: #1A75FF !important;
      width: 6px !important;
      height: 6px !important;
    }
    
    .brands-card {
      background-color: #f8f9fa;
      border-radius: 12px;
      padding: 25px 15px;
      text-align: center;
      transition: all 0.3s ease;
      border: 1px solid #e9ecef;
      height: 140px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      margin: 0 10px;
    }
    
    .brands-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .brands-animate {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s ease-out;
    }
    
    .brands-animate.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .brands-image {
      max-width: 60px !important;
      max-height: 60px !important;
      object-fit: contain !important;
      display: block !important;
    }
    
    .brands-title {
      font-size: 14px;
      font-weight: 500;
      color: #2c3e50;
      margin: 10px 0 0 0;
      line-height: 1.2;
      text-decoration: none;
    }
    
    /* Garantir que o container não tenha padding extra no mobile */
    @media (max-width: 768px) {
      .brands-carousel-container {
        padding: 0 15px;
      }
      
      .boxcar-brand-section .slick-dots {
        bottom: -40px !important;
      }
    }
    
    /* Fix para evitar múltiplos dots no Slick */
    .brands-carousel-container .slick-slider .slick-dots {
      position: absolute !important;
    }
    
    /* Remove qualquer estilo de dots anterior */
    .brands-carousel-container .slick-dots li button:before {
      content: '' !important;
    }
  `;

  return (
    <>
      <style>{brandCarouselStyle}</style>
      {/* ✅ SEÇÃO COM CARROSSEL REACT SLICK - Mesmo comportamento do "Mais Vendidos" */}
      <section 
        ref={sectionRef}
        className="boxcar-brand-section section-radius-top bg-1" 
        style={{
          backgroundColor: '#e9ecef',
          paddingTop: '120px',
          paddingBottom: '120px'
        }}
      >
        <div className="boxcar-container">
          <div className={`boxcar-title brands-animate ${isVisible ? 'visible' : ''}`} style={{ marginBottom: '40px' }}>
            <h2>Procure por Marcas</h2>
            <Link to={`/estoque`} className="btn-title">
              Ver Todas as Marcas
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={14}
                height={14}
                viewBox="0 0 14 14"
                fill="none"
              >
                <g clipPath="url(#clip0_601_3199)">
                  <path
                    d="M13.6109 0H5.05533C4.84037 0 4.66643 0.173943 4.66643 0.388901C4.66643 0.603859 4.84037 0.777802 5.05533 0.777802H12.6721L0.113697 13.3362C-0.0382246 13.4881 -0.0382246 13.7342 0.113697 13.8861C0.18964 13.962 0.289171 14 0.388666 14C0.488161 14 0.587656 13.962 0.663635 13.8861L13.222 1.3277V8.94447C13.222 9.15943 13.3959 9.33337 13.6109 9.33337C13.8259 9.33337 13.9998 9.15943 13.9998 8.94447V0.388901C13.9998 0.173943 13.8258 0 13.6109 0Z"
                    fill="#050B20"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_601_3199">
                    <rect width={14} height={14} fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </Link>
          </div>
          
          {/* ✅ CARROSSEL REACT SLICK COM NAVEGAÇÃO (igual ao "Mais Vendidos") */}
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 0',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Carregando marcas disponíveis...
            </div>
          ) : availableBrands.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 0',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Nenhuma marca disponível no momento.
            </div>
          ) : sliderReady && carouselCssLoaded ? (
            <div className={`brands-carousel-container brands-animate ${isVisible ? 'visible' : ''}`} style={{
              animationDelay: '0.3s'
            }}>
              <Slider {...options}>
                {availableBrands.map((brand, index) => (
                  <div key={`brand-${index}-${brand.title}`}>
                    <div className="brands-card">
                      <Link to={`/estoque?marca=${encodeURIComponent(brand.realBrandName || brand.title)}`}>
                        <BrandLogo 
                          brand={brand.realBrandName || brand.title}
                          size={60}
                          className="brands-image"
                          title={brand.title}
                        />
                      </Link>
                      <Link to={`/estoque?marca=${encodeURIComponent(brand.realBrandName || brand.title)}`} className="brands-title">
                        {brand.title}
                      </Link>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 0',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Inicializando carrossel...
            </div>
          )}
        </div>
      </section>
    </>
  );
}
