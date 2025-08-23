import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/mobile-search-filter.css";

export default function MobileSearchFilter({ onSearch, onFiltersChange }) {
  const [isSticky, setIsSticky] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);

  const [selectedSort, setSelectedSort] = useState("relevancia");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Smart search suggestions - DINÂMICO e COMPLETO
  const allSuggestions = [
    // Brands (Marcas)
    "BMW", "CAOA Chery", "Chevrolet", "Citroën", "Fiat", "Ford", 
    "Honda", "Hyundai", "JAC", "Jeep", "KIA", "Lifan", "Renault", 
    "Toyota", "Volkswagen", "Audi", "Mercedes", "Nissan", "Peugeot",
    
    // Models (Modelos populares)
    "Renegade", "Kwid", "2008", "HB20", "Onix", "Compass", "Prisma", "C3",
    "Civic", "Corolla", "Gol", "Polo", "Ka", "Fiesta", "Uno", "Palio",
    "Tiguan", "Jetta", "Sandero", "Logan", "Ecosport", "Focus",
    
    // Years (Anos)
    "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015",
    
    // Categories (Categorias)
    "Hatch", "Sedan", "SUV", "Pick-up", "Pick up", "Pickup", "Crossover", 
    "Conversível", "Coupé", "Minivan", "Van", "Utilitário",
    
    // Fuel (Combustível)
    "Flex", "Gasolina", "Álcool", "Diesel", "GNV", "Híbrido", "Elétrico",
    
    // Transmission (Transmissão)
    "Automático", "Manual", "CVT", "Automatizada", "Semi-automático",
    
    // Features (Características)
    "Completo", "Ar condicionado", "Direção hidráulica", "Vidros elétricos",
    "Trava elétrica", "Airbag", "ABS", "Som", "Multimídia", "GPS",
    "Câmera de ré", "Sensor de estacionamento", "Couro", "Rodas de liga",
    
    // Conditions (Condições)
    "0km", "Seminovo", "Único dono", "IPVA pago", "Licenciado", "Blindado",
    "Baixa quilometragem", "Alto padrão", "Revisado", "Garantia",
    
    // Colors (Cores)
    "Branco", "Prata", "Preto", "Vermelho", "Azul", "Cinza", "Bege",
    
    // Price terms (Termos de preço)
    "Barato", "Econômico", "Promoção", "Oferta", "Financiamento",
    
    // Tags and special offers
    "Oportunidade", "Imperdível", "Melhor preço", "Estado de zero"
  ];

  const sortOptions = [
    { id: "relevancia", label: "Relevância", group: "Outro" },
    { id: "menor-preco", label: "Menor preço", group: "Preço" },
    { id: "maior-preco", label: "Maior preço", group: "Preço" },
    { id: "menor-km", label: "Menor km", group: "Quilometragem" },
    { id: "maior-km", label: "Maior km", group: "Quilometragem" },
    { id: "mais-novo", label: "Mais novo", group: "Ano" },
    { id: "mais-velho", label: "Mais velho", group: "Ano" }
  ];

  // Sticky behavior on scroll (only on mobile)
  useEffect(() => {
    const handleScroll = () => {
      try {
        // Only enable sticky behavior on mobile screens (768px or less)
        if (window.innerWidth <= 768) {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          setIsSticky(scrollY > 300);
        } else {
          setIsSticky(false);
        }
      } catch (error) {
        console.error('Erro no scroll:', error);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll); // Handle window resize
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, []);

  const handleSearchChange = (e) => {
    try {
      const value = e.target.value || '';
      setSearchQuery(value);
      
      // Call the search callback
      if (onSearch) {
        onSearch(value);
      }
      
      if (value.length > 0) {
        const filtered = allSuggestions.filter(item => 
          item.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 8));
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Erro ao processar busca:', error);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    
    // Apply search filter
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  // Função para acionar a busca quando o botão for clicado
  const handleSearchSubmit = () => {
    try {
      if (searchQuery.trim()) {
        setShowSuggestions(false);
        onSearch(searchQuery.trim());
        console.log('🔍 Busca acionada via botão:', searchQuery.trim());
      }
    } catch (error) {
      console.error('Erro ao processar busca via botão:', error);
    }
  };

  const openFilterSidebar = () => {
    try {
      // Usar sempre o FilterSidebar (tanto mobile quanto desktop)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('openFilterSidebar'));
      }
    } catch (error) {
      console.error('Erro ao abrir filtro:', error);
    }
  };



  const openSortModal = () => {
    setShowSortModal(true);
  };

  const closeSortModal = () => {
    setShowSortModal(false);
  };

  const selectSort = (sortId) => {
    setSelectedSort(sortId);
    setShowSortModal(false);
    // Apply sort here
  };

  // Normal search bar (non-sticky)
  const NormalSearchBar = () => (
    <div className="simple-search-container" style={{
      display: 'flex',
      gap: '16px',
      padding: '24px 16px',
      background: '#1a2332',
      borderBottom: '2px solid #333',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="search-input-wrapper" style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        borderRadius: '30px',
        padding: '6px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
        width: '250px',
        border: '2px solid #ffffff'
      }}>
        <input
          type="text"
          placeholder="Digite marca, modelo, ano..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearchSubmit();
            }
          }}
          onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="smart-search-input"
          enterKeyHint="search"
          style={{
            width: '100%',
            padding: '14px 50px 14px 20px',
            border: 'none',
            borderRadius: '24px',
            fontSize: '15px',
            background: 'transparent',
            boxSizing: 'border-box',
            boxShadow: 'none',
            color: '#374151',
            outline: 'none'
          }}
        />
        <button 
          type="button"
          onClick={handleSearchSubmit}
          className="search-button" 
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#666" strokeWidth="2"/>
          </svg>
        </button>
        
        {/* Smart suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="suggestions-dropdown"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-item"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#999" strokeWidth="2"/>
                  </svg>
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <button className="filter-button" onClick={openFilterSidebar}>
        <img fetchpriority="low" decoding="async" loading="lazy" src="/images/filter-icon.png" alt="Filtrar" width="20" height="20" style={{ filter: 'brightness(0) invert(1)' }} />
      </button>
    </div>
  );

  // Sticky search bar (appears at bottom) - only filter button
  const StickySearchBar = () => (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="sticky-buttons-container"
    >
      <div className="sticky-buttons-content">
        <button className="sticky-filter-button" onClick={openFilterSidebar}>
          <img fetchpriority="low" decoding="async" loading="lazy" src="/images/filter-icon.png" alt="Filtrar" width="20" height="20" style={{ filter: 'brightness(0) invert(1)' }} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Normal search bar */}
      {!isSticky && <NormalSearchBar />}
      


      {/* Sticky search bar */}
      <AnimatePresence>
        {isSticky && <StickySearchBar />}
      </AnimatePresence>

      {/* Sort Modal */}
      <AnimatePresence>
        {showSortModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sort-modal-overlay"
            onClick={closeSortModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="sort-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sort-modal-header">
                <h2>Ordenar por</h2>
                <button className="close-modal-button" onClick={closeSortModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="sort-options">
                {Object.entries(
                  sortOptions.reduce((groups, option) => {
                    const group = option.group;
                    if (!groups[group]) groups[group] = [];
                    groups[group].push(option);
                    return groups;
                  }, {})
                ).map(([groupName, options]) => (
                  <div key={groupName} className="sort-group">
                    <h3 className="sort-group-title">{groupName}</h3>
                    {options.map((option) => (
                      <button
                        key={option.id}
                        className={`sort-option ${selectedSort === option.id ? 'selected' : ''}`}
                        onClick={() => selectSort(option.id)}
                      >
                        <div className="radio-circle">
                          {selectedSort === option.id && <div className="radio-dot" />}
                        </div>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}