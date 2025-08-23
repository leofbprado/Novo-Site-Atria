import MobileSearchFilter from "@/components/carListings/MobileSearchFilter";
import { Suspense, lazy } from 'react';

// Lazy load do FilterSidebar que é pesado
const FilterSidebar = lazy(() => import("@/components/carListings/FilterSidebar"));

import Listings1 from "@/components/carListings/Listings1";

import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import FloatingFilterButton from "@/components/common/FloatingFilterButton";
import { useFilters } from "@/contexts/FilterContext";
import { motion, AnimatePresence } from "framer-motion";

import MetaComponent from "@/components/common/Metacomonent";
import EstoqueSEO from "@/components/seo/EstoqueSEO";

const metadata = {
  title: "Estoque de Veículos || Átria Veículos - Concessionária",
  description: "Átria Veículos - Encontre o carro perfeito para você",
};
export default function InventoryListPage1() {
  const { filters, updateFilters } = useFilters();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  const [isMobile, setIsMobile] = useState(false);

  // Processar parâmetros da URL para filtros
  useEffect(() => {
    const urlTipo = searchParams.get('tipo');
    const urlMarca = searchParams.get('marca');
    const urlQ = searchParams.get('q'); // CORREÇÃO: Ler parâmetro de busca
    
    const filtersToUpdate = {};
    let hasUpdates = false;
    
    // Processar busca por query
    if (urlQ && urlQ.trim()) {
      console.log(`🔍 Busca detectada na URL: "${urlQ}"`);
      filtersToUpdate.search = urlQ.trim();
      setSearchQuery(urlQ.trim()); // Atualizar input local
      hasUpdates = true;
    }
    
    if (urlTipo) {
      console.log(`🔧 Tipo detectado na URL: ${urlTipo}`);
      // Mapear tipo da URL para categoria no filtro
      const categoryMapping = {
        'hatch': 'hatch',
        'sedan': 'sedan', 
        'suv': 'suv',
        'pickup': 'pick-up'
      };
      
      const mappedCategory = categoryMapping[urlTipo.toLowerCase()] || urlTipo.toLowerCase();
      filtersToUpdate.category = [mappedCategory];
      console.log(`✅ Filtro de categoria aplicado: ${mappedCategory}`);
      hasUpdates = true;
    }
    
    if (urlMarca) {
      console.log(`🔧 Marca detectada na URL: ${urlMarca}`);
      filtersToUpdate.brands = [urlMarca];
      console.log(`✅ Filtro de marca aplicado: ${urlMarca}`);
      hasUpdates = true;
    }
    
    // Aplicar filtros usando updateFilters do contexto
    if (hasUpdates) {
      updateFilters(filtersToUpdate);
      console.log('🔄 Filtros aplicados da URL:', filtersToUpdate);
    }
  }, [searchParams, updateFilters]);

  // Sugestões dinâmicas para busca
  const allSuggestions = [
    // Brands (Marcas)
    "BMW", "CAOA Chery", "Chevrolet", "Citroën", "Fiat", "Ford", 
    "Honda", "Hyundai", "JAC", "Jeep", "KIA", "Lifan", "Renault", 
    "Toyota", "Volkswagen", "Audi", "Mercedes", "Nissan", "Peugeot",
    
    // Models (Modelos populares)
    "Renegade", "Kwid", "2008", "HB20", "Onix", "Compass", "Prisma", "C3",
    "Civic", "Corolla", "Gol", "Polo", "Ka", "Fiesta", "Uno", "Palio",
    "Tiguan", "Jetta", "Sandero", "Logan", "Ecosport", "Focus",
    
    // Categories (Categorias)
    "Hatch", "Sedan", "SUV", "Pick-up", "Crossover", "Coupé",
    
    // Fuel (Combustível)
    "Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico",
    
    // Transmission (Transmissão)
    "Automático", "Manual", "CVT",
    
    // Features (Características)
    "Completo", "Ar condicionado", "Airbag", "ABS", "GPS",
    
    // Conditions (Condições)
    "0km", "Seminovo", "Único dono", "IPVA pago", "Baixa quilometragem"
  ];

  // Detectar mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  return (
    <>
      <MetaComponent meta={metadata} />
      <EstoqueSEO 
        vehicles={filteredVehicles}
        currentPage={1}
        totalPages={1}
        title="Estoque de Veículos"
        description="Encontre o veículo ideal em nosso estoque de seminovos em Campinas-SP. Carros com qualidade, procedência e garantia."
      />
      
      {/* Seção de conteúdo com breadcrumb e título */}
      <section className="inventory-section pb-0 layout-radius">
        <div className="boxcar-container">
          {/* Breadcrumb e título */}
          <div className="boxcar-title-three">
            <nav id="bc-estoque" aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/">Início</Link></li>
                <li className="bc-sep" aria-hidden="true">/</li>
                <li aria-current="page">Estoque de Veículos</li>
              </ol>
            </nav>
            <h2 className="title">Estoque de Veículos</h2>
          </div>
          
          {/* Barra de busca com estilo da página individual */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
            marginTop: '30px'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Buscar veículos por marca, modelo ou ano..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                
                // Mostrar sugestões
                if (value.length > 0) {
                  const filtered = allSuggestions.filter(item => 
                    item.toLowerCase().includes(value.toLowerCase())
                  );
                  setSuggestions(filtered.slice(0, 6));
                  setShowSuggestions(true);
                } else {
                  setShowSuggestions(false);
                }
                
                // Aplicar busca tanto no mobile quanto no desktop com debounce
                setTimeout(() => {
                  updateFilters({
                    search: value
                  });
                }, 300);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Aplicar filtro usando updateFilters do contexto
                  updateFilters({ search: searchQuery });
                  setShowSuggestions(false);
                  
                  // Navegação com query parameter se não estiver na página de estoque
                  const currentPath = window.location.pathname;
                  if (!currentPath.includes('listings') && !currentPath.includes('estoque')) {
                    window.location.href = `/listings?q=${encodeURIComponent(searchQuery)}`;
                  }
                }
              }}
              onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: '100%',
                padding: '14px 18px',
                border: '1px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '16px',
                background: '#ffffff',
                color: '#374151',
                outline: 'none',
                fontFamily: 'inherit',
                cursor: 'text',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            
            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    marginTop: '4px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                        // Aplicar filtro usando updateFilters do contexto
                        updateFilters({ search: suggestion });
                      }}
                      style={{
                        padding: '12px 18px',
                        cursor: 'pointer',
                        borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                        fontSize: '14px',
                        color: '#374151',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ fontWeight: '500' }}>{suggestion}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
            
            {/* Botão Buscar - apenas desktop */}
            {!isMobile && (
              <button
                onClick={() => {
                  // Aplicar filtro usando updateFilters do contexto
                  updateFilters({ search: searchQuery });
                  
                  // Navegação com query parameter se não estiver na página de estoque
                  const currentPath = window.location.pathname;
                  if (!currentPath.includes('listings') && !currentPath.includes('estoque')) {
                    window.location.href = `/listings?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(255, 107, 53, 0.3)';
                }}
              >
                Buscar
              </button>
            )}
            
            {/* Botão "Mais filtros" - apenas mobile */}
            {isMobile && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openFilterSidebar'));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 16px',
                  background: '#405FF2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  boxShadow: '0 2px 8px rgba(64, 95, 242, 0.3)',
                  whiteSpace: 'nowrap',
                  minWidth: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(64, 95, 242, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(64, 95, 242, 0.3)';
                }}
              >
                Mais filtros
              </button>
            )}
          </div>
        </div>

        {/* Layout responsivo com grid de 2 colunas no Desktop */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '320px minmax(0, 1fr)',
          gap: isMobile ? '0' : '24px',
          minHeight: 'calc(100vh - 200px)',
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          padding: isMobile ? '0' : '0 20px',
          overflowX: 'hidden'
        }}>
          {/* FilterSidebar - Desktop: Coluna fixa, Mobile: display none (usa modal) */}
          <div style={{ 
            display: isMobile ? 'none' : 'block',
            position: 'sticky',
            top: '80px',
            height: 'auto',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'visible',
            width: '320px'
          }}>
            <Suspense fallback={<div style={{ width: '320px', height: '400px', background: '#f8f9fa', borderRadius: '12px' }} />}>
              <FilterSidebar />
            </Suspense>
          </div>

          {/* Área principal com listagem - Desktop: Coluna 2, Mobile: Coluna única */}
          <div style={{ 
            minWidth: 0, // Previne overflow
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <Listings1 onVehiclesChange={setFilteredVehicles} />
          </div>
        </div>
      </section>

      <FloatingFilterButton />


    </>
  );
}
