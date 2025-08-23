import Counter from "@/components/common/Counter";
import { counters } from "@/data/facts";
import React, { useEffect, useState, useRef } from "react";

export default function Facts() {
  const [key, setKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Force re-render of counters
    setKey(prev => prev + 1);
    
    // Check screen size
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreen();
    window.addEventListener('resize', checkScreen);
    
    // ✅ UNIVERSAL ANIMATION: Intersection Observer (funciona em todos os navegadores)
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
      window.removeEventListener('resize', checkScreen);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* ✅ CSS UNIVERSAL PARA ANIMAÇÕES COMPATÍVEIS */}
      <style>{`
        .facts-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        
        .facts-animate.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .facts-counter-item {
          transition: transform 0.3s ease;
        }
        
        .facts-counter-item:hover {
          transform: translateY(-5px);
        }
        
        @media (max-width: 768px) {
          .facts-animate {
            transform: translateY(20px);
          }
        }
      `}</style>
      
      <section 
        ref={sectionRef}
        className="boxcar-fun-fact-section" 
        style={{
          position: 'relative',
          overflow: 'hidden',
          marginTop: '-100px',
          paddingTop: '76px',
          paddingBottom: '21px',
          borderRadius: '100px 100px 0 0',
          backgroundColor: '#f8f9fa',
          zIndex: 2
        }}
      >
      <div className="large-container">
        <div className="fact-counter" style={{
          padding: isMobile ? '11px 20px 11px' : '11px 156px 11px',
          borderBottom: 'none'
        }}>
          <div className="row" style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {/* Counter block Two*/}
            {counters.map((counter, index) => (
              <div
                className={`counter-block col-lg-3 col-md-3 col-sm-4 facts-animate facts-counter-item ${isVisible ? 'visible' : ''}`}
                key={`${counter.title}-${index}-${key}`}
                style={{
                  marginBottom: isMobile ? '30px' : 'inherit',
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="inner">
                  <div className="content">
                    <div className="widget-counter">
                      <span className="count-text" style={{
                        display: 'block',
                        fontSize: isMobile ? '28px' : 'inherit',
                        lineHeight: isMobile ? '1.1' : 'inherit',
                        marginBottom: isMobile ? '8px' : 'inherit'
                      }}>
                        {counter.title === "CARROS VENDIDOS" ? "+" : ""}
                        {counter.title === "CARROS EM ESTOQUE" ? "+" : ""}
                        <Counter key={`counter-${counter.title}-${counter.stop}-${key}`} max={counter.stop} />
                        {counter.title === "CARROS VENDIDOS" ? "mil" : ""}
                      </span>
                    </div>
                    <h6 className="counter-title" style={{
                      fontSize: isMobile ? '12px' : 'inherit',
                      lineHeight: isMobile ? '1.2' : 'inherit',
                      textAlign: 'center',
                      whiteSpace: isMobile ? 'normal' : 'inherit',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      wordBreak: isMobile ? 'break-word' : 'inherit'
                    }}>{counter.title}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
