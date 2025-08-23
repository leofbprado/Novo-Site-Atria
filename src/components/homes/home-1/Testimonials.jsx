import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { TestimonialImage } from "../../common/OptimizedImage";
import LucideIcon from "@/components/icons/LucideIcon";
import useOnVisible from "@/utils/useOnVisible";

export default function Testimonials() {
  const [ref, visible] = useOnVisible();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('🔍 Componente Testimonials renderizando...');

  useEffect(() => {
    if (!visible) return;
    const loadTestimonials = async () => {
      console.log('🔍 Carregando depoimentos do Firebase...');
      
      // Timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⏱️ Timeout ao carregar depoimentos');
        setTestimonials([]);
        setLoading(false);
      }, 8000); // 8 second timeout
      
      try {
        // ⚡ Firebase lazy loading - só carrega quando necessário
        const { db } = await import("@/firebase/config");
        const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
        
        const testimonialsRef = collection(db, 'depoimentos');
        const testimonialsQuery = query(testimonialsRef, orderBy('created_at', 'desc'));
        
        // Use Promise.race to implement timeout
        const snapshot = await Promise.race([
          getDocs(testimonialsQuery),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 7000)
          )
        ]);
        
        clearTimeout(timeoutId);
        
        const testimonialsData = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          testimonialsData.push({
            id: doc.id,
            imgSrc: data.foto || data.foto_url || "/images/resource/test-1.jpg",
            rating: data.rating || data.avaliacao || 5,
            name: data.nome || "Cliente",
            position: data.profissao || data.cidade || "Cliente",
            review: data.depoimento || "",
            wowDelay: "100ms"
          });
        });
        
        console.log(`✅ ${testimonialsData.length} depoimentos carregados:`, testimonialsData);
        setTestimonials(testimonialsData);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Erro ao carregar depoimentos:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, [visible]);

  const slickOptions = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    // Configurações de acessibilidade
    accessibility: true,
    focusOnSelect: true,
    pauseOnFocus: true,
    pauseOnHover: true,
    useCSS: true,
    useTransform: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  if (!visible) {
    return (
      <section ref={ref} className="testimonials-section-homepage" style={{ backgroundColor: '#fff', padding: '42px 0', minHeight: '280px' }}>
        <div className="boxcar-container">
          <div className="boxcar-title" style={{ textAlign: 'left', marginBottom: '50px' }}>
            <h2 style={{ color: '#1a2332', fontSize: '40px', fontWeight: '700', margin: 0 }}>O que nossos clientes dizem</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="testimonials-section-homepage" style={{ backgroundColor: '#fff', padding: '42px 0' }}>
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp" style={{ textAlign: 'left', marginBottom: '50px' }}>
          <h2 style={{ color: '#1a2332', fontSize: '40px', fontWeight: '700', margin: 0 }}>O que nossos clientes dizem</h2>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #1A75FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#64748b' }}>Carregando depoimentos...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#64748b' }}>
              Nenhum depoimento disponível no momento.
            </p>
          </div>
        ) : (
          <Slider {...slickOptions} className="testimonial-slider">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card" style={{ padding: '0 15px' }}>
                <div className="testimonial-block" style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.3s ease'
                }}>
                  <div className="inner-box">
                    <div className="row" style={{ alignItems: 'center', margin: 0 }}>
                      <div className="image-column col-lg-4 col-md-12 col-sm-12" style={{ padding: '20px' }}>
                        <div className="inner-column">
                          <div className="image-box">
                            <figure className="image" style={{ margin: 0 }}>
                              <img fetchpriority="low" decoding="async" src={testimonial.imgSrc} alt={`Foto de ${testimonial.name}`} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} loading="lazy" onLoad={() => {
                                  console.log('✅ Testimonial img loaded:', testimonial.imgSrc);
                                }}
                                onError={(e) => {
                                  console.error('❌ Testimonial img error:', testimonial.imgSrc);
                                  e.target.src = 'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9';
                                }}
                              />
                            </figure>
                          </div>
                        </div>
                      </div>
                      <div className="content-column col-lg-8 col-md-12 col-sm-12" style={{ padding: '20px' }}>
                        <div className="inner-column">
                          <ul className="rating" style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px',
                            padding: 0,
                            listStyle: 'none'
                          }}>
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <li key={starIndex} style={{ marginRight: '5px' }}>
                                <LucideIcon name="star" size={14} color="#e1c03f" />
                              </li>
                            ))}
                            <span style={{ 
                              marginLeft: '10px',
                              backgroundColor: '#e1c03f',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '50px',
                              fontSize: '14px',
                              fontWeight: '500'
                            }}>
                              {testimonial.rating}
                            </span>
                          </ul>
                          <h6 className="title" style={{ 
                            fontSize: '18px', 
                            fontWeight: '500',
                            lineHeight: '32px',
                            marginBottom: '8px', 
                            color: '#1a2332' 
                          }}>
                            {testimonial.name}
                          </h6>
                          <span style={{ 
                            color: '#616670', 
                            fontSize: '14px', 
                            lineHeight: '24px',
                            marginBottom: '15px', 
                            display: 'block' 
                          }}>
                            {testimonial.position}
                          </span>
                          <div className="text" style={{ 
                            fontSize: '16px', 
                            lineHeight: '28px', 
                            color: '#1a2332',
                            fontFamily: 'DM Sans, sans-serif'
                          }}>
                            {testimonial.review}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </div>
    </section>
  );
}