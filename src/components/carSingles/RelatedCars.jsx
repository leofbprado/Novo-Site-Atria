import { useContext, useMemo, useState, useEffect } from "react";
import { FilterContext } from "../../contexts/FilterContext";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import LucideIcon from '../icons/LucideIcon';
import { buildVehicleCanonicalPath } from "../../utils/vehiclePaths";

export default function RelatedCars({ currentVehicle }) {
  const { vehicles } = useContext(FilterContext);
  const [customTags, setCustomTags] = useState([]);

  // Carregar tags personalizadas do Firebase
  useEffect(() => {
    const loadCustomTags = async () => {
      try {
        // ⚡ Firebase lazy loading - só carrega quando necessário
        const { db } = await import("../../firebase/config");
        const { collection, getDocs } = await import("firebase/firestore");
        
        const tagsCollection = collection(db, 'tags_customizadas');
        const tagsSnapshot = await getDocs(tagsCollection);
        const tagsData = tagsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomTags(tagsData);
      } catch (error) {
        console.error('Erro ao carregar tags personalizadas:', error);
      }
    };
    
    loadCustomTags();
  }, []);

  // Função para obter tag personalizada por nome (sistema simplificado)
  const getCustomTagByName = (tagName) => {
    return customTags.find(tag => tag.nome === tagName);
  };

  // Lógica para encontrar veículos com preços similares (±10%)
  const relatedVehicles = useMemo(() => {
    if (!currentVehicle || !vehicles || vehicles.length === 0) {
      return [];
    }

    const currentPrice = currentVehicle.preco || 0;
    const priceRange = currentPrice * 0.1; // 10% do preço atual
    const minPrice = currentPrice - priceRange;
    const maxPrice = currentPrice + priceRange;

    return vehicles
      .filter(vehicle => {
        // Excluir o próprio veículo
        if (vehicle.id === currentVehicle.id || vehicle.placa === currentVehicle.placa) {
          return false;
        }
        
        // Filtrar por faixa de preço (±10%)
        const vehiclePrice = vehicle.preco || 0;
        return vehiclePrice >= minPrice && vehiclePrice <= maxPrice;
      })
      .slice(0, 8); // Limitar a 8 veículos para o slider
  }, [currentVehicle, vehicles]);

  // Função para renderizar preço baseado no campo mostrar_de_por
  const renderPrice = (vehicle) => {
    if (!vehicle?.preco) return "Consulte";
    
    const precoAtual = `R$ ${vehicle.preco.toLocaleString('pt-BR')}`;
    const precoDe = vehicle.preco_de && parseFloat(vehicle.preco_de) > parseFloat(vehicle.preco) 
      ? `R$ ${vehicle.preco_de.toLocaleString('pt-BR')}` 
      : null;

    // Verificar se deve mostrar preço De/Por baseado no campo mostrar_de_por
    if (vehicle.mostrar_de_por && precoDe) {
      return (
        <div>
          <small style={{ 
            color: '#6b7280', 
            textDecoration: 'line-through', 
            fontSize: '10px',
            display: 'block'
          }}>
            DE {precoDe}
          </small>
          <span style={{ 
            color: '#1A75FF', 
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            POR {precoAtual}
          </span>
        </div>
      );
    }

    // Exibir apenas preço principal quando mostrar_de_por for false ou não definido
    return precoAtual;
  };

  // Função para obter especificações do veículo
  const getVehicleSpecs = (vehicle) => {
    const specs = [];
    
    if (vehicle.km) {
      specs.push({
        icon: "flaticon-speedometer",
        text: `${vehicle.km.toLocaleString('pt-BR')} km`
      });
    }
    
    if (vehicle.combustivel) {
      specs.push({
        icon: "flaticon-gasoline-pump",
        text: vehicle.combustivel
      });
    }
    
    if (vehicle.cambio) {
      specs.push({
        icon: "flaticon-gearbox",
        text: vehicle.cambio
      });
    }
    
    return specs.slice(0, 3); // Máximo 3 specs
  };
  return (
    <section className="cars-section-three">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <h2>Outras Opções para Você</h2>
          <a href="/estoque" className="btn-title">
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
          </a>
        </div>

        <Slider
          slidesToScroll={1}
          slidesToShow={4}
          responsive={[
            {
              breakpoint: 1600,
              settings: {
                slidesToShow: 4,
                slidesToScroll: 1,
                arrows: false,
                infinite: true,
              },
            },
            {
              breakpoint: 1300,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: true,
              },
            },
            {
              breakpoint: 991,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                infinite: true,
              },
            },
            {
              breakpoint: 767,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              },
            },
            {
              breakpoint: 576,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              },
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              },
            },
            // You can unslick at a given breakpoint now by adding:
            // settings: "unslick"
            // instead of a settings object
          ]}
          arrows={false}
          className="row car-slider-three wow fadeInUp"
        >
          {relatedVehicles.length > 0 ? relatedVehicles.map((vehicle, index) => {
            const vehicleSpecs = getVehicleSpecs(vehicle);
            const vehicleImage = (() => {
              // Processar fotos se for string separada por ponto e vírgula
              if (vehicle.fotos && typeof vehicle.fotos === 'string') {
                const fotosArray = vehicle.fotos.split(';').filter(url => url.trim());
                return fotosArray[0] || '/images/resource/inventory1-1.jpg';
              }
              // Fallback para sistema existente
              return vehicle.imagem_capa || (vehicle.imagens && vehicle.imagens[0]) || vehicle.fotos?.[0] || "/images/resource/inventory1-1.jpg";
            })();
            const vehicleName = `${vehicle.marca} ${vehicle.modelo}`;
            const vehicleDescription = vehicle.versao || vehicle.descricao || `${vehicle.ano_modelo} - ${vehicle.km?.toLocaleString('pt-BR')} km`;
            
            return (
              <div
                key={vehicle.id || index}
                className="car-block-three col-lg-3 col-md-6 col-sm-12"
              >
                <div className="inner-box">
                  <div className="image-box relative">
                    <div className="slider-thumb">
                      <div className="image">
                        <Link 
                          to={buildVehicleCanonicalPath(vehicle) || `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`}
                          onClick={() => {
                            // Forçar recarregamento da página para garantir que o novo veículo seja carregado
                            window.location.href = buildVehicleCanonicalPath(vehicle) || `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`;
                          }}
                        >
                          <img fetchpriority="low" decoding="async" loading="lazy" alt={vehicleName} src={vehicleImage} width={329} height={220} onError={(e) => {
                              e.target.src = "/images/resource/inventory1-1.jpg";
                            }}
                          />
                        </Link>
                      </div>
                    </div>
                    
                    {/* Tag de Promoção - Canto Superior Esquerdo */}
                    {vehicle.promocao && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow font-semibold">
                        Oferta
                      </span>
                    )}
                    
                    {/* Tag Personalizada - SOMENTE TAGS PERSONALIZADAS VÁLIDAS */}
                    {(() => {
                      // VALIDAÇÃO RIGOROSA: Apenas tags personalizadas autorizadas
                      const validTag = (() => {
                        // Priorizar vehicle.tag (sistema padronizado)
                        const currentTag = vehicle.tag || vehicle.custom_tag;
                        
                        if (!currentTag) return null;
                        
                        // Se a tag é um objeto (sistema padronizado)
                        if (typeof currentTag === 'object' && currentTag.nome) {
                          // Verificar se existe na lista de tags personalizadas
                          const existsInCustomTags = customTags.some(tag => tag.nome === currentTag.nome);
                          return existsInCustomTags ? currentTag : null;
                        }
                        
                        // Se a tag é uma string (sistema legado - buscar na base de tags personalizadas)
                        const tag = getCustomTagByName(currentTag);
                        return tag || null; // Retorna apenas se encontrar na lista oficial
                      })();
                      
                      // Renderizar apenas se for tag válida
                      if (!validTag) return null;
                      
                      return (
                        <div className="absolute top-2 right-2">
                          <span 
                            className="text-white text-xs px-3 py-1 rounded-full shadow font-semibold uppercase tracking-wide flex items-center gap-2"
                            style={{
                              backgroundColor: validTag.cor || '#1A75FF'
                            }}
                          >
                            {validTag.icone && (
                              <LucideIcon name={validTag.icone} size={12} color="white" />
                            )}
                            {validTag.nome}
                          </span>
                        </div>
                      );
                    })()}
                    <Link
                      to={`/veiculo/${vehicle.vehicle_uuid}`}
                      title="Salvar"
                      className="icon-box"
                      onClick={() => {
                        window.location.href = `/veiculo/${vehicle.vehicle_uuid}`;
                      }}
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
                  <div className="content-box">
                    <h6 className="title">
                      <Link 
                        to={buildVehicleCanonicalPath(vehicle) || `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`}
                        onClick={() => {
                          window.location.href = buildVehicleCanonicalPath(vehicle) || `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`;
                        }}
                      >
                        {vehicleName}
                      </Link>
                    </h6>
                    <div className="text">{vehicleDescription}</div>
                    <ul>
                      {vehicleSpecs.map((spec, i) => (
                        <li key={i}>
                          <i className={spec.icon} /> {spec.text}
                        </li>
                      ))}
                    </ul>
                    <div className="btn-box">
                      <span>{renderPrice(vehicle)}</span>
                      <Link
                        to={`/veiculo/${vehicle.vehicle_uuid}`}
                        className="details"
                        onClick={() => {
                          window.location.href = `/veiculo/${vehicle.vehicle_uuid}`;
                        }}
                      >
                        Ver Detalhes
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={14}
                          height={14}
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <g clipPath="url(#clip0_634_448)">
                            <path
                              d="M13.6109 0H5.05533C4.84037 0 4.66643 0.173943 4.66643 0.388901C4.66643 0.603859 4.84037 0.777802 5.05533 0.777802H12.6721L0.113697 13.3362C-0.0382246 13.4881 -0.0382246 13.7342 0.113697 13.8861C0.18964 13.962 0.289171 14 0.388666 14C0.488161 14 0.587656 13.962 0.663635 13.8861L13.222 1.3277V8.94447C13.222 9.15943 13.3959 9.33337 13.6109 9.33337C13.8259 9.33337 13.9998 9.15943 13.9998 8.94447V0.388901C13.9998 0.173943 13.8258 0 13.6109 0Z"
                              fill="white"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_634_448">
                              <rect width={14} height={14} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            // Fallback quando não há veículos similares
            <div className="col-12 text-center">
              <p style={{ color: '#6b7280', fontSize: '16px', padding: '40px 0' }}>
                Nenhum veículo com preço similar encontrado no momento.
              </p>
            </div>
          )}
        </Slider>
      </div>
    </section>
  );
}
