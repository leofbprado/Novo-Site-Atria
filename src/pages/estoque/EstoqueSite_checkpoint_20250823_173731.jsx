import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import { useFilters } from '../../contexts/FilterContext';
import { VehicleImage } from '../../components/common/OptimizedImage';
import BrandLogo from '../../components/BrandLogo';
import StaticSEO from '../../components/seo/StaticSEO';
import Header1 from '../../components/headers/Header1';
import Footer1 from '../../components/footers/Footer1';
import FixedBottomMenu from '../../components/common/FixedBottomMenu';
import '../../styles/brand-logo.css';
import '../../styles/overrides.css';

export default function EstoqueSite() {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { updateFilters, toggleArrayFilter } = useFilters();
  const [customTags, setCustomTags] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    brands: [],
    models: [],
    yearMin: null,
    yearMax: null,
    priceMin: null,
    priceMax: null,
    mileageMax: null,
    fuel: [],
    transmission: []
  });

  // Get brand and vehicle type from URL parameters
  const urlBrand = searchParams.get('marca');
  const urlTipo = searchParams.get('tipo');

  // Função para obter tag personalizada por nome
  const getCustomTagByName = (tagName) => {
    return customTags.find(tag => tag.nome === tagName);
  };

  // Carregar tags personalizadas do Firebase
  const loadCustomTags = async () => {
    try {
      // Usar o mesmo sistema de import que loadVehicles para evitar duplicação
      const { db } = await import('../../firebase/config');
      const { collection, getDocs } = await import('firebase/firestore');
      
      const tagsCollection = collection(db, 'tags_customizadas');
      const tagsSnapshot = await getDocs(tagsCollection);
      const tagsData = tagsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCustomTags(tagsData);
      console.log('✅ Tags personalizadas carregadas:', tagsData);
      console.log('🏷️ Tags disponíveis no sistema:', tagsData.map(t => `${t.nome} (${t.cor})`));
    } catch (error) {
      console.error('Erro ao carregar tags personalizadas:', error);
      setCustomTags([]);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadCustomTags();
  }, []);

  // Apply URL filters when vehicles load or URL changes
  useEffect(() => {
    if (vehicles.length === 0) return;

    let filtered = vehicles;

    // Apply brand filter
    if (urlBrand) {
      console.log(`🔍 Aplicando filtro de marca da URL: ${urlBrand}`);
      filtered = filtered.filter(vehicle => 
        vehicle.marca && vehicle.marca.toLowerCase() === urlBrand.toLowerCase()
      );
      console.log(`✅ ${filtered.length} veículos encontrados para marca "${urlBrand}"`);
    }

    // Apply vehicle category filter
    if (urlTipo) {
      console.log(`🚗 Aplicando filtro de categoria da URL: ${urlTipo}`);
      
      // Map URL type to possible database values
      const categoryMapping = {
        'hatch': ['Hatchback', 'Hatch', 'Compacto'],
        'sedan': ['Sedan', 'Sedan 4 portas'],
        'suv': ['SUV', 'Crossover', 'Utilitário'],
        'pickup': ['Pick-up', 'Pickup', 'Picape', 'Caminhonete']
      };
      
      const possibleCategories = categoryMapping[urlTipo.toLowerCase()] || [urlTipo];
      
      filtered = filtered.filter(vehicle => {
        if (!vehicle.categoria && !vehicle.tipo_veiculo) return false;
        
        // Check both categoria and tipo_veiculo fields for compatibility
        const vehicleCategory = (vehicle.categoria || vehicle.tipo_veiculo || '').toLowerCase();
        return possibleCategories.some(category => 
          vehicleCategory.includes(category.toLowerCase()) || category.toLowerCase().includes(vehicleCategory)
        );
      });
      
      console.log(`✅ ${filtered.length} veículos encontrados para categoria "${urlTipo}"`);
    }

    setFilteredVehicles(filtered);
    
    // Update filters state to reflect selections
    setFilters(prev => ({
      ...prev,
      brands: urlBrand ? [urlBrand] : [],
      category: urlTipo ? [urlTipo.toLowerCase()] : []
    }));
    
    // IMPORTANTE: Também atualizar o contexto global de filtros para o FilterSidebar
    if (urlTipo) {
      console.log(`🔧 Atualizando contexto de filtros para categoria: ${urlTipo}`);
      updateFilters({
        category: [urlTipo.toLowerCase()]
      });
    }
    
    if (urlBrand) {
      console.log(`🔧 Atualizando contexto de filtros para marca: ${urlBrand}`);
      updateFilters({
        brands: [urlBrand]
      });
    }
    
  }, [urlBrand, urlTipo, vehicles]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      // ⚡ Firebase lazy loading - só carrega quando necessário
      const { db } = await import('../../firebase/config');
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      // Query Firestore para buscar apenas veículos ativos
      const vehiclesRef = collection(db, 'veiculos');
      
      // DIAGNÓSTICO COMPLETO: Vamos verificar TUDO sobre a Ford Bronco
      console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DA FORD BRONCO...');
      
      const allVehiclesQuery = await getDocs(vehiclesRef);
      let totalVehicles = 0;
      let fordBroncoData = null;
      
      allVehiclesQuery.forEach((doc) => {
        totalVehicles++;
        const data = doc.data();
        
        // Verificar TODOS os possíveis nomes de Ford Bronco
        if (data.marca === 'Ford' && 
            (data.modelo === 'Bronco' || 
             data.modelo === 'Bronco Sport' ||
             (data.modelo && data.modelo.includes('Bronco')))) {
          fordBroncoData = {
            id: doc.id,
            ...data
          };
          console.log('🎯 FORD BRONCO ENCONTRADA NO BANCO:', {
            id: doc.id,
            marca: data.marca,
            modelo: data.modelo,
            versao: data.versao,
            ativo: data.ativo,
            tag: data.tag,
            custom_tag: data.custom_tag,
            uuid: data.vehicle_uuid
          });
        }
      });
      
      console.log(`📊 Total de veículos no banco: ${totalVehicles}`);
      
      if (fordBroncoData) {
        console.log('✅ Ford Bronco existe no banco e será incluída na lista');
      } else {
        console.log('❌ Ford Bronco NÃO foi encontrada no banco de dados');
      }
      
      // Buscar TODOS os veículos sem filtro
      const querySnapshot = await getDocs(vehiclesRef);

      const vehiclesList = [];
      let broncoTagInfo = null;
      
      querySnapshot.forEach((doc) => {
        const vehicleData = {
          id: doc.id,
          ...doc.data()
        };
        
        // Debug específico para Ford Bronco e suas tags
        if (vehicleData.marca === 'Ford' && vehicleData.modelo?.includes('Bronco')) {
          broncoTagInfo = {
            id: vehicleData.id,
            marca: vehicleData.marca,
            modelo: vehicleData.modelo,
            tag: vehicleData.tag,
            custom_tag: vehicleData.custom_tag,
            tag_type: typeof vehicleData.tag,
            custom_tag_type: typeof vehicleData.custom_tag
          };
          console.log('🎯 Ford Bronco processada para lista:', broncoTagInfo);
        }
        
        vehiclesList.push(vehicleData);
      });
      
      if (broncoTagInfo) {
        console.log('📌 RESUMO TAG FORD BRONCO:', {
          temTag: !!broncoTagInfo.tag,
          temCustomTag: !!broncoTagInfo.custom_tag,
          valorTag: broncoTagInfo.tag,
          valorCustomTag: broncoTagInfo.custom_tag
        });
      }

      setVehicles(vehiclesList);
      setFilteredVehicles(vehiclesList);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      setError("Erro ao carregar veículos. Verifique se o Firebase está configurado corretamente.");
    } finally {
      setLoading(false);
    }
  };

  // Apply search filters (only when not using URL filters)
  useEffect(() => {
    // Skip if we have URL filters (handled in separate effect)
    if (urlBrand || urlTipo) return;
    
    const start = performance.now();
    
    const searchTerm = filters.search?.toLowerCase().trim();
    let filtered = vehicles;

    if (searchTerm) {
      filtered = vehicles.filter((vehicle) => {
        const searchText = `${vehicle.marca || ''} ${vehicle.modelo || ''} ${vehicle.versao || ''}`.toLowerCase();
        return searchText.includes(searchTerm);
      });
    }

    setFilteredVehicles(filtered);

    const end = performance.now();
    console.log(
      `[Filtro OTIMIZADO] "${filters.search}" → ${filtered.length} veículos. Tempo: ${Math.round(end - start)}ms`
    );
  }, [vehicles, filters.search]);

  const formatPrice = (price) => {
    if (!price || price === 0) return "Consulte";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatKm = (km) => {
    if (!km || km === 0) return "0 km";
    return new Intl.NumberFormat('pt-BR').format(km) + " km";
  };

  const handleFinancingClick = (vehicle) => {
    // Redirecionar para simulador com dados do veículo
    window.location.href = `/simulador?veiculo=${vehicle.id}&preco=${vehicle.preco}`;
  };

  const handleViewDetails = (vehicle) => {
    // Redirecionar para página de detalhes
    window.location.href = `/veiculo-individual/${vehicle.id}`;
  };

  return (
    <>
      <StaticSEO page="estoque" />
      
      {/* Header idêntico ao usado na página de Financiamento */}
      <Header1 
        headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" 
        white={true} 
      />
      
      {/* Hero Section - IDÊNTICO ao Financiamento */}
      <section className="inventory-section pb-0 layout-radius">
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            <nav id="bc-estoque" aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/">Início</Link></li>
                <li className="bc-sep" aria-hidden="true">/</li>
                <li aria-current="page">Estoque</li>
              </ol>
            </nav>
            <h2 className="title">
              {urlBrand ? `Veículos ${urlBrand}` : 'Estoque de Veículos'}
            </h2>
          </div>
          
          {/* Content within the same section like financing page */}
          <div className="estoque-content" style={{ marginTop: '30px' }}>
            {/* Hero Description */}
            <div className="row mb-5">
              <div className="col-12 text-center">
                <h3 style={{ fontSize: '28px', color: '#1a2332', marginBottom: '15px' }}>
                  {urlBrand ? `Confira todos os veículos da marca ${urlBrand}` : 'Encontre o veículo perfeito para você'}
                </h3>
                <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                  {loading ? (
                    "Carregando veículos..."
                  ) : error ? (
                    error
                  ) : (
                    `${filteredVehicles.length} de ${vehicles.length} veículo${vehicles.length !== 1 ? 's' : ''} disponível${filteredVehicles.length !== 1 ? 'is' : ''}`
                  )}
                </p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white py-6" style={{ borderRadius: '12px', marginBottom: '30px' }}>
              <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Pesquisar marca, modelo..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                  }}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    fontSize: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setFilters({
                    search: '',
                    brands: [],
                    models: [],
                    yearMin: null,
                    yearMax: null,
                    priceMin: null,
                    priceMax: null,
                    mileageMax: null,
                    fuel: [],
                    transmission: []
                  });
                }}
              >
                Limpar
              </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="vehicles-grid">
          {loading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Carregando veículos...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-lg font-medium mb-2">Erro ao carregar estoque</p>
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={loadVehicles}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {!loading && !error && vehicles.length > 0 && filteredVehicles.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <div className="text-gray-500">
                <svg className="w-20 h-20 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum veículo encontrado
                </h3>
                <p className="text-gray-500 mb-6">
                  Nenhum veículo corresponde aos filtros selecionados. Tente ajustar os filtros de busca.
                </p>
                <button 
                  onClick={() => setFilters({
                    search: '',
                    brands: [],
                    models: [],
                    yearMin: null,
                    yearMax: null,
                    priceMin: null,
                    priceMax: null,
                    mileageMax: null,
                    fuel: [],
                    transmission: []
                  })}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}

          {!loading && !error && vehicles.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <div className="text-gray-500">
                <svg className="w-20 h-20 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum veículo disponível
                </h3>
                <p className="text-gray-500 mb-6">
                  No momento não temos veículos em estoque. Entre em contato para mais informações.
                </p>
                <a 
                  href="tel:+5519996525211" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Entrar em contato
                </a>
              </div>
            </div>
          )}

          {!loading && !error && filteredVehicles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Vehicle Image - Cloudinary Optimized */}
                  <div className="relative h-48 bg-gray-200">
                    <VehicleImage
                      vehicle={{
                        ...vehicle,
                        photos: vehicle.photos || vehicle.imagens || [vehicle.imagem_capa].filter(Boolean)
                      }}
                      context="listing"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* Badge/Tag - Sistema de Tags Personalizadas */}
                    {(() => {

                      
                      // Obter tag personalizada do veículo
                      const validTag = (() => {
                        const currentTag = vehicle?.tag || vehicle?.custom_tag;
                        
                        if (!currentTag) {
                          if (vehicle.marca === 'Ford' && vehicle.modelo?.includes('Bronco')) {
                            console.log('❌ Ford Bronco sem tag detectada');
                          }
                          return null;
                        }
                        
                        // Se a tag é um objeto (sistema padronizado)
                        if (typeof currentTag === 'object' && currentTag.nome) {
                          if (vehicle.marca === 'Ford' && vehicle.modelo?.includes('Bronco')) {
                            console.log('✅ Ford Bronco com tag-objeto:', currentTag);
                          }
                          return currentTag;
                        }
                        
                        // Se a tag é uma string (sistema legado)
                        const foundTag = getCustomTagByName(currentTag);
                        if (vehicle.marca === 'Ford' && vehicle.modelo?.includes('Bronco')) {
                          console.log('🔎 Ford Bronco com tag-string:', currentTag, 'Encontrada?', foundTag);
                        }
                        return foundTag;
                      })();
                      
                      // Renderizar apenas se for tag válida
                      if (!validTag) return null;

                      return (
                        <div className="absolute top-4 left-4">
                          <span 
                            className="text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
                            style={{ 
                              backgroundColor: validTag.cor || '#10B981',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          >
                            {validTag.nome}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-6">
                    {/* Title with Brand Logo */}
                    <div className="mb-3">
                      <div className="flex items-center gap-3 mb-1">
                        <BrandLogo 
                          brand={vehicle.marca} 
                          size={24} 
                          className="flex-shrink-0"
                        />
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 flex-1">
                          {vehicle.marca} {vehicle.modelo}
                        </h3>
                      </div>
                      {vehicle.versao && (
                        <p className="text-gray-600 text-sm line-clamp-1 ml-9">
                          {vehicle.versao}
                        </p>
                      )}
                    </div>

                    {/* Specs */}
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{vehicle.ano_modelo || '----'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{formatKm(vehicle.km)}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(vehicle.preco)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(vehicle)}
                        className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                      >
                        Ver mais
                      </button>
                      <button
                        onClick={() => handleFinancingClick(vehicle)}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition-all text-center"
                      >
                        Simular
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer idêntico ao existente */}
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
      
      {/* Menu mobile idêntico ao existente */}
      <FixedBottomMenu />

      {/* FOOTER PÚBLICO */}
      <div style={{ 
        backgroundColor: '#1f2937', 
        color: 'white', 
        padding: '40px 0',
        textAlign: 'center'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px'
        }}>
          <img height="60" width="150" fetchpriority="low" src="/images/logos/logo-white.png" alt="Átria Veículos" style={{ height: '40px', marginBottom: '20px' }} loading="lazy" decoding="async" />
          <p style={{ margin: 0, color: '#9ca3af' }}>
            © 2025 Átria Veículos. Todos os direitos reservados.
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#9ca3af' }}>
            WhatsApp: (19) 99652-5211 | financiamento@atriaveiculos.com.br
          </p>
        </div>
      </div>
    </>
  );
}