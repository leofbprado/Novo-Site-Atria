import React, { useState, useEffect } from 'react';
import { useFilters } from '@/contexts/FilterContext';

export default function ActiveFilters() {
  const { filters, updateFilters, clearAllFilters } = useFilters();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Função normalizada para comparação de strings
  const normalizeString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
      .replace(/[^a-z0-9]/g, '');       // Remove caracteres especiais
  };

  // Função para verificar se um valor é considerado ativo
  const isActiveValue = (key, value) => {
    // Campos que têm tratamento especial
    if (key === 'search' && value && value.trim() !== '') return true;
    if (key === 'priceRange' && value && value !== '') return true;
    if (key === 'brand' && value && value.trim() !== '') return true;
    if (key === 'model' && value && value.trim() !== '') return true;
    
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') {
      // Para preços, considerar ativo apenas se diferente dos valores padrão
      if (key === 'minPrice') return value > 0;
      if (key === 'maxPrice') return value < 999999;
      if (key === 'minMileage' || key === 'maxMileage') return value !== null && value > 0;
      return value > 0;
    }
    return false;
  };

  // Função para gerar chips de filtros ativos
  const generateFilterChips = () => {
    const chips = [];

    // Mapeamento de chaves para nomes amigáveis - expandido
    const filterLabels = {
      brands: 'Marca',
      models: 'Modelo', 
      years: 'Ano',
      anos: 'Ano',
      fuel: 'Combustível',
      transmission: 'Transmissão',
      carTypes: 'Tipo',
      category: 'Categoria',
      offers: 'Oferta',
      minPrice: 'Preço mín',
      maxPrice: 'Preço máx',
      minMileage: 'Km mín',
      maxMileage: 'Km máx',
      kmMin: 'Km mín',
      kmMax: 'Km máx',
      priceRange: 'Faixa de preço',
      search: 'Busca',
      brand: 'Marca',
      model: 'Modelo'
    };

    // Percorrer todas as chaves dos filtros de forma genérica
    Object.entries(filters).forEach(([key, value]) => {
      if (!isActiveValue(key, value)) return;

      const label = filterLabels[key] || key;

      if (Array.isArray(value)) {
        // Para arrays, criar um chip para cada item - evitar duplicatas
        const uniqueValues = [...new Set(value)];
        uniqueValues.forEach((item, index) => {
          chips.push({
            key: `${key}-${normalizeString(item)}-${index}`,
            label: `${label}: ${item}`,
            onRemove: () => {
              // Usar normalização para remoção
              const newArray = value.filter(v => 
                normalizeString(v) !== normalizeString(item)
              );
              updateFilters({ [key]: newArray });
              
              // Se removendo uma marca, limpar campo brand relacionado
              if (key === 'brands') {
                updateFilters({ brand: newArray.length > 0 ? newArray[newArray.length - 1] : '' });
              }
            }
          });
        });
      } else if (key === 'minPrice' || key === 'maxPrice') {
        // Tratamento especial para preços
        const formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
        
        chips.push({
          key,
          label: `${label}: ${formattedValue}`,
          onRemove: () => {
            if (key === 'minPrice') {
              updateFilters({ minPrice: 0 });
            } else {
              updateFilters({ maxPrice: 999999 });
            }
          }
        });
      } else if (key === 'minMileage' || key === 'maxMileage' || key === 'kmMin' || key === 'kmMax') {
        // Tratamento especial para quilometragem
        const formattedKm = `${value.toLocaleString('pt-BR')} km`;
        
        chips.push({
          key,
          label: `${label}: ${formattedKm}`,
          onRemove: () => {
            updateFilters({ [key]: null });
          }
        });
      } else if (key === 'priceRange') {
        // Tratamento especial para priceRange
        chips.push({
          key,
          label: `${label}: ${value}`,
          onRemove: () => {
            updateFilters({ priceRange: '', minPrice: 0, maxPrice: 999999 });
          }
        });
      } else {
        // Para strings e outros valores (search, brand, model, etc.)
        chips.push({
          key,
          label: `${label}: ${value}`,
          onRemove: () => {
            if (key === 'search') {
              updateFilters({ search: '' });
            } else if (key === 'brand') {
              updateFilters({ brand: '', brands: [] });
            } else if (key === 'model') {
              updateFilters({ model: '', models: [] });
            } else {
              updateFilters({ [key]: '' });
            }
          }
        });
      }
    });

    return chips;
  };

  const activeChips = generateFilterChips();
  
  // Se não há filtros ativos, não renderizar nada
  if (activeChips.length === 0) return null;

  // Render mobile colapsado
  if (isMobile) {
    return (
      <div style={{
        borderBottom: '1px solid #e9ecef',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>
        {/* Botão para expandir/colapsar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '100%',
            padding: '16px 20px',
            backgroundColor: '#f8f9fa',
            border: 'none',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e9ecef';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
          }}
        >
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#212529'
          }}>
            Ver filtros aplicados ({activeChips.length})
          </span>
          <span style={{
            fontSize: '12px',
            color: '#6c757d',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            ▼
          </span>
        </button>

        {/* Conteúdo expandido */}
        <div style={{
          maxHeight: isExpanded ? '200px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            padding: '16px 20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: '600',
                color: '#212529'
              }}>
                Filtros ativos
              </h4>
              
              <button
                onClick={clearAllFilters}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1d4ed8';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2563EB';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Limpar todos
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxHeight: '120px',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              paddingRight: '4px'
            }}>
              {activeChips.map(chip => (
                <div
                  key={chip.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: '#f0f8ff',
                    border: '1px solid #2563EB',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#2563EB',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.querySelector('button').style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f8ff';
                    e.currentTarget.style.color = '#2563EB';
                    e.currentTarget.querySelector('button').style.color = '#2563EB';
                  }}
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      cursor: 'pointer',
                      padding: '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render desktop (comportamento original)
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#ffffff',
      maxHeight: '220px',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '600',
          color: '#212529'
        }}>
          Filtros aplicados ({activeChips.length})
        </h4>
        
        <button
          onClick={clearAllFilters}
          style={{
            padding: '6px 12px',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1d4ed8';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#2563EB';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Limpar todos
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        maxHeight: '130px',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        paddingRight: '4px'
      }}>
        {activeChips.map(chip => (
          <div
            key={chip.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#f0f8ff',
              border: '1px solid #2563EB',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#2563EB',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
              e.currentTarget.style.color = 'white';
              e.currentTarget.querySelector('button').style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f8ff';
              e.currentTarget.style.color = '#2563EB';
              e.currentTarget.querySelector('button').style.color = '#2563EB';
            }}
          >
            <span>{chip.label}</span>
            <button
              onClick={chip.onRemove}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                cursor: 'pointer',
                padding: '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}