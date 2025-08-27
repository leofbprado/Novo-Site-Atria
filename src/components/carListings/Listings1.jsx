import React, { useState, useEffect, useMemo } from "react";
import LucideIcon from '../icons/LucideIcon';
import { useSearchParams, useNavigate } from "react-router-dom";
import { analytics } from '@/lib/analytics';
import LocalSEOText from "@/components/seo/LocalSEOText";
import { buildVehicleCanonicalPath } from "@/utils/vehiclePaths";

import SelectComponent from "../common/SelectComponent";
import { cars } from "@/data/cars";
import { Link } from "react-router-dom";
import Pagination from "../common/Pagination";
import { useFilters } from "@/contexts/FilterContext";

export default function Listings1({ searchQuery = "", onVehiclesChange }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { debouncedFilters, updateFilters, toggleArrayFilter } = useFilters();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customTags, setCustomTags] = useState([]);
  const [urlBrandApplied, setUrlBrandApplied] = useState(false);
  const [urlOfferApplied, setUrlOfferApplied] = useState(false);
  // Removido setFilteredVehicles para usar useMemo

  // Get URL parameters
  const urlBrand = searchParams.get('marca');
  const urlOferta = searchParams.get('oferta');

  // Função para formatar preço no formato brasileiro
  const formatPrice = (price) => {
    if (!price || price === 0) return "Consulte";
    
    // Converter para número se for string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Multiplicar por 1000 se o valor for menor que 1000 (assumindo valores em milhares)
    const finalPrice = numPrice < 1000 ? numPrice * 1000 : numPrice;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(finalPrice);
  };

  // Função para renderizar preços DE/POR baseado no campo mostrar_de_por
  const renderPrice = (vehicle) => {
    const precoAtual = formatPrice(vehicle.preco);
    const precoDe = vehicle.preco_de && parseFloat(vehicle.preco_de) > parseFloat(vehicle.preco) 
      ? formatPrice(vehicle.preco_de) 
      : null;

    // Verificar se deve mostrar preço De/Por baseado no campo mostrar_de_por (não em tags)
    if (vehicle.mostrar_de_por && precoDe) {
      return (
        <div>
          <span style={{ 
            color: '#6b7280', 
            textDecoration: 'line-through', 
            fontSize: '12px',
            display: 'block'
          }}>
            DE {precoDe}
          </span>
          <span style={{ 
            color: '#1A75FF', 
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            POR {precoAtual}
          </span>
        </div>
      );
    }

    // Exibir apenas preço principal quando mostrar_de_por for false ou não definido
    return <span style={{ color: '#1A75FF', fontWeight: 'bold' }}>{precoAtual}</span>;
  };

  // Carregar tags personalizadas
  useEffect(() => {
    const loadCustomTags = async () => {
      try {
        // ⚡ Firebase lazy loading - só carrega quando necessário
        const { db } = await import('@/firebase/config');
        const { collection, getDocs } = await import('firebase/firestore');
        
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

  // Apply URL brand filter when component mounts or URL changes
  useEffect(() => {
    if (urlBrand && !urlBrandApplied) {
      console.log(`🔍 Aplicando filtro de marca da URL: ${urlBrand}`);
      
      updateFilters({
        brand: urlBrand,
        brands: [urlBrand]
      });
      
      setUrlBrandApplied(true);
    } else if (!urlBrand && urlBrandApplied) {
      // Clear brand filter if URL param is removed
      updateFilters({
        brand: '',
        brands: []
      });
      setUrlBrandApplied(false);
    }
  }, [urlBrand, urlBrandApplied, updateFilters]);

  // Apply URL offer filter when component mounts or URL changes
  useEffect(() => {
    if (urlOferta && !urlOfferApplied) {
      console.log(`🏷️ Aplicando filtro de oferta da URL: ${urlOferta}`);
      
      updateFilters({
        offers: [urlOferta]
      });
      
      setUrlOfferApplied(true);
    } else if (!urlOferta && urlOfferApplied) {
      // Clear offer filter if URL param is removed
      updateFilters({
        offers: []
      });
      setUrlOfferApplied(false);
    }
  }, [urlOferta, urlOfferApplied, updateFilters]);

  // Update URL when offers filter changes (but not during URL application)
  useEffect(() => {
    if (!urlOfferApplied && debouncedFilters.offers && debouncedFilters.offers.length > 0) {
      const currentParams = new URLSearchParams(searchParams);
      const firstOffer = debouncedFilters.offers[0];
      currentParams.set('oferta', firstOffer);
      
      // Update URL without triggering navigation
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
      
      console.log(`🔗 URL atualizada com oferta: ${firstOffer}`);
    } else if (!urlOfferApplied && (!debouncedFilters.offers || debouncedFilters.offers.length === 0)) {
      const currentParams = new URLSearchParams(searchParams);
      currentParams.delete('oferta');
      
      // Update URL without triggering navigation
      const newUrl = currentParams.toString() 
        ? `${window.location.pathname}?${currentParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [debouncedFilters.offers, urlOfferApplied, searchParams]);

  // Carregar veículos do Firestore
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        console.log('🔥 Carregando veículos do Firestore...');
        setLoading(true);
        
        // ⚡ Firebase lazy loading - só carrega quando necessário
        const { db } = await import('@/firebase/config');
        const { collection, getDocs } = await import('firebase/firestore');
        
        const vehiclesCollection = collection(db, 'veiculos');
        const vehiclesSnapshot = await getDocs(vehiclesCollection);
        
        const vehiclesData = vehiclesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ Veículos carregados:', vehiclesData.length, 'itens');
        console.log('📋 Primeiro veículo:', vehiclesData[0]);
        console.log('💰 Preços dos primeiros 3 veículos:', vehiclesData.slice(0, 3).map(v => ({
          marca: v.marca,
          modelo: v.modelo, 
          preco: v.preco,
          preco_de: v.preco_de,
          mostrar_de_por: v.mostrar_de_por
        })));
        
        setVehicles(vehiclesData);
        setError(null);
      } catch (err) {
        console.error('❌ Erro ao carregar veículos:', err);
        setError(err.message);
        // Fallback para dados estáticos em caso de erro
        setVehicles(cars);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  // Sistema de filtragem com useMemo() e conversão segura
  const filteredVehicles = useMemo(() => {
    console.log('🔄 Filtros aplicados com debounce:', debouncedFilters);
    
    // Se ainda não há veículos carregados, retornar array vazio
    if (!vehicles || vehicles.length === 0) {
      console.log('⏳ Aguardando carregamento dos veículos...');
      return [];
    }
    
    let filtered = [...vehicles]; // Criar cópia para evitar mutação

    // Filtro por busca de texto DINÂMICO - validação segura (prop searchQuery + filters.search)
    const searchText = searchQuery || debouncedFilters.search;
    if (searchText && typeof searchText === 'string' && searchText.trim()) {
      const query = searchText.toLowerCase().trim();
      
      // Se temos filtros específicos de marca/modelo vindos da busca inteligente,
      // usar APENAS esses filtros, não a busca textual também
      const hasSpecificFilters = (debouncedFilters.brands?.length > 0) || (debouncedFilters.models?.length > 0);
      
      if (!hasSpecificFilters) {
        // Busca textual ampla em todos os campos
        filtered = filtered.filter(vehicle => {
          // Busca dinâmica em todos os campos possíveis
          const searchableFields = [
            // Campos básicos
            vehicle.marca,
            vehicle.modelo,
            vehicle.versao,
            vehicle.descricao,
            vehicle.descricao_corrigida,
            
            // Categorias e tipos
            vehicle.categoria,
            vehicle.tipo_veiculo,
            vehicle.tipo,
            vehicle.category,
            
            // Especificações técnicas
            vehicle.combustivel,
            vehicle.combustivel_corrigido,
            vehicle.transmissao,
            vehicle.cambio,
            
            // Ano (convertido para string)
            vehicle.ano?.toString(),
            vehicle.year?.toString(),
            
            // Cor
            vehicle.cor,
            vehicle.color,
            
            // Tags e ofertas (verificar tanto array quanto objeto)
            ...(Array.isArray(vehicle.tags) ? vehicle.tags : []),
            vehicle.tag?.nome,
            vehicle.custom_tag?.nome,
            
            // Opcionais (verificar se é objeto)
            ...(typeof vehicle.opcionais === 'object' && vehicle.opcionais ? 
                Object.values(vehicle.opcionais).flat().filter(Boolean) : []),
            ...(typeof vehicle.opcionais_corrigidos === 'object' && vehicle.opcionais_corrigidos ? 
                Object.values(vehicle.opcionais_corrigidos).flat().filter(Boolean) : []),
            
            // Características adicionais
            vehicle.blindado === true ? 'blindado' : null,
            vehicle.ipva_pago === true ? 'ipva pago' : null,
            vehicle.unico_dono === true ? 'único dono' : null,
            vehicle.licenciado === true ? 'licenciado' : null,
            
            // Quilometragem (para busca como "baixa km", "alto km")
            vehicle.km === 0 ? '0km' : null,
            (vehicle.km && vehicle.km < 30000) ? 'baixa quilometragem' : null,
            (vehicle.km && vehicle.km < 30000) ? 'baixo km' : null,
            
            // Preço (para busca como "barato", "econômico")
            (vehicle.preco && vehicle.preco < 50000) ? 'barato' : null,
            (vehicle.preco && vehicle.preco < 50000) ? 'econômico' : null,
            
            // Campos específicos da concessionária
            vehicle.placa,
            vehicle.chassi,
            vehicle.cidade,
            vehicle.estado,
            vehicle.vendedor
          ];
          
          // Filtrar apenas valores válidos e fazer busca
          const validFields = searchableFields.filter(field => 
            field && typeof field === 'string' && field.trim()
          );
          
          // Busca mais flexível: dividir query em tokens e aceitar se qualquer token combinar
          const queryTokens = query.split(/\s+/);
          const matches = queryTokens.some(token => 
            validFields.some(field => field.toLowerCase().includes(token))
          );
          
          return matches;
        });
        console.log('🔍 Filtro por busca TEXTUAL aplicado:', query, 'Resultados:', filtered.length);
      }
    }

    // Filtro por marcas (array) - validação de array válido
    if (debouncedFilters.brands && Array.isArray(debouncedFilters.brands) && debouncedFilters.brands.length > 0) {
      filtered = filtered.filter(vehicle => 
        vehicle.marca && debouncedFilters.brands.some(brand => 
          vehicle.marca.toLowerCase() === brand.toLowerCase()
        )
      );
      console.log('🏷️ Filtro por MARCAS aplicado:', debouncedFilters.brands, 'Resultados:', filtered.length);
    }

    // Filtro por modelos (array) - validação de array válido
    if (debouncedFilters.models && Array.isArray(debouncedFilters.models) && debouncedFilters.models.length > 0) {
      filtered = filtered.filter(vehicle => 
        vehicle.modelo && debouncedFilters.models.some(model => 
          vehicle.modelo.toLowerCase() === model.toLowerCase()
        )
      );
      console.log('🚗 Filtro por MODELOS aplicado:', debouncedFilters.models, 'Resultados:', filtered.length);
    }

    // Filtro por faixa de preço com conversão segura usando Number()
    const minPrice = Number(debouncedFilters.minPrice);
    const maxPrice = Number(debouncedFilters.maxPrice);
    
    // Verificar se os valores são números válidos antes de aplicar
    const hasValidMinPrice = !isNaN(minPrice) && minPrice > 0;
    const hasValidMaxPrice = !isNaN(maxPrice) && maxPrice < 999999;
    
    if (hasValidMinPrice || hasValidMaxPrice) {
      filtered = filtered.filter(vehicle => {
        if (!vehicle.preco) return false;
        
        // Conversão segura do preço do veículo
        const vehiclePrice = Number(vehicle.preco);
        if (isNaN(vehiclePrice)) return false;
        
        // Assumindo que preços no DB estão em formato decimal (ex: 43.9 = R$ 43.900)
        const finalVehiclePrice = vehiclePrice < 1000 ? vehiclePrice * 1000 : vehiclePrice;
        
        // Aplicar filtros apenas se válidos
        const matchesMin = !hasValidMinPrice || finalVehiclePrice >= minPrice;
        const matchesMax = !hasValidMaxPrice || finalVehiclePrice <= maxPrice;
        
        return matchesMin && matchesMax;
      });
    }

    // Filtro por anos - validação de array (compatibilidade)
    if (debouncedFilters.years && Array.isArray(debouncedFilters.years) && debouncedFilters.years.length > 0) {
      filtered = filtered.filter(vehicle => {
        const vehicleYear = Number(vehicle.ano_modelo || vehicle.ano || vehicle.ano_fabricacao);
        return !isNaN(vehicleYear) && debouncedFilters.years.includes(vehicleYear);
      });
    }

    // Filtro por anos (novo campo) - validação de array
    if (debouncedFilters.anos && Array.isArray(debouncedFilters.anos) && debouncedFilters.anos.length > 0) {
      filtered = filtered.filter(vehicle => {
        // Priorizar campo 'ano_modelo' conforme solicitado
        const vehicleYear = Number(vehicle.ano_modelo || vehicle.ano || vehicle.ano_fabricacao);
        return !isNaN(vehicleYear) && debouncedFilters.anos.includes(vehicleYear);
      });
    }

    // Filtro por intervalo de ano (anoMin e anoMax)
    if (debouncedFilters.anoMin !== null || debouncedFilters.anoMax !== null) {
      filtered = filtered.filter(vehicle => {
        // Priorizar campo 'ano_modelo' conforme solicitado
        const vehicleYear = Number(vehicle.ano_modelo || vehicle.ano || vehicle.ano_fabricacao);
        
        if (isNaN(vehicleYear)) return false;
        
        // Aplicar filtros de intervalo
        if (debouncedFilters.anoMin !== null && vehicleYear < debouncedFilters.anoMin) {
          return false;
        }
        if (debouncedFilters.anoMax !== null && vehicleYear > debouncedFilters.anoMax) {
          return false;
        }
        
        return true;
      });
    }

    // Filtro por combustível - validação de array
    if (debouncedFilters.fuel && Array.isArray(debouncedFilters.fuel) && debouncedFilters.fuel.length > 0) {
      filtered = filtered.filter(vehicle => {
        if (!vehicle.combustivel) return false;
        
        const matches = debouncedFilters.fuel.some(fuel => 
          vehicle.combustivel.toLowerCase().trim() === fuel.toLowerCase().trim()
        );
        
        // Debug para verificar compatibilidade
        if (!matches && vehicle.combustivel) {
          console.log('🚗 Debug combustível:', {
            vehicleFuel: vehicle.combustivel,
            filterFuels: debouncedFilters.fuel,
            matches
          });
        }
        
        return matches;
      });
    }

    // Filtro por transmissão - validação de array
    if (debouncedFilters.transmission && Array.isArray(debouncedFilters.transmission) && debouncedFilters.transmission.length > 0) {
      filtered = filtered.filter(vehicle => {
        if (!vehicle.cambio) return false;
        
        const matches = debouncedFilters.transmission.some(trans => 
          vehicle.cambio.toLowerCase().trim() === trans.toLowerCase().trim()
        );
        
        // Debug para verificar compatibilidade
        if (!matches && vehicle.cambio) {
          console.log('🔧 Debug transmissão:', {
            vehicleTransmission: vehicle.cambio,
            filterTransmissions: debouncedFilters.transmission,
            matches
          });
        }
        
        return matches;
      });
    }

    // Filtro por quilometragem (campos antigos) - conversão segura
    const minMileage = Number(debouncedFilters.minMileage);
    const maxMileage = Number(debouncedFilters.maxMileage);
    
    if (!isNaN(minMileage) && minMileage > 0) {
      filtered = filtered.filter(vehicle => {
        const vehicleMileage = Number(vehicle.km);
        return !isNaN(vehicleMileage) && vehicleMileage >= minMileage;
      });
    }
    
    if (!isNaN(maxMileage) && maxMileage > 0) {
      filtered = filtered.filter(vehicle => {
        const vehicleMileage = Number(vehicle.km);
        return !isNaN(vehicleMileage) && vehicleMileage <= maxMileage;
      });
    }

    // Filtro por quilometragem (novos campos) - conversão segura
    const kmMin = Number(debouncedFilters.kmMin);
    const kmMax = Number(debouncedFilters.kmMax);
    
    if (!isNaN(kmMin) && kmMin > 0) {
      filtered = filtered.filter(vehicle => {
        const vehicleKm = Number(vehicle.km);
        return !isNaN(vehicleKm) && vehicleKm >= kmMin;
      });
    }
    
    if (!isNaN(kmMax) && kmMax > 0) {
      filtered = filtered.filter(vehicle => {
        const vehicleKm = Number(vehicle.km);
        return !isNaN(vehicleKm) && vehicleKm <= kmMax;
      });
    }

    // Filtro por categoria de veículo (carTypes e category) - validação de array
    const carTypes = (debouncedFilters.carTypes && debouncedFilters.carTypes.length > 0) 
      ? debouncedFilters.carTypes 
      : (debouncedFilters.category && debouncedFilters.category.length > 0) 
        ? debouncedFilters.category 
        : [];
    
    if (Array.isArray(carTypes) && carTypes.length > 0) {
      console.log('🏁 INICIANDO FILTRO DE CATEGORIA:', carTypes);
      console.log('📋 Veículos antes do filtro de categoria:', filtered.length);
      
      // Log das primeiras 5 categorias de veículos para debug
      filtered.slice(0, 5).forEach(vehicle => {
        console.log(`🚗 Veículo: ${vehicle.marca} ${vehicle.modelo}`, {
          categoria: vehicle.categoria || 'N/A',
          tipo_veiculo: vehicle.tipo_veiculo || 'N/A',
          tipo: vehicle.tipo || 'N/A',
          category: vehicle.category || 'N/A'
        });
      });
      
      filtered = filtered.filter(vehicle => {
        // Verificar em todos os campos possíveis de categoria
        const vehicleType = vehicle.categoria || vehicle.tipo_veiculo || vehicle.tipo || vehicle.category || '';
        
        if (!vehicleType) {
          console.log('❌ Veículo sem categoria:', vehicle.marca, vehicle.modelo);
          return false;
        }
        
        const matches = carTypes.some(filterType => {
          const lowerFilterType = filterType.toLowerCase().trim();
          const lowerVehicleType = vehicleType.toLowerCase().trim();
          
          // Mapeamento flexível de tipos com log detalhado
          const typeMatches = 
            lowerVehicleType.includes(lowerFilterType) ||
            lowerFilterType.includes(lowerVehicleType) ||
            (lowerFilterType === 'hatch' && (lowerVehicleType.includes('hatchback') || lowerVehicleType.includes('compacto'))) ||
            (lowerFilterType === 'hatchback' && lowerVehicleType.includes('hatch')) ||
            (lowerFilterType === 'pickup' && (lowerVehicleType.includes('pick-up') || lowerVehicleType.includes('picape'))) ||
            (lowerFilterType === 'pick-up' && (lowerVehicleType.includes('pickup') || lowerVehicleType.includes('picape'))) ||
            (lowerFilterType === 'suv' && lowerVehicleType.includes('crossover')) ||
            (lowerFilterType === 'crossover' && lowerVehicleType.includes('suv'));
          
          if (typeMatches) {
            console.log('✅ MATCH encontrado:', {
              vehicleType: lowerVehicleType,
              filterType: lowerFilterType,
              vehicle: `${vehicle.marca} ${vehicle.modelo}`
            });
          }
          
          return typeMatches;
        });
        
        return matches;
      });
      
      console.log('🔍 Filtro por categoria de veículo aplicado:', carTypes, 'Resultados:', filtered.length);
    }

    // Filtro por ofertas/tags - validação de array
    if (debouncedFilters.offers && Array.isArray(debouncedFilters.offers) && debouncedFilters.offers.length > 0) {
      console.log('🏷️ Debug: Iniciando filtro por ofertas:', debouncedFilters.offers);
      console.log('🏷️ Debug: Primeiro veículo para teste:', vehicles[0]);
      
      filtered = filtered.filter(vehicle => {
        // Verificar tanto 'tags' (array) quanto 'tag' (objeto)
        let vehicleTags = [];
        
        if (vehicle.tags && Array.isArray(vehicle.tags)) {
          vehicleTags = vehicle.tags;
        } else if (vehicle.tag && typeof vehicle.tag === 'object' && vehicle.tag.nome) {
          vehicleTags = [vehicle.tag.nome];
        }
        
        if (vehicleTags.length === 0) {
          return false;
        }
        
        // Debug para primeiro veículo com tags
        if (vehicleTags.length > 0 && filtered.length < 5) {
          console.log('🏷️ Debug: Tags do veículo:', vehicleTags, 'vs Ofertas selecionadas:', debouncedFilters.offers);
        }
        
        // Verificar se o veículo tem alguma das tags selecionadas
        const matches = debouncedFilters.offers.some(selectedOffer => {
          return vehicleTags.some(vehicleTag => {
            if (!vehicleTag || typeof vehicleTag !== 'string') return false;
            
            // Comparação direta - as ofertas agora são armazenadas com seus nomes originais
            return vehicleTag === selectedOffer || 
                   vehicleTag.toLowerCase() === selectedOffer.toLowerCase();
          });
        });
        
        return matches;
      });
      
      console.log('🏷️ Filtro por ofertas aplicado:', debouncedFilters.offers, 'Resultados:', filtered.length);
    }

    // Notify parent component of filtered vehicles for SEO
    if (onVehiclesChange && typeof onVehiclesChange === 'function') {
      onVehiclesChange(filtered);
    }
    
    return filtered;
  }, [vehicles, searchQuery, debouncedFilters, onVehiclesChange]);

  // Log otimizado dos resultados filtrados + Analytics
  useEffect(() => {
    if (filteredVehicles.length !== vehicles.length) {
      console.log('🔍 Filtros ativos:', filteredVehicles.length, 'de', vehicles.length, 'veículos');
    }
    
    // Analytics: Track view_item_list when filtered results change
    if (filteredVehicles.length > 0) {
      analytics.viewItemList('Estoque', filteredVehicles, filteredVehicles.length);
    }
  }, [filteredVehicles.length, vehicles.length, filteredVehicles]);

  if (loading) {
    return (
      <div className="boxcar-container">
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          fontSize: '18px',
          color: '#666'
        }}>
          🔄 Carregando veículos...
        </div>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="boxcar-container">
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          fontSize: '18px',
          color: '#e74c3c'
        }}>
          ❌ Erro ao carregar veículos: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="boxcar-container" >

        
        {/* TESTE: MobileSearchFilter removido - usando filtro simplificado */}
        {/* <MobileSearchFilter /> */}
        
        <div className="text-box" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: '1px solid #e9ecef',
          marginBottom: '24px'
        }}>
          <div className="text" style={{
            fontSize: '14px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Mostrando {filteredVehicles.length} veículo{filteredVehicles.length !== 1 ? 's' : ''} 
            {vehicles.length !== filteredVehicles.length && ` de ${vehicles.length} total`}
            {error && ' (usando dados de exemplo)'}
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form_boxes v3" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <small style={{ color: '#64748b', fontWeight: '500' }}>Ordenar por</small>
              <SelectComponent options={["Mais recentes", "Menor preço", "Maior preço", "Menor quilometragem", "Maior quilometragem"]} />
            </div>
          </form>
        </div>
        <div className="row wow fadeInUp">
          {filteredVehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className="car-block-four col-xl-3 col-lg-4 col-md-6 col-sm-6"
            >
              <div className="inner-box">
                <div className="image-box relative">
                  <figure className="image">
                    <Link 
                      to={buildVehicleCanonicalPath(vehicle) || `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`}
                      onClick={() => analytics.selectItem(vehicle, index + 1, 'Estoque')}
                    >
                      <img fetchpriority="low" decoding="async" loading="lazy" alt={`Foto do veículo ${vehicle?.marca || vehicle?.brand} ${vehicle?.modelo || vehicle?.model}`} src={(() => {
                          // ✅ SISTEMA CORRETO: usar campo 'photos' (array de URLs)
                          if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
                            return vehicle.photos[0];
                          }
                          // Fallback para sistema legado (compatibilidade)
                          if (vehicle.imagens && Array.isArray(vehicle.imagens) && vehicle.imagens.length > 0) {
                            return vehicle.imagens[0];
                          }
                          // Último fallback para placeholder
                          return '/images/resource/car1-1.jpg';
                        })()}
                        width={329}
                        height={220}
                        style={{ objectFit: 'cover' }}
                      />
                    </Link>
                  </figure>
                  
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
                  
                  <a className="icon-box">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={12}
                      height={12}
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_601_1274)">
                        <path
                          d="M9.39062 12C9.15156 12 8.91671 11.9312 8.71128 11.8009L6.11794 10.1543C6.04701 10.1091 5.95296 10.1096 5.88256 10.1543L3.28869 11.8009C2.8048 12.1082 2.13755 12.0368 1.72722 11.6454C1.47556 11.4047 1.33685 11.079 1.33685 10.728V1.2704C1.33738 0.570053 1.90743 0 2.60778 0H9.39272C10.0931 0 10.6631 0.570053 10.6631 1.2704V10.728C10.6631 11.4294 10.0925 12 9.39062 12ZM6.00025 9.06935C6.24193 9.06935 6.47783 9.13765 6.68169 9.26743L9.27503 10.9135C9.31233 10.9371 9.35069 10.9487 9.39114 10.9487C9.48046 10.9487 9.61286 10.8788 9.61286 10.728V1.2704C9.61233 1.14956 9.51356 1.05079 9.39272 1.05079H2.60778C2.48642 1.05079 2.38817 1.14956 2.38817 1.2704V10.728C2.38817 10.7911 2.41023 10.8436 2.45384 10.8851C2.52582 10.9539 2.63563 10.9708 2.72599 10.9135L5.31934 9.2669C5.52267 9.13765 5.75857 9.06935 6.00025 9.06935Z"
                          fill="black"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_601_1274">
                          <rect width={12} height={12} fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </div>
                <div className="content-box">
                  <h6 className="title">
                    <Link 
                      to={buildVehicleCanonicalPath(vehicle) || `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`}
                      onClick={() => analytics.selectItem(vehicle, index + 1, 'Estoque')}
                    >
                      {vehicle.marca} {vehicle.modelo} {vehicle.versao}
                    </Link>
                  </h6>
                  <div className="text">
                    {renderPrice(vehicle)}
                  </div>
                  <ul>
                    <li>
                      <i className="flaticon-gasoline-pump" /> {vehicle.combustivel || 'Flex'}
                    </li>
                    <li>
                      <i className="flaticon-speedometer" /> {vehicle.km ? `${vehicle.km.toLocaleString()} km` : 'N/A'}
                    </li>
                    <li>
                      <i className="flaticon-gearbox" /> {vehicle.cambio || 'Manual'}
                    </li>
                  </ul>
                  <LocalSEOText />
                  <div className="btn-box">
                    <span>{vehicle.ano_modelo || vehicle.ano_fabricacao}</span>
                    <small>{vehicle.promocao ? 'Oferta Especial' : ''}</small>
                    <Link
                      to={buildVehicleCanonicalPath(vehicle) || `/estoque/${vehicle.shortId || vehicle.codigo || vehicle.vehicle_uuid}`}
                      className="details"
                      onClick={() => analytics.selectItem(vehicle, index + 1, 'Estoque')}
                    >
                      Ver Detalhes
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={14}
                        height={14}
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_601_4346)">
                          <path
                            d="M13.6109 0H5.05533C4.84037 0 4.66643 0.173943 4.66643 0.388901C4.66643 0.603859 4.84037 0.777802 5.05533 0.777802H12.6721L0.113697 13.3362C-0.0382246 13.4881 -0.0382246 13.7342 0.113697 13.8861C0.18964 13.962 0.289171 14 0.388666 14C0.488161 14 0.587656 13.962 0.663635 13.8861L13.222 1.3277V8.94447C13.222 9.15943 13.3959 9.33337 13.6109 9.33337C13.8259 9.33337 13.9998 9.15943 13.9998 8.94447V0.388901C13.9998 0.173943 13.8258 0 13.6109 0Z"
                            fill="#405FF2"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_601_4346">
                            <rect width={14} height={14} />
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
        <div className="pagination-sec">
          <nav aria-label="Page navigation example">
            <ul className="pagination">
              <Pagination />
            </ul>
            <div className="text">Mostrando resultados 1-30 de 1,415</div>
          </nav>
        </div>
      </div>
  );
}
