import React, { useState, useEffect } from "react";
import RelatedCars from "./RelatedCars";
import Overview from "./sections/Overview";
import Description from "./sections/Description";
import Features from "./sections/Features";
import Specifications from "./sections/Specifications";
// Removido: import FinancingCredereFixed - Credere agora é carregado automaticamente via script
import { Gallery, Item } from "react-photoswipe-gallery";
import ModalVideo from "react-modal-video";
import { Link } from "react-router-dom";
import LucideIcon from '../icons/LucideIcon';
import ContactModal from '../common/ContactModal';
import BrandLogo from '../BrandLogo';
import LocalSEOText from '../seo/LocalSEOText';
import '../../styles/contact-modal.css';
import '../../styles/brand-logo.css';

export default function Single1Boxcar({ carItem }) {
  const [isOpen, setOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [customTags, setCustomTags] = useState([]);
  const [isMounted, setIsMounted] = useState(true);
  const [initialMessage, setInitialMessage] = useState('');

  // Garantir que o container credere-pnp existe quando o componente montar
  useEffect(() => {
    if (!document.getElementById('credere-pnp')) {
      const container = document.createElement('div');
      container.id = 'credere-pnp';
      document.body.appendChild(container);
      console.log('✅ Container credere-pnp criado via componente');
    }
  }, []);

  // Cleanup de componente: proteger contra atualizações após unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  // ✅ SISTEMA CORRETO: usar campo 'photos' (array de URLs da Autoconf)
  const getValidImages = () => {
    const images = [];
    
    // Usar campo 'photos' (sistema principal)
    if (carItem?.photos && Array.isArray(carItem.photos)) {
      carItem.photos.forEach(img => {
        if (img && typeof img === 'string' && img.trim() && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    
    // Fallback para sistema legado (compatibilidade)
    if (images.length === 0 && carItem?.imagens && Array.isArray(carItem.imagens)) {
      carItem.imagens.forEach(img => {
        if (img && typeof img === 'string' && img.trim() && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    
    // Se não houver imagens válidas, usar imagem padrão
    if (images.length === 0) {
      images.push("/images/resource/inventory1-1.jpg");
    }
    
    return images;
  };

  const validImages = getValidImages();
  const mainImage = validImages[0];
  const thumbnailImages = validImages.slice(1);

  // Atualizar título da página dinamicamente
  useEffect(() => {
    if (carItem) {
      const vehicleTitle = `${carItem.marca || ''} ${carItem.modelo || ''} ${carItem.versao || ''} ${carItem.ano_modelo || carItem.ano_fabricacao || ''}`.trim();
      document.title = `${vehicleTitle} - Átria Veículos`;
    }
  }, [carItem]);

  // JSON-LD para breadcrumb (id único; não interfere no estoque)
  useEffect(()=>{
    const id='jsonld-breadcrumb-vehicle';
    const brand=carItem?.brand||carItem?.marca||'';
    const model=carItem?.model||carItem?.modelo||'';
    const year =carItem?.year ||carItem?.ano_modelo||carItem?.ano_fabricacao||(carItem?.title?.match(/(20\d{2}|19\d{2})/)?.[1]??'');
    const data={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":"Início","item":"https://www.atriaveiculos.com/"},
      {"@type":"ListItem","position":2,"name":"Estoque de Veículos","item":"https://www.atriaveiculos.com/estoque"},
      {"@type":"ListItem","position":3,"name":`${brand} ${model} ${year}`.trim(),"item":window.location.href}
    ]};
    let s=document.getElementById(id);
    if(!s){ s=document.createElement('script'); s.id=id; s.type='application/ld+json'; document.head.appendChild(s); }
    s.text=JSON.stringify(data);
    return()=>document.getElementById(id)?.remove();
  },[carItem?.brand,carItem?.marca,carItem?.model,carItem?.modelo,carItem?.year,carItem?.ano_modelo,carItem?.ano_fabricacao,carItem?.title]);

  // Carregar tags personalizadas do Firebase com lazy loading
  useEffect(() => {
    const loadCustomTags = async () => {
      try {
        // Usar firebaseLoader para carregar Firebase dinamicamente
        const { getFirestore } = await import('../../utils/firebaseLoader');
        const { collection, getDocs } = await import('firebase/firestore');
        
        const db = await getFirestore();
        const tagsCollection = collection(db, 'tags_customizadas');
        const tagsSnapshot = await getDocs(tagsCollection);
        const tagsData = tagsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (isMounted) {
          setCustomTags(tagsData);
        }
      } catch (error) {
        console.error('Erro ao carregar tags personalizadas:', error);
        if (isMounted) {
          setCustomTags([]);
        }
      }
    };
    
    // Carregar tags imediatamente
    loadCustomTags();
  }, []);

  // Função para obter tag personalizada por nome (sistema simplificado)
  const getCustomTagByName = (tagName) => {
    return customTags.find(tag => tag.nome === tagName);
  };

  // Funções do modal
  const openModal = () => {
    const currentUrl = window.location.href;
    const defaultMessage = `Olá, tenho interesse em saber mais sobre este veículo:
Marca: ${carItem?.marca || 'N/A'}
Modelo: ${carItem?.modelo || 'N/A'}
Ano: ${carItem?.ano_modelo || carItem?.ano || 'N/A'}
Link do anúncio: ${currentUrl}

Aguardo mais informações sobre disponibilidade, condições e formas de pagamento.`;
    
    setInitialMessage(defaultMessage);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      // Preparar dados do lead
      const leadData = {
        nome: formData.nome.trim(),
        telefone: formData.celular.trim(),
        email: formData.email.trim() || '',
        mensagem: formData.mensagem.trim(),
        modelo: `${carItem?.marca || ''} ${carItem?.modelo || ''} ${carItem?.versao || ''}`.trim(),
        canal: 'Formulário Veículo Individual'
      };

      // Enviar para o endpoint de leads
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Lead enviado com sucesso:', result);
        
        // Tracking para GA4/Meta Pixel
        if (typeof gtag !== 'undefined') {
          gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: 'contact_form_vehicle'
          });
        }
        
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        closeModal();
        
        // Limpar formulário
        setFormData({
          nome: '',
          celular: '',
          email: '',
          mensagem: ''
        });
        
      } else {
        const error = await response.json();
        console.error('Erro ao enviar lead:', error);
        alert('Erro ao enviar mensagem. Tente novamente ou entre em contato via WhatsApp.');
      }
      
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao enviar mensagem. Verifique sua conexão e tente novamente.');
    }
  };

  // Dados do veículo com fallbacks
  const vehicleTitle = carItem?.modelo || "Veículo";
  const vehicleBrand = carItem?.marca || "";
  const vehicleVersion = carItem?.versao || "";
  const vehicleYear = carItem?.ano_modelo || carItem?.ano_fabricacao || "N/A";
  const vehicleKm = carItem?.km ? `${carItem.km.toLocaleString()} km` : "N/A";
  const vehicleTransmission = carItem?.cambio || "N/A";
  const vehicleFuel = carItem?.combustivel || "N/A";
  // Função para renderizar preço baseado no campo mostrar_de_por
  const renderVehiclePrice = () => {
    if (!carItem?.preco) return "Consulte";
    
    const precoAtual = `R$ ${carItem.preco.toLocaleString()}`;
    const precoDe = carItem.preco_de && parseFloat(carItem.preco_de) > parseFloat(carItem.preco) 
      ? `R$ ${carItem.preco_de.toLocaleString()}` 
      : null;

    // Verificar se deve mostrar preço De/Por baseado no campo mostrar_de_por
    if (carItem.mostrar_de_por && precoDe) {
      return (
        <div>
          <span style={{ 
            color: '#6b7280', 
            textDecoration: 'line-through', 
            fontSize: '18px',
            display: 'block'
          }}>
            DE {precoDe}
          </span>
          <span style={{ 
            color: '#1A75FF', 
            fontWeight: 'bold',
            fontSize: '28px'
          }}>
            POR {precoAtual}
          </span>
        </div>
      );
    }

    // Exibir apenas preço principal quando mostrar_de_por for false ou não definido
    return precoAtual;
  };

  // Função para obter preço limpo como número
  const getCleanPriceValue = () => {
    if (!carItem?.preco) return '0';
    return carItem.preco.toString().replace(/[^\d]/g, '').trim();
  };

  return (
    <>
      {/* Schema.org JSON-LD para plugin Credere */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Car",
            brand: carItem?.marca || "",
            model: carItem?.modelo || "",
            vehicleModelDate: carItem?.ano_modelo || carItem?.ano_fabricacao || carItem?.ano || "",
            price: Number(
              carItem?.preco
                ?.toString()
                ?.replace("R$", "")
                ?.replace(".", "")
                ?.replace(",", "")
                ?.trim()
            ) || 0
          })
        }}
      />
      
      <section 
        className="inventory-section pb-0 layout-radius" 
        style={{ paddingBottom: '40px' }}
        data-vehicle-brand={carItem?.marca || ''}
        data-vehicle-model={carItem?.modelo || ''}
        data-vehicle-year={carItem?.ano_modelo || carItem?.ano_fabricacao || carItem?.ano || ''}
        data-vehicle-price={getCleanPriceValue()}
        data-financed-amount={getCleanPriceValue()}
      >
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            {/* Breadcrumb */}
            <nav id="bc-veiculo" aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/">Início</Link></li>
                <li className="bc-sep" aria-hidden="true">/</li>
                <li><Link to="/estoque">Estoque de Veículos</Link></li>
                <li className="bc-sep" aria-hidden="true">/</li>
                <li aria-current="page">
                  {`${(carItem?.brand||carItem?.marca)} ${(carItem?.model||carItem?.modelo)} ${(carItem?.year||carItem?.ano_modelo||carItem?.ano_fabricacao||(carItem?.title?.match(/(20\d{2}|19\d{2})/)?.[1]??''))}`}
                </li>
              </ol>
            </nav>
            <h2 className="title">{`${vehicleBrand} ${vehicleTitle}`}</h2>
            {/* Tags acima do título */}
            <div className="mb-4">
              {/* Tag de Promoção */}
              {carItem?.promocao && (
                <span className="inline-block bg-red-600 text-white text-xs px-3 py-1 rounded shadow font-semibold mr-2">
                  Promoção!
                </span>
              )}
              
              {/* Tag Personalizada */}
              {(() => {
                // Obter tag personalizada do veículo
                const validTag = (() => {
                  const currentTag = carItem?.tag || carItem?.custom_tag;
                  
                  if (!currentTag) return null;
                  
                  // Se a tag é um objeto (sistema padronizado)
                  if (typeof currentTag === 'object' && currentTag.nome) {
                    return currentTag;
                  }
                  
                  // Se a tag é uma string (sistema legado)
                  return getCustomTagByName(currentTag);
                })();
                
                // Renderizar apenas se for tag válida
                if (!validTag) return null;
                
                return (
                  <span 
                    className="inline-flex items-center gap-2 text-white text-sm px-3 py-1 rounded-full shadow font-semibold uppercase tracking-wide mr-2"
                    style={{
                      backgroundColor: validTag.cor || '#1A75FF',
                      borderRadius: '20px'
                    }}
                  >
                    {validTag.icone && (
                      <LucideIcon name={validTag.icone} size={14} color="white" />
                    )}
                    <span style={{ marginLeft: validTag.icone ? '4px' : '0' }}>
                      {validTag.nome}
                    </span>
                  </span>
                );
              })()}
            </div>
            <div className="text mb-4">{vehicleVersion}</div>
            <ul className="spectes-list">
              <li>
                <span>
                  <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/spec1-1.svg" width={18} height={18} alt="" />
                  {vehicleYear}
                </span>
              </li>
              <li>
                <span>
                  <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/spec1-2.svg" width={18} height={18} alt="" />
                  {vehicleKm}
                </span>
              </li>
              <li>
                <span>
                  <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/spec1-3.svg" width={18} height={18} alt="" />
                  {vehicleTransmission}
                </span>
              </li>
              <li>
                <span>
                  <img fetchpriority="low" decoding="async" loading="lazy" src="/images/resource/spec1-4.svg" width={18} height={18} alt="" />
                  {vehicleFuel}
                </span>
              </li>
            </ul>
            <div className="content-box content-box-aligned">
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
              <h3 className="title">{renderVehiclePrice()}</h3>
              
              {/* Local SEO Text - Campinas-SP */}
              <LocalSEOText style={{ marginBottom: '12px' }} />
              
              <span>
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_163_10380)">
                    <path
                      d="M7.8047 17.4287C7.80429 17.4287 7.80378 17.4287 7.80326 17.4287C7.2752 17.4283 6.77865 17.2223 6.40539 16.8484L1.14802 11.5835C0.379045 10.8131 0.379045 9.55955 1.14802 8.78923L8.23503 1.68863C8.96538 0.956841 9.93715 0.553711 10.9712 0.553711H15.4676C16.5579 0.553711 17.4451 1.44072 17.4451 2.53125V7.01377C17.4451 8.04714 17.0424 9.01851 16.3113 9.74875L9.20227 16.8504C8.8288 17.2233 8.33246 17.4287 7.8047 17.4287ZM10.9712 1.87207C10.2898 1.87207 9.64948 2.1377 9.16818 2.61993L2.08107 9.72053C1.82471 9.97741 1.82471 10.3952 2.08107 10.652L7.33844 15.9169C7.46276 16.0414 7.62817 16.1102 7.80429 16.1104H7.80481C7.98073 16.1104 8.14614 16.0419 8.27056 15.9176L15.3796 8.81612C15.8614 8.33492 16.1267 7.69469 16.1267 7.01377V2.53125C16.1267 2.16777 15.831 1.87207 15.4676 1.87207H10.9712ZM12.6659 7.24438C11.5755 7.24438 10.6884 6.35738 10.6884 5.26685C10.6884 4.17632 11.5755 3.28931 12.6659 3.28931C13.7564 3.28931 14.6435 4.17632 14.6435 5.26685C14.6435 6.35738 13.7564 7.24438 12.6659 7.24438ZM12.6659 4.60767C12.3025 4.60767 12.0068 4.90337 12.0068 5.26685C12.0068 5.63032 12.3025 5.92603 12.6659 5.92603C13.0295 5.92603 13.3251 5.63032 13.3251 5.26685C13.3251 4.90337 13.0295 4.60767 12.6659 4.60767Z"
                      fill="#050B20"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_163_10380">
                      <rect width={18} height={18} fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Fazer uma Oferta
              </span>
            </div>
          </div>
          
          <Gallery options={{
            zoom: true,
            close: true,
            counter: true,
            arrowKeys: true,
            preload: [1, 1],
            bgOpacity: 0.95,
            spacing: 0.1,
            allowPanToNext: true,
            maxSpreadZoom: 3,
            getDoubleTapZoom: (isMouseClick, item) => {
              if (isMouseClick) {
                return item.initialZoomLevel < 0.7 ? 1 : 1.5;
              } else {
                return item.initialZoomLevel < 0.7 ? 1.5 : 2.5;
              }
            },
            wheelToZoom: true,
            pinchToZoom: true
          }}>
            <div className="gallery-sec asymmetric-gallery">
              <div className="gallery-container">
                {/* Foto Principal - Lado Esquerdo */}
                <div className="main-photo-container">
                  <Item
                    original={mainImage}
                    thumbnail={mainImage}
                    width={800}
                    height={550}
                  >
                    {({ ref, open }) => (
                      <div className="main-photo-wrapper" onClick={open}>
                        <img fetchpriority="low" decoding="async" ref={ref} alt={`${vehicleBrand} ${vehicleTitle}`} src={mainImage} className="main-photo w-full rounded-lg" loading="lazy" srcSet={`${mainImage}?w=400 400w, ${mainImage}?w=800 800w, ${mainImage}?w=1200 1200w`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 500px" />
                      </div>
                    )}
                  </Item>
                </div>

                {/* Grid de Miniaturas - Lado Direito */}
                <div className="thumbnails-grid">
                  {validImages.slice(1).map((image, index) => {
                    const isLastVisible = false; // Removemos o overlay pois queremos mostrar todas as fotos
                    const remainingPhotos = 0;
                    const showOverlay = false;

                    return (
                      <div key={index} className="thumbnail-item">
                        <Item
                          original={image}
                          thumbnail={image}
                          width={800}
                          height={550}
                        >
                          {({ ref, open }) => (
                            <div className="thumbnail-wrapper" onClick={open}>
                              <img fetchpriority="low" decoding="async" ref={ref} alt={`${vehicleBrand} ${vehicleTitle} - Foto ${index + 2}`} src={image} className="thumbnail-photo" loading="lazy" srcSet={`${image}?w=200 200w, ${image}?w=400 400w`} sizes="200px" />
                              {showOverlay && (
                                <div className="photo-overlay">
                                  <span className="overlay-text">
                                    Ver todas as fotos
                                  </span>
                                  <span className="photo-count">
                                    +{remainingPhotos}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Item>
                      </div>
                    );
                  })}


                </div>
              </div>
            </div>
          </Gallery>
          
          <div className="row">
            <div className="inspection-column col-lg-8 col-md-12 col-sm-12">
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
                {/* specifications-sec */}
                <div className="specifications-sec">
                  <Specifications carItem={carItem} />
                </div>
                <div className="form-box">
                  {/* Container onde o Credere será injetado automaticamente */}
                  <div className="financing-section">
                    <div className="container">
                      <div className="row">
                        <div className="col-12">
                          <h3 className="text-center mb-4">💳 Simule seu Financiamento</h3>
                          <div id="credere-pnp"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="side-bar-column style-1 col-lg-4 col-md-12 col-sm-12">
              <div className="inner-column">
                <div className="contact-box modern-dealer-cta">
                  {/* Header da Concessionária */}
                  <div className="dealer-header">
                    <img 
                      fetchpriority="low" 
                      decoding="async" 
                      loading="lazy" 
                      src="https://res.cloudinary.com/dyngqkiyl/image/upload/v1754777610/Logo_Atria_reom72.png" 
                      alt="Átria Veículos" 
                      className="dealer-logo" 
                    />
                    <span className="dealer-text">
                      Há 12 anos oferecendo veículos com qualidade e segurança
                    </span>
                  </div>

                  {/* CTAs Principais */}
                  <div className="primary-ctas">
                    <a 
                      href="https://wa.me/5519996525211?text=Olá! Tenho interesse neste veículo e gostaria de mais informações." 
                      className="cta-whatsapp"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <div className="cta-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516" fill="#25D366"/>
                        </svg>
                      </div>
                      <div className="cta-content">
                        <div className="cta-title">Falar no WhatsApp</div>
                      </div>
                    </a>

                    <a href="tel:+5519996525211" className="cta-phone">
                      <div className="cta-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#1A75FF"/>
                        </svg>
                      </div>
                      <div className="cta-content">
                        <div className="cta-title">Ligar Agora</div>
                      </div>
                    </a>

                    <button onClick={openModal} className="cta-message">
                      <div className="cta-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <div className="cta-content">
                        <div className="cta-title">Enviar mensagem</div>
                      </div>
                    </button>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="dealer-features">
                    <div className="feature-item">
                      <div className="feature-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div className="feature-text">
                        <strong>3 Lojas em Campinas</strong><br/>
                        <small>Abolição, Campos Elíseos, Guanabara</small>
                      </div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
                          <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
                          <path d="M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0v-6h-8m0 -5h2l3 5"/>
                        </svg>
                      </div>
                      <div className="feature-text">
                        <strong>+250 Carros em Estoque</strong><br/>
                        <small>Todas as marcas e modelos</small>
                      </div>
                    </div>
                  </div>

                  {/* CTA Secundário */}
                  <a href="/estoque" className="cta-secondary">
                    Ver todo nosso estoque
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <g clipPath="url(#clip0_881_7563)">
                        <path
                          d="M13.6111 0H5.05558C4.84062 0 4.66668 0.173943 4.66668 0.388901C4.66668 0.603859 4.84062 0.777802 5.05558 0.777802H12.6723L0.113941 13.3362C-0.0379805 13.4881 -0.0379805 13.7342 0.113941 13.8861C0.189884 13.962 0.289415 14 0.38891 14C0.488405 14 0.5879 13.962 0.663879 13.8861L13.2222 1.3277V8.94447C13.2222 9.15943 13.3962 9.33337 13.6111 9.33337C13.8261 9.33337 14 9.15943 14 8.94447V0.388901C14 0.173943 13.8261 0 13.6111 0Z"
                          fill="currentColor"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_881_7563">
                          <rect width={14} height={14} fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* cars-section-three */}
        <RelatedCars currentVehicle={carItem} />
        {/* End shop section two */}
      </section>
      
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="7e90gBu4pas"
        onClose={() => setOpen(false)}
      />
      
      {/* CSS Otimizado - Galeria e Responsividade */}
      <style>{`
        /* Layout Assimétrico da Galeria */
        .asymmetric-gallery {
          margin-bottom: 30px;
        }
        
        .gallery-container {
          display: flex;
          gap: 8px;
          height: 400px;
        }
        
        /* Foto Principal */
        .main-photo-container {
          flex: 1;
          height: 100%;
        }
        
        .main-photo-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .main-photo-wrapper:hover {
          transform: scale(1.02);
        }
        
        .main-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        /* Grid de Miniaturas */
        .thumbnails-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 8px;
          width: 300px;
          height: 100%;
          max-height: 450px;
          overflow-y: auto;
        }
        
        .thumbnail-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .thumbnail-wrapper {
          width: 100%;
          height: 100%;
          cursor: pointer;
          position: relative;
          transition: transform 0.3s ease;
        }
        
        .thumbnail-wrapper:hover {
          transform: scale(1.05);
        }
        
        .thumbnail-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        
        /* Overlay "Ver todas as fotos" */
        .photo-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }
        
        .overlay-text {
          font-size: 12px;
          margin-bottom: 4px;
          text-align: center;
        }
        
        .photo-count {
          font-size: 18px;
          font-weight: 700;
        }
        
        /* Lightbox Responsivo e Mobile */
        .pswp__img {
          object-fit: contain !important;
        }
        
        /* Mobile - Layout Vertical */
        @media (max-width: 768px) {
          .gallery-container {
            flex-direction: column;
            height: auto;
            gap: 12px;
          }
          
          .main-photo-container {
            height: 250px;
          }
          
          .thumbnails-grid {
            width: 100%;
            height: auto;
            max-height: 300px;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 8px;
            overflow-y: auto;
          }
          
          .overlay-text {
            font-size: 10px;
          }
          
          .photo-count {
            font-size: 14px;
          }
          
          /* Lightbox Mobile Portrait */
          .pswp__img {
            width: 100vw !important;
            height: auto !important;
            max-height: 70vh !important;
            object-fit: contain !important;
          }
        }
        
        /* Mobile Landscape */
        @media (max-width: 768px) and (orientation: landscape) {
          .gallery-container {
            height: 280px;
          }
          
          .main-photo-container {
            height: 100%;
          }
          
          .thumbnails-grid {
            height: auto;
            max-height: 400px;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            overflow-y: auto;
          }
          
          .pswp__img {
            height: 100vh !important;
            width: auto !important;
            max-width: 90vw !important;
            object-fit: contain !important;
          }
        }
        
        /* Tablet */
        @media (min-width: 769px) and (max-width: 1024px) {
          .thumbnails-grid {
            width: 250px;
          }
          
          .gallery-container {
            height: 350px;
          }
        }
        
        /* Desktop Large */
        @media (min-width: 1200px) {
          .thumbnails-grid {
            width: 350px;
          }
          
          .gallery-container {
            height: 450px;
          }
        }
        
        /* PhotoSwipe Customizations */
        .pswp {
          background: rgba(0, 0, 0, 0.95) !important;
        }
        
        .pswp__container {
          touch-action: pan-y pinch-zoom !important;
        }
        
        .pswp__img {
          user-select: none;
          touch-action: pan-y pinch-zoom;
        }
        
        /* Sidebar da Concessionária - Mobile */
        @media (max-width: 768px) {
          .dealer-contact-responsive {
            margin: 20px 0 !important;
            padding: 20px 15px !important;
          }
          
          .dealer-logo {
            width: auto !important;
            height: auto !important;
          }
          
          .dealer-title {
            font-size: 16px !important;
            margin-bottom: 5px !important;
          }
          
          .dealer-subtitle {
            font-size: 13px !important;
            margin-bottom: 15px !important;
          }
          
          .dealer-contact-list li a {
            font-size: 13px !important;
            padding: 8px 0 !important;
          }
          
          .dealer-btn-box {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .dealer-btn-message,
          .dealer-btn-whatsapp,
          .dealer-btn-inventory {
            font-size: 12px !important;
            padding: 10px 15px !important;
            text-align: center !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
        
        @media (max-width: 480px) {
          .dealer-contact-responsive {
            padding: 15px 10px !important;
          }
          
          .dealer-logo {
            width: 40px !important;
          }
          
          .dealer-title {
            font-size: 15px !important;
          }
          
          .dealer-subtitle {
            font-size: 12px !important;
          }
          
          .dealer-contact-list li a {
            font-size: 12px !important;
          }
          
          .dealer-btn-message,
          .dealer-btn-whatsapp,
          .dealer-btn-inventory {
            font-size: 11px !important;
            padding: 8px 12px !important;
          }
          
          .thumbnail-wrapper {
            width: 100px;
            height: 100px;
          }
        }
        
        /* CSS para Nova Seção CTA da Concessionária */
        .modern-dealer-cta {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #f0f0f0;
        }

        .dealer-header {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .dealer-logo {
          max-height: 32px;
          width: auto;
          flex-shrink: 0;
          filter: hue-rotate(190deg) saturate(4);
        }

        @media (min-width: 768px) {
          .dealer-logo {
            max-height: 40px;
          }
        }

        .dealer-text {
          font-size: 14px;
          line-height: 1.4;
          color: #6b7280;
          margin: 0;
          flex: 1;
        }

        .primary-ctas {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .cta-whatsapp, .cta-phone {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .cta-whatsapp {
          background: #25D366;
          color: white;
        }

        .cta-whatsapp:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
          color: white;
        }

        .cta-phone {
          background: #1A75FF;
          color: white;
        }

        .cta-phone:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26, 117, 255, 0.3);
          color: white;
        }

        .cta-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cta-content {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .cta-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .cta-subtitle {
          font-size: 14px;
          opacity: 0.9;
        }

        .dealer-features {
          margin-bottom: 20px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .feature-item:last-child {
          margin-bottom: 0;
        }

        .feature-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          color: #6b7280;
        }

        .feature-text {
          flex: 1;
          font-size: 14px;
          line-height: 1.4;
        }

        .feature-text strong {
          color: #1f2937;
          font-weight: 600;
        }

        .feature-text small {
          color: #6b7280;
        }

        .cta-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          background: white;
          color: #1A75FF;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .cta-secondary:hover {
          background: #1A75FF;
          color: white;
          border-color: #1A75FF;
          transform: translateY(-1px);
        }



        /* Responsividade Mobile */
        @media (max-width: 768px) {
          .modern-dealer-cta {
            padding: 20px;
          }

          .dealer-header {
            gap: 8px;
          }

          .dealer-name {
            font-size: 18px;
          }

          .cta-whatsapp, .cta-phone {
            padding: 14px;
            gap: 12px;
            width: 100%;
            justify-content: flex-start;
          }

          .cta-icon {
            width: 40px;
            height: 40px;
          }

          .cta-title {
            font-size: 15px;
          }

          .cta-secondary {
            width: 100%;
          }
        }
      `}</style>

      {/* Modal de Contato com createPortal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        carItem={carItem}
        initialMessage={initialMessage}
      />

      {/* CSS do Botão CTA */}
      <style>{`
        .cta-message {
          background: #7C3AED;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          padding: 16px 20px;
          border-radius: 12px;
          font-weight: 500;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          text-decoration: none;
        }

        .cta-message:hover {
          background: #6D28D9;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
        }
      `}</style>
    </>
  );
}