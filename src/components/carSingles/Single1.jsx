import React, { useState } from "react";
import RelatedCars from "./RelatedCars";

import Overview from "./sections/Overview";
import Description from "./sections/Description";
import Features from "./sections/Features";
import Faqs from "./sections/Faqs";

// import { Gallery, Item } from "react-photoswipe-gallery";
import ModalVideo from "react-modal-video";
import { Link } from "react-router-dom";
import VehicleCallButton from "../VehicleCallButton";
export default function Single1({ carItem }) {
  const [isOpen, setOpen] = useState(false);
  
  // Flag de fallback para navegação dura (feature flag desativada por padrão)
  const BREADCRUMB_HARD_NAV = false;
  
  // Debug logs para identificar o formato das fotos
  console.log('▶️ carItem.fotos raw:', carItem?.fotos);
  
  // Processamento melhorado das fotos do veículo
  const fotos = (() => {
    if (!carItem || !carItem.fotos) return [];

    // Se veio como string CSV:
    if (typeof carItem.fotos === 'string') {
      return carItem.fotos
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);
    }

    // Se veio como array:
    if (Array.isArray(carItem.fotos)) {
      // se veio array de objetos, extrai a URL
      return carItem.fotos.map(item =>
        typeof item === 'object'
          ? item.url || item.src || item.path   // tenta diferentes campos
          : item
      ).filter(Boolean);
    }

    return [];
  })();
  
  console.log('✅ Fotos processadas:', fotos);
  
  // Definir imagens para mostrar com fallback e filtrar apenas strings válidas
  let imagensValidas = (
    fotos.length
      ? fotos
      : [carItem?.imagem_principal].filter(Boolean)
  )
    .filter(src => typeof src === 'string' && src.trim() !== '');  // mantém só strings válidas
  
  // Se não tiver nenhuma imagem válida, usar fallback padrão
  if (imagensValidas.length === 0) {
    imagensValidas = ['/images/resource/inventory1-1.jpg'];
  }
  
  console.log('🖼️ Imagens válidas para mostrar:', imagensValidas);
  console.log('📸 Total de imagens:', imagensValidas.length);
  console.log('📸 Todas as imagens do grid pequeno:', imagensValidas.slice(1));
  
  // Lógica de preços De/Por usando dados reais
  const originalPrice = carItem?.preco_de ? carItem.preco_de : null;
  const currentPrice = carItem?.preco ? carItem.preco : 0;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  
  // Informações do veículo para WhatsApp
  const vehicleTitle = `${carItem?.marca || ''} ${carItem?.modelo || ''} ${carItem?.versao || ''}`.trim();
  const whatsappNumber = "5519996525211"; // Número da concessionária
  const whatsappMessage = `Olá! Tenho interesse no veículo ${vehicleTitle} - Placa: ${carItem?.placa || ''}`;

  // Função para tratar erro de carregamento de imagens
  const handleImageError = (e) => {
    console.log('❌ Erro ao carregar imagem:', e.target.src);
    e.target.src = '/images/resource/inventory1-1.jpg'; // Fallback image
  };



  if (!carItem) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Carregando veículo...</div>;
  }

  return (
    <>
      <style>{`
        .price-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .price-label {
          font-size: 14px;
          color: #666;
          font-weight: 400;
        }
        .price-old {
          font-size: 18px;
          color: #999;
          text-decoration: line-through;
          font-weight: 500;
        }
        .price-label-por {
          font-size: 16px;
          color: #666;
          font-weight: 400;
        }
        .boxcar-title-three .title {
          display: flex;
          align-items: baseline;
          gap: 8px;
          color: #ff6b35;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 15px;
          margin-top: 0;
        }
        @media (max-width: 768px) {
          .credit-approval-btn {
            margin-left: 0 !important;
            display: inline-flex !important;
            margin-top: 10px !important;
          }
          .whatsapp-interesse-btn {
            display: inline-flex !important;
          }
          .content-box {
            text-align: left !important;
          }
          .gallery-sec .image-box img {
            border-radius: 8px !important;
          }
          .price-display {
            padding: 16px 0 !important;
            border-bottom: 1px solid #e5e7eb;
          }
        }
        
        /* Melhorias no carrossel de imagens */
        .gallery-sec .image-box {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        
        .gallery-sec .image-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        .gallery-sec img {
          transition: transform 0.3s ease;
        }
        
        .gallery-sec .image-box:hover img {
          transform: scale(1.02);
        }
        
        /* Responsividade melhorada */
        @media (max-width: 768px) {
          .price-display span {
            font-size: 18px !important;
          }
          .price-display .line-through {
            font-size: 12px !important;
          }
        }
      `}</style>
      <section className="inventory-section pb-0 layout-radius">
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            {/* Breadcrumb removido - agora gerenciado por VehicleBreadcrumb component */}
            <h2>{carItem.marca} {carItem.modelo}</h2>
            <div className="text">{carItem.versao || carItem.modelo}</div>
            <ul className="spectes-list">
              <li>
                <span>
                  <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/spec1-1.svg" width={18} height={18} alt="" />
                  {carItem.ano_modelo || carItem.ano_fabricacao || '2023'}
                </span>
              </li>
              <li>
                <span>
                  <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/spec1-2.svg" width={18} height={18} alt="" />
                  {carItem.km ? `${carItem.km.toLocaleString()} km` : 'N/A'}
                </span>
              </li>
              <li>
                <span>
                  <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/spec1-3.svg" width={18} height={18} alt="" />
                  {carItem.cambio || 'Manual'}
                </span>
              </li>
              <li>
                <span>
                  <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/spec1-4.svg" width={18} height={18} alt="" />
                  {carItem.combustivel || 'Flex'}
                </span>
              </li>
            </ul>
            <div className="content-box">
              <div className="btn-box">
                <div className="share-btn">
                  <span>Compartilhar</span>
                  <a href="#" className="share">
                    <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/share.svg" width={12} height={12} alt="" />
                  </a>
                </div>
                <div className="share-btn">
                  <span>Salvar</span>
                  <a href="#" className="share">
                    <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/share1-1.svg" width={12} height={12} alt="" />
                  </a>
                </div>
              </div>
              <div className="price-display" style={{ marginBottom: '20px' }}>
                {hasDiscount ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      textDecoration: 'line-through', 
                      color: '#6b7280', 
                      fontSize: '14px',
                      fontWeight: '400'
                    }}>
                      DE R$ {originalPrice.toLocaleString('pt-BR')}
                    </span>
                    <span style={{ 
                      color: '#1A75FF', 
                      fontWeight: 'bold', 
                      fontSize: '24px',
                      lineHeight: '1'
                    }}>
                      POR R$ {currentPrice.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ) : (
                  <span style={{ 
                    color: '#1A75FF', 
                    fontWeight: 'bold', 
                    fontSize: '24px',
                    lineHeight: '1'
                  }}>
                    R$ {currentPrice.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#c2ffe1',
                    color: '#238626',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                  </svg>
                  Tenho interesse
                </a>
                <Link 
                  to="/loan-calculator"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#1a2332',
                    color: '#ffffff',
                    borderRadius: '25px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
                  </svg>
                  Aprove meu crédito online
                </Link>
                
                <VehicleCallButton 
                  vehicle={carItem}
                  className="btn-call-primary"
                />
              </div>
            </div>
          </div>
          <div className="gallery-sec">
            <div className="row">
              {/* Imagem principal */}
              <div className="image-column item1 col-lg-7 col-md-12 col-sm-12">
                <div className="inner-column">
                  <div className="image-box">
                    <figure className="image">
                      {imagensValidas[0] ? (
                        <img fetchpriority="low" decoding="async" src={imagensValidas[0]} alt={`${carItem?.placa || 'Veículo'} - Foto Principal`} loading="lazy" style={{ cursor: "pointer", width: "100%", height: "500px", objectFit: "cover", borderRadius: 8 }} onError={(e) => { 
                            e.target.src = "/images/resource/inventory1-1.jpg"; 
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '500px',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                          fontSize: '16px'
                        }}>
                          Imagem não disponível
                        </div>
                      )}
                    </figure>
                  </div>
                </div>
              </div>
              
              {/* Grid de 4 imagens menores 2x2 */}
              <div className="image-column item2 col-lg-5 col-md-12 col-sm-12">
                <div className="inner-column">
                  <div className="row">
                    {[0, 1, 2, 3].map((index) => {
                      const imageIndex = index + 1;
                      const src = imagensValidas[imageIndex];
                      
                      return (
                        <div key={index} className="image-column-two col-6" style={{ marginBottom: '10px', padding: '5px' }}>
                          <div className="inner-column">
                            <div className="image-box">
                              <figure className="image">
                                {src ? (
                                  <img fetchpriority="low" decoding="async" src={src} alt={`${carItem?.placa || 'Veículo'} - Foto ${imageIndex + 1}`} loading="lazy" style={{ cursor: "pointer", width: "100%", height: "245px", objectFit: "cover", borderRadius: 8 }} onError={(e) => { 
                                      e.target.src = "/images/resource/inventory1-1.jpg"; 
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '245px',
                                    backgroundColor: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#9ca3af',
                                    fontSize: '14px',
                                    borderRadius: 8
                                  }}>
                                    Sem foto
                                  </div>
                                )}
                              </figure>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="inspection-column col-lg-12 col-md-12 col-sm-12">
              <div className="inner-column">
                {/* overview-sec */}
                <div className="overview-sec">
                  <Overview carItem={carItem} />
                </div>
                {/* features-sec */}
                <div className="features-sec">
                  <Features carItem={carItem} />
                </div>
                {/* description-sec */}
                <div className="description-sec">
                  <Description carItem={carItem} />
                </div>
                {/* faq-section */}
                <div className="faqs-section pt-0">
                  <div className="inner-container">
                    <Faqs />
                  </div>
                </div>
                {/* End faqs-section */}
              </div>
            </div>

          </div>
        </div>
        {/* cars-section-three */}
        <RelatedCars />
        {/* End shop section two */}
      </section>
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="7e90gBu4pas"
        onClose={() => setOpen(false)}
      />{" "}
    </>
  );
}
