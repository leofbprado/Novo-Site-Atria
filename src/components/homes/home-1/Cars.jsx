import { Link } from "react-router-dom";
import { carData } from "@/data/cars";
import Slider from "react-slick";
import { useState, useEffect } from "react";
import LucideIcon from "@/components/icons/LucideIcon";
// Removido import do componentCssLoader por causar erro circular

export default function Cars() {
  const [maisVendidosVehicles, setMaisVendidosVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const sortedItems = maisVendidosVehicles.length > 0 ? maisVendidosVehicles : carData.slice(0, 8); // Fallback para dados estáticos se não houver Firestore
  const [isMobile, setIsMobile] = useState(false);
  const [sliderReady, setSliderReady] = useState(false);
  const [customTags, setCustomTags] = useState([]);
  
  // 🎯 Hook para carregar CSS do carousel de forma lazy
  const [carouselCssLoaded, setCarouselCssLoaded] = useState(false);

  const getCustomTagByName = (tagName) => {
    return customTags.find(tag => tag.nome === tagName);
  };
  
  // Função auxiliar para obter tag de qualquer campo
  const getVehicleTag = (car) => {
    return car.tag || car.custom_tag || null;
  };

  // Função para carregar tags customizadas do Firestore
  const loadCustomTags = async () => {
    try {
      const { db } = await import('@/firebase/config');
      const { collection, getDocs } = await import('firebase/firestore');
      
      const tagsSnapshot = await getDocs(collection(db, 'tags_customizadas'));
      const tags = [];
      tagsSnapshot.forEach((doc) => {
        tags.push({ id: doc.id, ...doc.data() });
      });
      console.log('✅ Tags customizadas carregadas:', tags);
      setCustomTags(tags);
    } catch (error) {
      console.error('❌ Erro ao carregar tags:', error);
    }
  };

  // Função para carregar veículos "Mais Vendidos" do Firestore
  const loadMaisVendidosVehicles = async () => {
    // Timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ Timeout ao carregar veículos mais vendidos');
      setMaisVendidosVehicles([]);
      setLoading(false);
    }, 8000); // 8 second timeout
    
    try {
      setLoading(true);
      
      // ⚡ Firebase lazy loading - só carrega quando necessário
      const { db } = await import('@/firebase/config');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      console.log('🔍 Carregando veículos "Mais Vendidos" do Firestore...');
      
      // Query para buscar apenas veículos com mais_vendidos = true
      const maisVendidosQuery = query(
        collection(db, 'veiculos'),
        where('mais_vendidos', '==', true)
      );
      
      // Use Promise.race to implement timeout
      const querySnapshot = await Promise.race([
        getDocs(maisVendidosQuery),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 7000)
        )
      ]);
      
      clearTimeout(timeoutId);
      const vehicles = [];
      
      querySnapshot.forEach((doc) => {
        const vehicleData = doc.data();
        
        // Debug: verificar dados de tags
        if (vehicleData.tag || vehicleData.custom_tag) {
          console.log('🏷️ Veículo com tag:', {
            marca: vehicleData.marca,
            modelo: vehicleData.modelo,
            tag: vehicleData.tag,
            custom_tag: vehicleData.custom_tag
          });
        }
        
        // Converter formato Firestore para formato esperado pelo componente
        const formattedVehicle = {
          id: doc.id,
          vehicle_uuid: vehicleData.vehicle_uuid,
          title: `${vehicleData.marca} ${vehicleData.modelo}`,
          brand: vehicleData.marca,
          model: vehicleData.modelo,
          version: vehicleData.versao || '',
          price: `R$ ${vehicleData.preco?.toLocaleString('pt-BR')}`,
          oldPrice: vehicleData.preco_de ? `R$ ${vehicleData.preco_de?.toLocaleString('pt-BR')}` : null,
          mostrar_de_por: vehicleData.mostrar_de_por || false,
          mileage: `${vehicleData.km?.toLocaleString('pt-BR')} km`,
          fuel: vehicleData.combustivel || 'Gasolina',
          transmission: vehicleData.cambio || 'Manual',
          year: vehicleData.ano_modelo?.toString() || '2020',
          imgSrc: vehicleData.photos?.[0] || vehicleData.imagem_capa || '/images/resource/car1-1.jpg',
          tag: vehicleData.tag || vehicleData.custom_tag || null, // Tag personalizada como objeto completo
          custom_tag: vehicleData.custom_tag || null, // Campo alternativo para compatibilidade
          promocao: vehicleData.promocao || false, // Campo promocao para tag de Oferta
          placa: vehicleData.placa,
          ordem_mais_vendidos: vehicleData.ordem_mais_vendidos || 999 // Ordem default alta para os sem ordem definida
        };
        
        vehicles.push(formattedVehicle);
      });
      
      // Debug: verificar veículos carregados
      console.log('🚗 Veículos carregados:', vehicles.map(v => ({
        modelo: v.model,
        tag: v.tag,
        custom_tag: v.custom_tag
      })));
      
      // Ordenar por ordem_mais_vendidos (do menor para o maior) e remover duplicatas por UUID
      const uniqueVehicles = [];
      const seenUUIDs = new Set();
      
      vehicles
        .sort((a, b) => (a.ordem_mais_vendidos || 999) - (b.ordem_mais_vendidos || 999))
        .forEach(vehicle => {
          if (vehicle.vehicle_uuid && !seenUUIDs.has(vehicle.vehicle_uuid)) {
            seenUUIDs.add(vehicle.vehicle_uuid);
            uniqueVehicles.push(vehicle);
          }
        });
      
      console.log(`✅ ${uniqueVehicles.length} veículos únicos "Mais Vendidos" carregados e ordenados do Firestore`);
      setMaisVendidosVehicles(uniqueVehicles);
      setLoading(false);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ Erro ao carregar veículos "Mais Vendidos":', error);
      setMaisVendidosVehicles([]);
      setLoading(false);
      // Em caso de erro, usar array vazio para evitar loading infinito
    }
  };

  // Função para renderizar preços DE/POR com base no campo mostrar_de_por
  const renderPrice = (car) => {
    // Parse dos valores removendo "R$" e convertendo para número
    const precoAtual = car.price ? parseFloat(car.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) : 0;
    const precoDe = car.oldPrice ? parseFloat(car.oldPrice.replace('R$', '').replace('.', '').replace(',', '.').trim()) : 0;

    // Verificar se deve mostrar preço De/Por baseado no campo mostrar_de_por (não em tags)
    if (car.mostrar_de_por && precoDe && precoDe > precoAtual) {
      return (
        <div>
          <span style={{ 
            color: '#6b7280', 
            textDecoration: 'line-through', 
            fontSize: isMobile ? '11px' : '12px',
            display: 'block'
          }}>
            DE {car.oldPrice}
          </span>
          <span style={{ 
            color: '#1A75FF', 
            fontWeight: 'bold',
            fontSize: isMobile ? '16px' : '18px'
          }}>
            POR {car.price}
          </span>
        </div>
      );
    }

    // Exibir apenas preço principal quando mostrar_de_por for false ou não definido
    return <span style={{ color: '#1A75FF', fontWeight: 'bold' }}>{car.price}</span>;
  };
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Carregar veículos "Mais Vendidos" do Firestore
    loadMaisVendidosVehicles();
    
    // Carregar tags customizadas
    loadCustomTags();
    
    // Carregar CSS e inicializar carrossel
    const initializeCarousel = async () => {
      console.log('🎯 Inicializando carrossel...');
      
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
        console.log('✅ CSS do carousel carregado');
        setCarouselCssLoaded(true);
        
        // Aguardar um pouco e habilitar slider
        setTimeout(() => {
          console.log('✅ Carrossel habilitado');
          setSliderReady(true);
        }, 50);
        
      } catch (error) {
        console.warn('⚠️ Erro no carrossel:', error);
        setSliderReady(true); // Habilitar mesmo com erro
      }
    };
    
    initializeCarousel();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fix aria-hidden cloned elements
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

  // 🎯 Configurações otimizadas para carrossel touch-friendly
  const options = {
    dots: isMobile, // Pontos de navegação no mobile
    infinite: true,
    slidesToShow: 4,
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
          slidesToShow: 4,
          arrows: true,
          dots: false,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 3,
          arrows: true,
          dots: false,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true,
          centerMode: true,
          centerPadding: '20px',
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true,
          centerMode: true,
          centerPadding: '15px',
        },
      },
    ],
  };
  return (
    <section className="cars-section-three">
      <div className="boxcar-container">
        <div className="boxcar-title">
          <h2>Mais Vendidos</h2>
          <Link to={`/inventory-list-01`} className="btn-title">
            Ver Todos
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
              viewBox="0 0 14 14"
              fill="none"
            >
              <g clipPath="url(#clip0_601_243)">
                <path
                  d="M13.6109 0H5.05533C4.84037 0 4.66643 0.173943 4.66643 0.388901C4.66643 0.603859 4.84037 0.777802 5.05533 0.777802H12.6721L0.113697 13.3362C-0.0382246 13.4881 -0.0382246 13.7342 0.113697 13.8861C0.18964 13.962 0.289171 14 0.388666 14C0.488161 14 0.587656 13.962 0.663635 13.8861L13.222 1.3277V8.94447C13.222 9.15943 13.3959 9.33337 13.6109 9.33337C13.8259 9.33337 13.9998 9.15943 13.9998 8.94447V0.388901C13.9998 0.173943 13.8258 0 13.6109 0Z"
                  fill="#050B20"
                />
              </g>
              <defs>
                <clipPath id="clip0_601_243">
                  <rect width={14} height={14} fill="white" />
                </clipPath>
              </defs>
            </svg>
          </Link>
        </div>

      </div>
      <div
        className="tab-content"
        id="nav-tabContent"
      >
        <div
          className="tab-pane show active"
          id="nav-home"
          role="tabpanel"
          aria-labelledby="nav-home-tab"
        >
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Carregando veículos mais vendidos...
            </div>
          ) : sortedItems.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#6b7280',
              fontSize: '16px'
            }}>
              Nenhum veículo em destaque no momento.
            </div>
          ) : sliderReady && sortedItems.length > 0 ? (
            <Slider {...options}
              className="row car-slider-three slider-layout-1" role="region" aria-label="Carrossel de veículos mais vendidos"
            >
              {[...sortedItems].map((car, index) => (
              <div
                key={index}
                className="box-car car-block-three col-lg-3 col-md-6 col-sm-12"
                style={{
                  padding: isMobile ? '0 5px' : '0 10px'
                }}
              >
                <div className="inner-box" style={{
                  maxWidth: isMobile ? '100%' : 'auto'
                }}>
                  <div className="image-box relative">
                    <div className="image d-block">
                      <Link to={`/veiculo/${car.vehicle_uuid}`}>
                        <img loading="lazy" decoding="async" alt={`Foto do veículo ${car?.title || car?.brand + ' ' + car?.model || 'seminovo'}`} src={(() => {
                            // Processar fotos se for string separada por ponto e vírgula
                            if (car.fotos && typeof car.fotos === 'string') {
                              const fotosArray = car.fotos.split(';').filter(url => url.trim());
                              return fotosArray[0] || car.imgSrc || '/images/resource/car1-1.jpg';
                            }
                            // Fallback para sistema existente
                            return car.imgSrc || car.imagem_capa || car.imagens?.[0] || '/images/resource/car1-1.jpg';
                          })()} 
                          width={isMobile ? 250 : 329} 
                          height={isMobile ? 167 : 220}
                          style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'cover'
                          }}
                         />
                      </Link>
                    </div>
                    
                    {/* Tag de Promoção - Canto Superior Esquerdo */}
                    {car.promocao && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow font-semibold">
                        Oferta
                      </span>
                    )}
                    
                    {/* Tag Personalizada - Canto Superior Direito */}
                    {getVehicleTag(car) && (
                      <div className="absolute top-2 right-2">
                        {(() => {
                          const vehicleTag = getVehicleTag(car);
                          // Se a tag é um objeto (novo sistema)
                          if (typeof vehicleTag === 'object' && vehicleTag.nome) {
                            return (
                              <span 
                                className="text-white text-xs px-3 py-1 rounded-full shadow font-semibold uppercase tracking-wide flex items-center gap-2"
                                style={{
                                  backgroundColor: vehicleTag.cor || '#1A75FF'
                                }}
                              >
                                {vehicleTag.icone && (
                                  <LucideIcon name={vehicleTag.icone} size={12} color="white" />
                                )}
                                {vehicleTag.nome}
                              </span>
                            );
                          }
                          
                          // Se a tag é uma string (sistema antigo)
                          const tag = getCustomTagByName(vehicleTag);
                          if (tag) {
                            return (
                              <span 
                                className="text-white text-xs px-3 py-1 rounded-full shadow font-semibold uppercase tracking-wide flex items-center gap-2"
                                style={{
                                  backgroundColor: tag.cor || '#1A75FF'
                                }}
                              >
                                {tag.icone && (
                                  <LucideIcon name={tag.icone} size={12} color="white" />
                                )}
                                {tag.nome}
                              </span>
                            );
                          }
                          
                          // Fallback para tags sem configuração
                          return (
                            <span className="text-white text-xs px-3 py-1 rounded-full shadow font-semibold uppercase tracking-wide bg-blue-600">
                              {vehicleTag}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                    <Link
                      to={car.placa ? `/estoque/${car.placa}` : `/veiculo-individual/${car.id}`}
                      title=""
                      className="icon-box"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_601_1274)">
                          <path
                            d="M9.39062 12C9.15156 12 8.91671 11.9312 8.71128 11.8009L6.11794 10.1543C6.04701 10.1091 5.95296 10.1096 5.88256 10.1543L3.28869 11.8009C2.8048 12.1082 2.13755 12.0368 1.72722 11.6454C1.47556 11.4047 1.33685 11.079 1.33685 10.728V1.2704C1.33738 0.570053 1.90743 0 2.60778 0H9.39272C10.0931 0 10.6631 0.570053 10.6631 1.2704V10.728C10.6631 11.4294 10.0925 12 9.39062 12ZM6.00025 9.06935C6.24193 9.06935 6.47783 9.13765 6.68169 9.26743L9.27503 10.9135C9.31233 10.9371 9.35069 10.9487 9.39114 10.9487C9.48046 10.9487 9.61286 10.8788 9.61286 10.728V1.2704C9.61233 1.14956 9.51356 1.05079 9.39272 1.05079H2.60778C2.48642 1.05079 2.38817 1.14956 2.38817 1.2704V10.728C2.38817 10.7911 2.41023 10.8436 2.45384 10.8851C2.52582 10.9539 2.63563 10.9708 2.72599 10.9135L5.31934 9.2669C5.52267 9.13765 5.75857 9.06935 6.00025 9.06935Z"
                            fill="black"
                          ></path>
                        </g>
                        <defs>
                          <clippath id="clip0_601_1274">
                            <rect width="12" height="12" fill="white"></rect>
                          </clippath>
                        </defs>
                      </svg>
                    </Link>
                  </div>
                  <div className="content-box" style={{
                    padding: isMobile ? '15px 10px' : '20px 15px'
                  }}>
                    <h6 className="title" style={{
                      fontSize: isMobile ? '14px' : '16px',
                      marginBottom: '8px'
                    }}>
                      <Link to={`/veiculo/${car.vehicle_uuid}`}>
                        {car.title}
                      </Link>
                    </h6>
                    <div className="text" style={{
                      fontSize: isMobile ? '12px' : '14px',
                      marginBottom: '10px'
                    }}>{car.version} {car.year}</div>
                    <ul style={{
                      fontSize: isMobile ? '11px' : '13px',
                      marginBottom: '10px'
                    }}>
                      <li><i className="flaticon-gasoline-pump" /> {car.fuel}</li>
                      <li><i className="flaticon-speedometer" /> {car.mileage}</li>
                      <li><i className="flaticon-gearbox" /> {car.transmission}</li>
                    </ul>
                    <div className="btn-box" style={{
                      padding: isMobile ? '8px 0' : '10px 0'
                    }}>
                      {renderPrice(car)}
                      <Link
                        to={`/veiculo/${car.vehicle_uuid}`}
                        className="details"
                        style={{
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          ) : (
            // Renderizar sem slider enquanto não está pronto
            <div className="row" style={{ display: 'flex', overflowX: 'auto', gap: '20px', padding: '0 15px' }}>
              {[...sortedItems].map((car, index) => (
              <div
                key={index}
                className="box-car car-block-three"
                style={{
                  flex: '0 0 auto',
                  width: isMobile ? '280px' : '300px',
                  padding: '0'
                }}
              >
                <div className="inner-box">
                  <div className="image-box relative">
                    <div className="image d-block">
                      <Link to={`/veiculo/${car.vehicle_uuid}`}>
                        <img loading="lazy" decoding="async" alt={`Foto do veículo ${car?.title || car?.brand + ' ' + car?.model || 'seminovo'}`} src={(() => {
                            // Processar fotos se for string separada por ponto e vírgula
                            if (car.fotos && typeof car.fotos === 'string') {
                              const fotosArray = car.fotos.split(';').filter(url => url.trim());
                              return fotosArray[0] || car.imgSrc || '/images/resource/car1-1.jpg';
                            }
                            // Fallback para sistema existente
                            return car.imgSrc || car.imagem_capa || car.imagens?.[0] || '/images/resource/car1-1.jpg';
                          })()} 
                          width={300} 
                          height={200}
                          style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'cover'
                          }}
                         />
                      </Link>
                    </div>
                    
                    {/* Tag de Promoção - Canto Superior Esquerdo */}
                    {car.promocao && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow font-semibold">
                        Oferta
                      </span>
                    )}
                    
                    {/* Tag Personalizada - Canto Superior Direito */}
                    {getVehicleTag(car) && (
                      <div className="absolute top-2 right-2">
                        {(() => {
                          const vehicleTag = getVehicleTag(car);
                          // Se a tag é um objeto (novo sistema)
                          if (typeof vehicleTag === 'object' && vehicleTag.nome) {
                            return (
                              <span 
                                className="text-white text-xs px-3 py-1 rounded-full shadow font-semibold uppercase tracking-wide flex items-center gap-2"
                                style={{
                                  backgroundColor: vehicleTag.cor || '#1A75FF'
                                }}
                              >
                                {vehicleTag.icone && (
                                  <LucideIcon name={vehicleTag.icone} size={12} color="white" />
                                )}
                                {vehicleTag.nome}
                              </span>
                            );
                          }
                          
                          // Se a tag é uma string (sistema antigo)
                          const tag = getCustomTagByName(vehicleTag);
                          if (tag) {
                            return (
                              <span 
                                className="text-white text-xs px-3 py-1 rounded-full shadow font-semibold uppercase tracking-wide flex items-center gap-2"
                                style={{
                                  backgroundColor: tag.cor || '#1A75FF'
                                }}
                              >
                                {tag.icone && (
                                  <LucideIcon name={tag.icone} size={12} color="white" />
                                )}
                                {tag.nome}
                              </span>
                            );
                          }
                          
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                  
                  <div className="content-box">
                    <h6 className="title">
                      <Link to={`/veiculo/${car.vehicle_uuid}`}>
                        {car.title || `${car.brand} ${car.model}`}
                      </Link>
                    </h6>
                    
                    <div className="text">{car.version} {car.year}</div>
                    
                    <ul>
                      <li>
                        <i className="flaticon-gasoline-pump" />
                        {car.fuel}
                      </li>
                      <li>
                        <i className="flaticon-speedometer" />
                        {car.mileage}
                      </li>
                      <li>
                        <i className="flaticon-gearbox" />
                        {car.transmission}
                      </li>
                    </ul>
                    
                    <div className="text">{renderPrice(car)}</div>
                    
                    <div className="btn-box">
                      <Link to={`/veiculo/${car.vehicle_uuid}`} className="details">
                        Ver Detalhes
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={14}
                          height={14}
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_881_7563)">
                            <path
                              d="M13.6111 0H5.05558C4.84062 0 4.66669 0.173943 4.66669 0.38889C4.66669 0.603836 4.84062 0.777779 5.05558 0.777779H12.6723L0.113941 13.3361C-0.0379805 13.488 -0.0379805 13.7342 0.113941 13.8861C0.189884 13.962 0.289414 14 0.38889 14C0.488365 14 0.5879 13.962 0.663843 13.8861L13.2222 1.32774V8.94447C13.2222 9.15943 13.3961 9.33336 13.6111 9.33336C13.8261 9.33336 14 9.15943 14 8.94447V0.38889C14 0.173943 13.8261 0 13.6111 0Z"
                              fill="#405FF2"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_881_7563">
                              <rect width={14} height={14} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>
      

    </section>
  );
}
