import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFilters } from '@/contexts/FilterContext';

export default function SmartSearchInput() {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { applySearch } = useFilters();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (value.length > 0) {
      const filtered = allSuggestions.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchText(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleSearch = (text = searchText) => {
    if (text.trim()) {
      applySearch(text.trim());
      // Se não estiver na página de estoque, navegar para lá
      if (location.pathname !== '/estoque') {
        navigate('/estoque');
      }
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '50px',
          overflow: 'hidden',
          width: '100%',
          padding: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <input
          type="search"
          placeholder="Pesquisar marca, modelo, categoria, tags..."
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          enterKeyHint="search"
          style={{
            flex: '1',
            padding: '12px 20px',
            fontSize: '16px',
            color: '#374151',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button 
          onClick={handleSearch}
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
            color: '#ffffff',
            fontWeight: '600',
            padding: '12px 24px',
            borderRadius: '46px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Buscar
        </button>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          marginTop: '8px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '12px 20px',
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
        </div>
      )}
    </div>
  );
}