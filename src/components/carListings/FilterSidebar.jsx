import React, { useState, useEffect, useMemo, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import SelectComponent from "../common/SelectComponent";
// import Slider from "rc-slider";
import Slider from "../common/SimpleSlider";
import { useFilters } from '@/contexts/FilterContext';
import { buildActiveChips, useLiveResultCount, sanitizeNumber } from '../../utils/filtersUtils';
import "../../styles/style.css";
import "../../styles/filter-sidebar.css";
import "../../styles/no-spinner.css";
import "../../styles/filters-modal.css";

export default function FilterSidebar() {
  const { filters, updateFilters, updatePriceRange, toggleArrayFilter, clearAllFilters, getActiveFiltersCount, vehicles } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('price');
  const scrollYRef = useRef(0);
  const overlayRef = useRef(null);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;

  // Detectar se é mobile e configurar estado inicial
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Desktop sempre aberto, Mobile fechado por padrão
      setIsOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Bloquear scroll do body e gerenciar aria-hidden quando modal mobile está aberto
  useEffect(() => {
    const body = document.body;
    const fixedBar = document.querySelector('.fixed-bottom-menu');
    const mainContent = document.querySelector('#root > *:not(.filters-overlay):not(.filters-panel)');
    
    if (isMobile && isOpen) {
      // Preservar posição do scroll
      scrollYRef.current = window.scrollY || 0;
      body.classList.add('filters-open');
      
      // Aplicar position fixed mantendo posição visual
      body.style.position = 'fixed';
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      
      // Adicionar aria-hidden
      if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'true');
      }
      if (fixedBar) {
        fixedBar.setAttribute('aria-hidden', 'true');
      }
      
      // Focar no título do painel
      setTimeout(() => {
        const filtersTitle = document.getElementById(titleId);
        if (filtersTitle) {
          filtersTitle.focus();
        }
      }, 150);
      
      return () => {
        body.classList.remove('filters-open');
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.width = '';
        
        // Remover aria-hidden
        if (mainContent) {
          mainContent.removeAttribute('aria-hidden');
        }
        if (fixedBar) {
          fixedBar.removeAttribute('aria-hidden');
        }
        
        // Restaurar posição do scroll
        window.scrollTo(0, scrollYRef.current || 0);
      };
    }
  }, [isMobile, isOpen, titleId]);

  // Listen for external events to open sidebar (mobile) e keyboard events
  useEffect(() => {
    const handleOpenSidebar = () => {
      if (isMobile) {
        setIsOpen(true);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobile && isOpen) {
        closeSidebar();
      }
    };

    const handleBackdropClick = (e) => {
      if (e.target === overlayRef.current) {
        closeSidebar();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('openFilterSidebar', handleOpenSidebar);
      document.addEventListener('keydown', handleKeyDown);
      overlayRef.current?.addEventListener('click', handleBackdropClick);
      
      // Expor funções globais para abertura/fechamento
      window.openFilters = () => setIsOpen(true);
      window.closeFilters = () => setIsOpen(false);
      
      return () => {
        window.removeEventListener('openFilterSidebar', handleOpenSidebar);
        document.removeEventListener('keydown', handleKeyDown);
        overlayRef.current?.removeEventListener('click', handleBackdropClick);
        delete window.openFilters;
        delete window.closeFilters;
      };
    }
  }, [isMobile, isOpen]);

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
      
      // Devolver foco para o botão que abriu o painel
      setTimeout(() => {
        const filterButton = document.querySelector('.floating-filter-button');
        if (filterButton) {
          filterButton.focus();
        }
      }, 100);
    }
  };

  // Estado para controlar a expansão da seção "Ver filtros aplicados"
  const [appliedFiltersExpanded, setAppliedFiltersExpanded] = useState(false);

  // Handler direto para preços sem estado local
  const handlePrice = (value) => {
    updatePriceRange(value[0], value[1]);
  };

  // Função normalizada para comparação de strings
  const normalizeString = (str) => {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
      .replace(/[^a-z0-9]/g, '');       // Remove caracteres especiais
  };

  const handleBrandSelect = (brandName) => {
    const normalizedBrand = brandName.trim();
    
    // Verificar se já está selecionada
    const isAlreadySelected = filters.brands.some(brand => 
      normalizeString(brand) === normalizeString(normalizedBrand)
    );
    
    if (isAlreadySelected) {
      // Remover marca
      const newBrands = filters.brands.filter(brand => 
        normalizeString(brand) !== normalizeString(normalizedBrand)
      );

      updateFilters({ 
        brands: newBrands,
        brand: newBrands.length > 0 ? newBrands[newBrands.length - 1] : ''
      });
    } else {
      // Adicionar marca
      const newBrands = [...filters.brands, normalizedBrand];

      updateFilters({ 
        brands: newBrands,
        brand: normalizedBrand
      });
    }
  };

  const handleModelSelect = (model) => {
    toggleArrayFilter('models', model);
  };

  const handleYearSelect = (year) => {
    const currentYears = filters.anos || [];
    const yearExists = currentYears.includes(year);
    
    let newYears;
    if (yearExists) {
      newYears = currentYears.filter(y => y !== year);
    } else {
      newYears = [...currentYears, year];
    }
    
    updateFilters({ anos: newYears });
  };

  // Handler para quilometragem
  const handleMileageChange = (field, value) => {
    const numValue = value === '' ? null : Number(value);
    updateFilters({ [field]: numValue });
  };

  // Handler para campos de input de ano
  const handleYearInputChange = (field, value) => {
    const numValue = value === '' ? null : Number(value);
    updateFilters({ [field]: numValue });
  };

  const handleFuelSelect = (fuel) => {
    // Corrigir "Gasolina regular" para "Gasolina" para compatibilidade com dados
    const correctedFuel = fuel === 'Gasolina regular' ? 'Gasolina' : fuel;
    toggleArrayFilter('fuel', correctedFuel);
  };

  const handleTransmissionSelect = (transmission) => {
    toggleArrayFilter('transmission', transmission);
  };

  // Usar função clearAllFilters do contexto global

  console.log('🔧 Renderizando FilterSidebar, activeSection:', activeSection);

  // Filtros dinâmicos baseados no estoque atual
  const marcasDisponiveis = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];
    
    // Extrair marcas únicas do estoque
    const marcasUnicas = [...new Set(vehicles.map(v => v.marca?.toUpperCase() || '').filter(Boolean))];
    
    // Contar quantidade de carros por marca
    const marcasComQuantidade = marcasUnicas.map(marca => {
      const quantidade = vehicles.filter(v => 
        v.marca?.toUpperCase() === marca
      ).length;
      
      return {
        nome: marca,
        quantidade,
        // Capitalizar nome para exibição
        nomeExibicao: marca.split(' ').map(palavra => 
          palavra.charAt(0) + palavra.slice(1).toLowerCase()
        ).join(' ')
      };
    });
    
    // Ordenar por quantidade (maior primeiro)
    return marcasComQuantidade.sort((a, b) => b.quantidade - a.quantidade);
  }, [vehicles]);

  const modelosDisponiveis = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];
    
    // Se nenhuma marca estiver selecionada, mostrar todos os modelos
    let veiculosFiltrados = vehicles;
    
    // Se marcas estiverem selecionadas, filtrar por elas
    if (filters.brands && filters.brands.length > 0) {
      veiculosFiltrados = vehicles.filter(v => 
        filters.brands.some(marca => 
          v.marca?.toUpperCase() === marca.toUpperCase()
        )
      );
    }
    
    // Extrair modelos únicos dos veículos filtrados
    const modelosUnicos = [...new Set(veiculosFiltrados.map(v => v.modelo).filter(Boolean))];
    
    // Contar quantidade por modelo
    const modelosComQuantidade = modelosUnicos.map(modelo => {
      const quantidade = veiculosFiltrados.filter(v => v.modelo === modelo).length;
      return {
        nome: modelo,
        quantidade,
        nomeExibicao: modelo
      };
    });
    
    // Ordenar por quantidade (maior primeiro)
    return modelosComQuantidade.sort((a, b) => b.quantidade - a.quantidade);
  }, [vehicles, filters.brands]);

  // Tags dinâmicas baseadas nos veículos do estoque
  const ofertasDisponiveis = useMemo(() => {
    if (!vehicles || vehicles.length === 0) return [];
    
    console.log('🏷️ Debug: Processando tags dos veículos...');
    console.log('📋 Primeiro veículo com tags:', vehicles.find(v => v.tags || v.tag));
    
    // Extrair todas as tags dos veículos
    const todasTags = [];
    vehicles.forEach(veiculo => {
      // Verificar tanto 'tags' (array) quanto 'tag' (objeto)
      if (veiculo.tags && Array.isArray(veiculo.tags)) {
        veiculo.tags.forEach(tag => {
          if (tag && typeof tag === 'string' && tag.trim()) {
            todasTags.push(tag.trim());
          }
        });
      } else if (veiculo.tag && typeof veiculo.tag === 'object' && veiculo.tag.nome) {
        // Se a tag for um objeto com nome
        todasTags.push(veiculo.tag.nome.trim());
      }
    });
    
    console.log('🏷️ Total de tags encontradas:', todasTags.length);
    console.log('🏷️ Primeiras 5 tags:', todasTags.slice(0, 5));
    
    // Contar ocorrências de cada tag
    const contagemTags = {};
    todasTags.forEach(tag => {
      const tagNormalizada = tag.toLowerCase();
      if (contagemTags[tagNormalizada]) {
        contagemTags[tagNormalizada].count++;
      } else {
        contagemTags[tagNormalizada] = {
          original: tag,
          count: 1,
          id: tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        };
      }
    });
    
    // Converter para array e ordenar por quantidade
    const resultado = Object.values(contagemTags)
      .filter(tag => tag.count > 0)
      .sort((a, b) => b.count - a.count);
      
    console.log('🏷️ Ofertas disponíveis finais:', resultado);
    
    return resultado;
  }, [vehicles]);

  const carTypes = ['Hatch', 'Sedan', 'SUV', 'Pick-up', 'Conversível', 'Wagon'];

  // Contar filtros ativos - DEVE vir ANTES de qualquer return condicional
  const activeFiltersCount = useMemo(() => {
    return getActiveFiltersCount();
  }, [getActiveFiltersCount]);

  // Funções de limpeza para os chips
  const clearFns = useMemo(() => ({
    // preço/km: limpam intervalo único
    price: () => {
      updateFilters({ minPrice: null, maxPrice: null });
    },
    km: () => {
      updateFilters({ kmMin: null, kmMax: null });
    },
    // ano por faixa
    yearRange: () => {
      updateFilters({ anoMin: null, anoMax: null });
    },
    // anos soltos  
    yearSingle: (y) => {
      const currentYears = filters.anos || [];
      updateFilters({ anos: currentYears.filter(x => Number(x) !== Number(y)) });
    },
    yearSeq: (a, b) => {
      const currentYears = filters.anos || [];
      updateFilters({ anos: currentYears.filter(x => Number(x) < a || Number(x) > b) });
    },
    yearsAll: () => updateFilters({ anos: [] }),
    // demais filtros multi
    brand: (b) => {
      const currentBrands = filters.brands || [];
      updateFilters({ brands: currentBrands.filter(x => x !== b) });
    },
    type: (t) => {
      const currentTypes = filters.category || [];
      updateFilters({ category: currentTypes.filter(x => x !== t) });
    },
    fuel: (fu) => {
      const currentFuels = filters.fuel || [];
      updateFilters({ fuel: currentFuels.filter(x => x !== fu) });
    },
    trans: (tr) => {
      const currentTrans = filters.transmission || [];
      updateFilters({ transmission: currentTrans.filter(x => x !== tr) });
    },
  }), [filters, updateFilters]);

  // Chips ativos com nova lógica
  const activeChips = useMemo(() => {
    const filtersForChips = {
      priceMin: filters.minPrice,
      priceMax: filters.maxPrice,
      kmMin: filters.kmMin,
      kmMax: filters.kmMax,
      yearMin: filters.anoMin,
      yearMax: filters.anoMax,
      years: filters.anos,
      brands: filters.brands,
      types: filters.category,
      fuels: filters.fuel,
      transmissions: filters.transmission
    };
    return buildActiveChips(filtersForChips, clearFns, { maxVisible: 6 });
  }, [filters, clearFns]);

  // Contagem de resultados real usando o hook
  const filtersForCount = useMemo(() => ({
    priceMin: filters.minPrice,
    priceMax: filters.maxPrice,
    kmMin: filters.kmMin,
    kmMax: filters.kmMax,
    yearMin: filters.anoMin,
    yearMax: filters.anoMax,
    years: filters.anos,
    brands: filters.brands,
    types: filters.category,
    fuels: filters.fuel,
    transmissions: filters.transmission
  }), [filters]);
  
  const resultCount = useLiveResultCount({ 
    filters: filtersForCount, 
    inventory: vehicles,
    computeResultCount: null // pode passar função se houver
  });

  // Return condicional DEPOIS de todos os hooks
  if (!isOpen && isMobile) return null;

  // Conteúdo do componente
  const filterContent = (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          ref={overlayRef}
          className="filters-overlay" 
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 2147483000, // Z-index altíssimo para garantir que fica acima de tudo
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.15s ease'
          }}
        />
      )}

      {/* Painel Modal */}
      <motion.div
        initial={isMobile ? { transform: "translateY(100%)" } : { x: 0 }}
        animate={isOpen ? { transform: "translateY(0%)" } : isMobile ? { transform: "translateY(100%)" } : { x: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`filters-panel ${isMobile ? 'mobile' : 'desktop'}`}
        role={isMobile ? "dialog" : undefined}
        aria-modal={isMobile ? "true" : undefined}
        aria-labelledby={isMobile ? titleId : undefined}
        style={{
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? 0 : '80px',
          inset: isMobile ? 0 : 'auto',
          width: isMobile ? '100vw' : '320px',
          maxWidth: isMobile ? '100vw' : '320px',
          height: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : 'none',
          backgroundColor: '#ffffff',
          zIndex: isMobile ? 2147483001 : 1,
          border: isMobile ? 'none' : '1px solid #e9ecef',
          borderRadius: isMobile ? '0' : '12px',
          overflow: isMobile ? 'hidden' : 'visible',
          display: 'flex',
          flexDirection: 'column',
          marginRight: '0',
          boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
          boxSizing: 'border-box'
        }}
      >
        {/* Header do Modal */}
        <div className="filters-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 8px',
          borderBottom: '1px solid rgba(0,0,0,.06)',
          backgroundColor: '#ffffff'
        }}>
          {isMobile ? (
            <>
              <h2 id={titleId} style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '700',
                color: '#1a2332' 
              }}>
                Filtros
              </h2>
              <button 
                className="filters-close"
                onClick={closeSidebar} 
                aria-label="Fechar filtros"
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(0,0,0,.08)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                Filtros
              </h3>
              <button
                onClick={clearAllFilters}
                style={{
                  background: 'transparent',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Ver filtros aplicados (mobile e desktop) */}
        {activeChips.length > 0 && (
          <div className="filters-applied" style={{
            padding: '8px 16px',
            borderBottom: '1px solid rgba(0,0,0,.06)',
            minHeight: '48px'
          }}>
            <button
              onClick={() => setAppliedFiltersExpanded(!appliedFiltersExpanded)}
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                padding: '8px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                color: '#1A75FF',
                fontWeight: '500'
              }}
            >
              Ver filtros aplicados ({activeChips.length})
              <svg 
                style={{
                  width: '16px',
                  height: '16px',
                  transform: appliedFiltersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Chips de filtros aplicados com nova lógica */}
            {appliedFiltersExpanded && activeChips.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                maxHeight: '96px',
                overflowY: 'auto',
                paddingTop: '8px'
              }}>
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={chip.onClear}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #2563EB',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#2563EB',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {chip.label}
                    <span style={{ marginLeft: '4px', fontSize: '14px' }}>×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Removido componente ActiveFilters duplicado e seção legada */}
        {false && false && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Filtros aplicados</span>
              <button onClick={clearAllFilters} style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Limpar
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {filters.brands.map(brand => (
                <span key={brand} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  {brand}
                </span>
              ))}
              {filters.priceRange && (
                <span style={{
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  {filters.priceRange}
                </span>
              )}
              {filters.offers.map(offer => (
                <span key={offer} style={{
                  backgroundColor: '#f0f8ff',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid #2563EB',
                  color: '#2563EB'
                }}>
                  {offer.charAt(0).toUpperCase() + offer.slice(1).replace('-', ' ')}
                </span>
              ))}
              {filters.years.map(year => (
                <span key={year} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  {year}
                </span>
              ))}
              {(filters.minMileage || filters.maxMileage) && (
                <span style={{
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  {filters.minMileage || '0'}km - {filters.maxMileage || '∞'}km
                </span>
              )}
              {filters.fuel && filters.fuel.map(fuel => (
                <span key={fuel} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  {fuel}
                </span>
              ))}
              {filters.transmission && filters.transmission.map(transmission => (
                <span key={transmission} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  border: '1px solid #e9ecef'
                }}>
                  {transmission}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Menu lateral - Sidebar estrutural */}
        <div style={{ 
          display: 'flex', 
          flex: 1,
          overflow: 'hidden' // Sidebar sem scroll direto
        }}>
          {/* Menu esquerdo - Container scrollável isolado */}
          <div style={{
            width: isMobile ? '100px' : '120px',
            borderRight: '1px solid #e9ecef',
            backgroundColor: '#f8f9fa',
            minWidth: isMobile ? '100px' : '120px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // Container estrutural sem scroll
          }}>
            <div style={{
              flex: 1,
              overflowY: isMobile ? 'auto' : 'visible', // Desktop sem scroll próprio
              paddingBottom: isMobile ? '100px' : '0' // Reserva espaço para barra fixa
            }}>
            {[
              { key: 'price', label: 'Faixa de preço', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              ) },
              { key: 'offers', label: 'Ofertas', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              ) },
              { key: 'brands', label: 'Marca', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              ) },
              { key: 'models', label: 'Modelo', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10V6c0-2-2-4-4-4H4c-2 0-4 2-4 4v10c0 .6.4 1 1 1h2"></path>
                  <circle cx="7" cy="17" r="2"></circle>
                  <path d="M9 17h6"></path>
                  <circle cx="17" cy="17" r="2"></circle>
                </svg>
              ) },
              { key: 'years', label: 'Ano e Quilometragem', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              ) },
              { key: 'types', label: 'Categoria', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12,2 2,7 12,12 22,7 12,2"></polygon>
                  <polyline points="2,17 12,22 22,17"></polyline>
                  <polyline points="2,12 12,17 22,12"></polyline>
                </svg>
              ) },
              { key: 'mechanics', label: 'Mecânica', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              ) }
            ].map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 8px' : '16px 12px',
                  border: 'none',
                  background: activeSection === section.key ? '#2563EB' : 'transparent',
                  color: activeSection === section.key ? '#ffffff' : '#6c757d',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: isMobile ? '10px' : '11px',
                  fontWeight: '500',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ opacity: 0.9 }}>{section.icon}</span>
                {section.label}
              </button>
            ))}
            </div>
          </div>

          {/* Conteúdo direito - Container scrollável isolado */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // Container estrutural sem scroll
          }}>
            <div style={{
              flex: 1,
              overflowY: 'auto', // Scroll habilitado para desktop e mobile
              overflowX: 'hidden',
              padding: isMobile ? '16px 12px' : '16px 20px',
              paddingBottom: isMobile ? '100px' : '20px', // Reserva espaço para barra fixa
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch', // Scroll suave no iOS
              maxWidth: '100%',
              boxSizing: 'border-box',
              maxHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 250px)' // Altura máxima para permitir scroll
            }}>
            {activeSection === 'price' && (
              <div style={{ padding: '16px 0' }}>
                <p style={{ 
                  fontSize: '14px', 
                  marginBottom: '16px', 
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Faixa de preço
                </p>
                
                {/* Campos editáveis De/Até */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      fontSize: '12px', 
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      De
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice || 0}
                      onChange={(e) => {
                        const newMin = sanitizeNumber(e.target.value) || 0;
                        updateFilters({ minPrice: newMin });
                        updatePriceRange(newMin, filters.maxPrice || 999999);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        appearance: 'textfield',
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none'
                      }}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ 
                      fontSize: '12px', 
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      Até
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice || 999999}
                      onChange={(e) => {
                        const newMax = sanitizeNumber(e.target.value) || 999999;
                        updateFilters({ maxPrice: newMax });
                        updatePriceRange(filters.minPrice || 0, newMax);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        appearance: 'textfield',
                        MozAppearance: 'textfield',
                        WebkitAppearance: 'none'
                      }}
                      placeholder="999999"
                      min="0"
                    />
                  </div>
                </div>

                {/* Botões de faixas pré-definidas */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#64748b',
                    marginBottom: '12px',
                    fontWeight: '500'
                  }}>
                    Faixas rápidas
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Até R$ 50.000', min: 0, max: 50000, id: 'range1' },
                      { label: 'R$ 50.001 a R$ 75.000', min: 50001, max: 75000, id: 'range2' },
                      { label: 'R$ 75.001 a R$ 100.000', min: 75001, max: 100000, id: 'range3' },
                      { label: 'R$ 100.001 a R$ 125.000', min: 100001, max: 125000, id: 'range4' },
                      { label: 'Acima de R$ 125.000', min: 125001, max: 999999, id: 'range5' }
                    ].map((range) => {
                      const isActive = filters.minPrice === range.min && filters.maxPrice === range.max;
                      return (
                        <button
                          key={range.id}
                          onClick={() => {
                            if (isActive) {
                              // Se já está ativo, limpar filtros
                              updatePriceRange(0, 999999);
                            } else {
                              // Aplicar esta faixa
                              updatePriceRange(range.min, range.max);
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: isActive ? '2px solid #2563EB' : '1px solid #e5e7eb',
                            borderRadius: '6px',
                            backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                            color: isActive ? '#2563EB' : '#374151',
                            fontSize: '13px',
                            fontWeight: isActive ? '600' : '400',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {range.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Valores atuais */}
                <div style={{
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '4px'
                  }}>
                    Faixa selecionada:
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2563EB'
                  }}>
                    R$ {(filters.minPrice || 0).toLocaleString()} - R$ {(filters.maxPrice || 999999).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'offers' && (
              <div style={{ padding: '16px 0' }}>
                <p style={{ 
                  fontSize: '14px', 
                  marginBottom: '16px', 
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Ofertas especiais
                </p>
                
                {/* Tags de ofertas dinâmicas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {ofertasDisponiveis.length === 0 ? (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      Nenhuma oferta especial disponível no momento.
                    </div>
                  ) : (
                    ofertasDisponiveis.map((offer) => {
                      const isActive = filters.offers.includes(offer.original);
                      return (
                        <button
                          key={offer.id}
                          onClick={() => toggleArrayFilter('offers', offer.original)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '12px 16px',
                            border: isActive ? '2px solid #2563EB' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                            color: isActive ? '#2563EB' : '#374151',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              marginBottom: '2px'
                            }}>
                              {offer.original}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: isActive ? '#2563EB' : '#64748b'
                            }}>
                              {offer.count} veículos com esta oferta
                            </div>
                          </div>
                          <div style={{
                            minWidth: '32px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: isActive ? '#2563EB' : '#e5e7eb',
                            color: isActive ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {offer.count}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Resumo das ofertas selecionadas */}
                {filters.offers.length > 0 && (
                  <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '6px',
                    border: '1px solid #2563EB'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#2563EB',
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>
                      Ofertas selecionadas:
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#2563EB'
                    }}>
                      {filters.offers.length} tipo(s) de oferta
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'brands' && (
              <div style={{ padding: '16px 0' }}>
                <p style={{ 
                  fontSize: '14px', 
                  marginBottom: '16px', 
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Filtrar por marca
                </p>

                {/* Campo de busca */}
                <div style={{
                  position: 'relative',
                  marginBottom: '20px'
                }}>
                  <input
                    type="text"
                    placeholder="Buscar marca..."
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 40px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      outline: 'none'
                    }}
                  />
                  <svg
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: '#9ca3af'
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>

                {/* Mais populares */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Mais populares
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '8px',
                    maxWidth: '100%',
                    padding: '0 4px'
                  }}>
                    {marcasDisponiveis.slice(0, 6).map(marca => {
                      const logoMap = {
                        'FIAT': '/images/resource/brand-fiat.png',
                        'VOLKSWAGEN': '/images/brands/volkswagen.png',
                        'CITROËN': '/images/resource/citroen.png',
                        'FORD': '/images/ford-logo.png',
                        'RENAULT': '/images/brands/renault.png',
                        'CHEVROLET': '/images/brands/chevrolet.png',
                        'HONDA': '/images/resource/honda.png',
                        'TOYOTA': '/images/brands/toyota.png',
                        'HYUNDAI': '/images/resource/hyundai.png',
                        'JEEP': '/images/resource/brand-jeep.png',
                        'PEUGEOT': '/images/brands/peugeot.png',
                        'NISSAN': '/images/brands/nissan.png',
                        'KIA': '/images/brands/kia-new.png',
                        'BMW': '/images/bmw-logo.png',
                        'MERCEDES-BENZ': '/images/brands/mercedes-benz.png',
                        'AUDI': '/images/brands/audi.png',
                        'MITSUBISHI': '/images/brands/mitsubishi.png',
                        'VOLVO': '/images/brands/volvo.png',
                        'SUZUKI': '/images/brands/suzuki.png',
                        'MINI': '/images/brands/mini.png'
                      };
                      
                      const logoSrc = logoMap[marca.nome] || '/images/brands/default.png';
                      // Verificar seleção com normalização
                      const isSelected = filters.brands.some(selectedBrand => 
                        normalizeString(selectedBrand) === normalizeString(marca.nomeExibicao)
                      );

                      return (
                        <button
                          key={marca.nome}
                          onClick={() => handleBrandSelect(marca.nomeExibicao)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px 12px',
                            border: isSelected ? '2px solid #2563EB' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            gap: '8px'
                          }}
                        >
                          <div style={{
                            width: '64px',
                            height: '64px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'transparent',
                            borderRadius: '8px',
                            padding: '8px'
                          }}>
                            <img fetchpriority="low" decoding="async" loading="lazy" src={logoSrc} alt={marca.nomeExibicao} style={{ width: '100%', height: '100%', objectFit: 'contain', aspectRatio: '1', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} onError={(e) => {
                                e.target.outerHTML = `<div style="
                                  width: 48px; 
                                  height: 48px; 
                                  display: flex; 
                                  align-items: center; 
                                  justify-content: center; 
                                  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); 
                                  border-radius: 8px; 
                                  font-size: 10px; 
                                  color: #64748b; 
                                  text-align: center;
                                  font-weight: 600;
                                  text-transform: uppercase;
                                  letter-spacing: 0.5px;
                                ">${marca.nomeExibicao.substring(0, 3)}</div>`;
                              }}
                            />
                          </div>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: isSelected ? '#2563EB' : '#374151',
                            textAlign: 'center',
                            lineHeight: '1.2'
                          }}>
                            {marca.nomeExibicao}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Todas as marcas */}
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Todas as marcas
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {marcasDisponiveis.map(marca => {
                      // Verificar seleção com normalização
                      const isSelected = filters.brands.some(selectedBrand => 
                        normalizeString(selectedBrand) === normalizeString(marca.nomeExibicao)
                      );
                      return (
                        <label
                          key={marca.nome}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            border: '1px solid #f3f4f6',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#f0f8ff' : '#ffffff',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleBrandSelect(marca.nomeExibicao)}
                            style={{
                              width: '16px',
                              height: '16px',
                              accentColor: '#2563EB'
                            }}
                          />
                          <span style={{
                            fontSize: '14px',
                            color: isSelected ? '#2563EB' : '#374151',
                            fontWeight: isSelected ? '500' : '400'
                          }}>
                            {marca.nomeExibicao}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'models' && (
              <div style={{ padding: '16px 0' }}>
                <p style={{ 
                  fontSize: '14px', 
                  marginBottom: '16px', 
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Filtrar por modelo
                </p>

                {/* Campo de busca */}
                <div style={{
                  position: 'relative',
                  marginBottom: '20px'
                }}>
                  <input
                    type="text"
                    placeholder="Buscar modelo..."
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 40px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb',
                      outline: 'none'
                    }}
                  />
                  <svg
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '16px',
                      height: '16px',
                      color: '#9ca3af'
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>

                {/* Mais populares */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Mais populares
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '6px',
                    maxWidth: '100%',
                    padding: '0 4px'
                  }}>
                    {modelosDisponiveis.slice(0, 8).map(modelo => {
                      const isSelected = filters.models.includes(modelo.nome);
                      return (
                        <button
                          key={modelo.nome}
                          onClick={() => handleModelSelect(modelo.nome)}
                          style={{
                            padding: '12px 8px',
                            border: isSelected ? '2px solid #2563EB' : '1px solid #e5e7eb',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: isSelected ? '#2563EB' : '#374151',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}
                        >
                          {modelo.nomeExibicao}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Todos os modelos alfabéticos - Dinâmico */}
                <div>
                  {(() => {
                    // Agrupar modelos disponíveis por primeira letra
                    const modelosAgrupados = modelosDisponiveis.reduce((grupos, modelo) => {
                      const primeiraLetra = modelo.nome.charAt(0).toUpperCase();
                      const categoria = /^\d/.test(primeiraLetra) ? '#' : primeiraLetra;
                      
                      if (!grupos[categoria]) {
                        grupos[categoria] = [];
                      }
                      grupos[categoria].push(modelo);
                      return grupos;
                    }, {});

                    // Ordenar as categorias: # primeiro, depois alfabético
                    const categoriasOrdenadas = Object.keys(modelosAgrupados).sort((a, b) => {
                      if (a === '#') return -1;
                      if (b === '#') return 1;
                      return a.localeCompare(b);
                    });

                    return categoriasOrdenadas.map(categoria => (
                      <div key={categoria} style={{ marginBottom: '16px' }}>
                        <h5 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '8px'
                        }}>
                          {categoria}
                        </h5>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          gap: '6px',
                          maxWidth: '100%',
                          padding: '0 4px'
                        }}>
                          {modelosAgrupados[categoria].map(modelo => {
                            const isSelected = filters.models.includes(modelo.nome);
                            return (
                              <label
                                key={modelo.nome}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 8px',
                                  border: '1px solid #f3f4f6',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? '#f0f8ff' : '#ffffff',
                                  transition: 'all 0.2s ease',
                                  maxWidth: '100%',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleModelSelect(modelo.nome)}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    accentColor: '#2563EB'
                                  }}
                                />
                                <span style={{
                                  fontSize: '12px',
                                  color: isSelected ? '#2563EB' : '#374151',
                                  fontWeight: isSelected ? '500' : '400'
                                }}>
                                  {modelo.nomeExibicao}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {activeSection === 'years' && (
              <div style={{ padding: '16px 0' }}>
                <p style={{ 
                  fontSize: '14px', 
                  marginBottom: '16px', 
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Filtrar por ano e quilometragem
                </p>

                {/* Seção Ano */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Ano
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '6px',
                    maxWidth: '100%',
                    padding: '0 4px'
                  }}>
                    {[
                      2010, 2011, 2012, 2013,
                      2014, 2015, 2016, 2017,
                      2018, 2019, 2020, 2021,
                      2022, 2023, 2024, 2025
                    ].map(year => {
                      const isSelected = filters.anos && filters.anos.includes(year);
                      return (
                        <button
                          key={year}
                          onClick={() => handleYearSelect(year)}
                          style={{
                            padding: '6px 4px',
                            border: isSelected ? '2px solid #2563EB' : '1px solid #e5e7eb',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '500',
                            color: isSelected ? '#2563EB' : '#374151',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            maxWidth: '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Campos de input para intervalo de ano */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    marginTop: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Mínimo
                      </label>
                      <input
                        type="number"
                        value={filters.anoMin || ''}
                        placeholder="2010"
                        onChange={(e) => handleYearInputChange('anoMin', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                      />
                    </div>
                    <span style={{
                      color: '#64748b',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      -
                    </span>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Máximo
                      </label>
                      <input
                        type="number"
                        value={filters.anoMax || ''}
                        placeholder="2025"
                        onChange={(e) => handleYearInputChange('anoMax', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Seção Quilometragem */}
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Quilometragem
                  </h4>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Mínimo
                      </label>
                      <input
                        type="number"
                        value={filters.kmMin || ''}
                        placeholder="2.057"
                        onChange={(e) => handleMileageChange('kmMin', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                      />
                    </div>
                    <span style={{
                      color: '#64748b',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      -
                    </span>
                    <div style={{ flex: 1 }}>
                      <label style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        Máximo
                      </label>
                      <input
                        type="number"
                        value={filters.kmMax || ''}
                        placeholder="153.638"
                        onChange={(e) => handleMileageChange('kmMax', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'types' && (
              <div style={{ padding: '16px 0' }}>
                <h4 style={{ 
                  marginBottom: '16px', 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Categoria
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {carTypes.map(type => {
                    const isSelected = filters.category.includes(type.toLowerCase()) || filters.carTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleArrayFilter('category', type.toLowerCase())}
                        style={{
                          padding: '10px 14px',
                          border: isSelected ? '2px solid #2563EB' : '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '400',
                          color: isSelected ? '#2563EB' : '#6b7280',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%'
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === 'mechanics' && (
              <div style={{ padding: '16px 0' }}>
                <h4 style={{ 
                  marginBottom: '20px', 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Mecânica
                </h4>

                {/* Seção Combustível */}
                <div style={{ marginBottom: '20px' }}>
                  <h5 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '12px'
                  }}>
                    Combustível
                  </h5>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {['Diesel', 'Elétrico', 'Flex', 'Gasolina'].map(fuel => {
                      const isSelected = filters.fuel && filters.fuel.includes(fuel);
                      return (
                        <button
                          key={fuel}
                          onClick={() => handleFuelSelect(fuel)}
                          style={{
                            padding: '10px 14px',
                            border: isSelected ? '2px solid #2563EB' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '400',
                            color: isSelected ? '#2563EB' : '#6b7280',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%'
                          }}
                        >
                          {fuel}
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* Seção Transmissão */}
                <div>
                  <h5 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '12px'
                  }}>
                    Transmissão
                  </h5>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {['Automático', 'Manual'].map(transmission => {
                      const isSelected = filters.transmission && filters.transmission.includes(transmission);
                      return (
                        <button
                          key={transmission}
                          onClick={() => handleTransmissionSelect(transmission)}
                          style={{
                            padding: '10px 14px',
                            border: isSelected ? '2px solid #2563EB' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '400',
                            color: isSelected ? '#2563EB' : '#6b7280',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: '1 1 45%'
                          }}
                        >
                          {transmission}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Footer fixo (mobile) */}
        {isMobile && (
          <div className="filters-footer" style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            padding: `12px 16px calc(12px + env(safe-area-inset-bottom))`,
            backgroundColor: '#ffffff',
            borderTop: '1px solid rgba(0,0,0,.08)',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '12px',
            minHeight: '64px'
          }}>
            <button 
              className="btn-outline"
              onClick={clearAllFilters}
              style={{
                height: '48px',
                border: '1px solid currentColor',
                borderRadius: '12px',
                background: 'transparent',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#64748b'
              }}
            >
              Limpar
            </button>
            <button 
              className="btn-primary"
              onClick={closeSidebar}
              style={{
                height: '48px',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                background: '#1A75FF',
                color: '#fff',
                width: '100%',
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Ver ({resultCount}) resultados
            </button>
          </div>
        )}
      </motion.div>
    </>
  );

  // Renderizar com createPortal para mobile
  if (isMobile && typeof document !== 'undefined') {
    return createPortal(filterContent, document.body);
  }

  // Para desktop, retorna normalmente
  return filterContent;
}