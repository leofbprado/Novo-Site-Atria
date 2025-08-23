import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters deve ser usado dentro de FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  // Estado para armazenar veículos carregados
  const [vehicles, setVehicles] = useState([]);

  // Estado unificado - elimina duplicação entre filters e sidebarFilters
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    model: '',
    priceRange: '',
    minPrice: 0,
    maxPrice: 999999,
    category: [],
    years: [], // manter para compatibilidade
    anos: [], // novo campo para anos
    transmission: [],
    fuel: [],
    minMileage: null,
    maxMileage: null,
    kmMin: null,  // novo campo para km mínimo
    kmMax: null,  // novo campo para km máximo
    anoMin: null, // novo campo para ano mínimo
    anoMax: null, // novo campo para ano máximo
    offers: [],
    // Arrays unificados para o sidebar
    brands: [],
    models: [],
    carTypes: []
  });

  // Estado com debounce para aplicação efetiva dos filtros
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Carregar veículos do Firestore
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        // ⚡ Firebase lazy loading - só carrega quando necessário
        const { db } = await import('@/firebase/config');
        const { collection, getDocs } = await import('firebase/firestore');
        
        const vehiclesCollection = collection(db, 'veiculos');
        const vehiclesSnapshot = await getDocs(vehiclesCollection);
        
        const vehiclesData = vehiclesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setVehicles(vehiclesData);
        console.log('🚗 Veículos disponíveis no contexto:', vehiclesData.length);
      } catch (err) {
        console.error('❌ Erro ao carregar veículos no contexto:', err);
      }
    };

    loadVehicles();
  }, []);

  // Debounce único de 150ms para aplicar filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filters);
      console.log('🔄 Filtros aplicados com debounce:', filters);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Função otimizada para atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    console.log('✅ Filtros atualizados:', newFilters);
  }, []);

  // Função específica para atualizar preços com conversão automática
  const updatePriceRange = useCallback((minPrice, maxPrice) => {
    const priceRange = `${minPrice}-${maxPrice}`;
    updateFilters({
      minPrice,
      maxPrice,
      priceRange
    });
  }, [updateFilters]);

  // Função para adicionar/remover itens de arrays
  const toggleArrayFilter = useCallback((filterKey, value) => {
    setFilters(prev => {
      const currentArray = prev[filterKey] || [];
      const isSelected = currentArray.includes(value);
      
      const newArray = isSelected 
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];

      // Atualizar campos derivados
      const updates = { [filterKey]: newArray };
      
      if (filterKey === 'brands') {
        updates.brand = newArray.length > 0 ? newArray[0] : '';
      } else if (filterKey === 'models') {
        updates.model = newArray.length > 0 ? newArray[0] : '';
      } else if (filterKey === 'carTypes') {
        updates.category = newArray;
      }

      return { ...prev, ...updates };
    });
  }, []);

  // Limpar todos os filtros
  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      search: '',
      brand: '',
      model: '',
      priceRange: '',
      minPrice: 0,
      maxPrice: 999999,
      category: [],
      years: [],
      anos: [],
      transmission: [],
      fuel: [],
      minMileage: null,
      maxMileage: null,
      kmMin: null,
      kmMax: null,
      anoMin: null,
      anoMax: null,
      offers: [],
      brands: [],
      models: [],
      carTypes: []
    };

    setFilters(clearedFilters);
    console.log('🧹 Todos os filtros limpos');
  }, []);

  // Contar filtros ativos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.brand) count++;
    if (filters.model) count++;
    if (filters.priceRange) count++;
    if (filters.category.length > 0) count++;
    if (filters.years.length > 0) count++;
    if (filters.anos.length > 0) count++;
    if (filters.transmission.length > 0) count++;
    if (filters.fuel.length > 0) count++;
    if (filters.minMileage || filters.maxMileage) count++;
    if (filters.kmMin || filters.kmMax) count++;
    if (filters.offers.length > 0) count++;
    return count;
  };

  // Função para normalizar texto (remover acentos e converter para minúscula)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Parser inteligente de consulta de busca
  const parseQuery = useCallback((term) => {
    if (!term || !term.trim()) return {};

    const normalized = normalizeText(term);
    const tokens = normalized.split(/\s+/);
    
    // Mapeamento de marcas conhecidas
    const brandMap = {
      'audi': 'Audi', 'bmw': 'BMW', 'caoa': 'CAOA Chery', 'chery': 'CAOA Chery',
      'chevrolet': 'Chevrolet', 'citroen': 'Citroën', 'fiat': 'Fiat', 'ford': 'Ford',
      'honda': 'Honda', 'hyundai': 'Hyundai', 'jac': 'JAC', 'jeep': 'Jeep',
      'kia': 'KIA', 'lifan': 'Lifan', 'mercedes': 'Mercedes', 'nissan': 'Nissan',
      'peugeot': 'Peugeot', 'renault': 'Renault', 'toyota': 'Toyota', 
      'volkswagen': 'Volkswagen', 'vw': 'Volkswagen'
    };

    // Mapeamento de categorias/tipos de veículo
    const categoryMap = {
      'suv': 'SUV', 'utilitario': 'SUV', 'utilitario esportivo': 'SUV',
      'seda': 'Sedã', 'sedan': 'Sedã', 'sedã': 'Sedã',
      'hatch': 'Hatch', 'hatchback': 'Hatch',
      'picape': 'Pick-up', 'pickup': 'Pick-up', 'caminhonete': 'Pick-up',
      'minivan': 'Van', 'van': 'Van', 'mpv': 'Van',
      'coupe': 'Coupé', 'cupe': 'Coupé', 'cupê': 'Coupé',
      'conversivel': 'Conversível', 'cabriolet': 'Conversível',
      'perua': 'Perua', 'sw': 'Perua', 'wagon': 'Perua'
    };

    const result = {};
    let detectedBrand = null;
    let detectedModel = null;
    let detectedCategory = null;

    // Procurar marca
    for (const token of tokens) {
      if (brandMap[token]) {
        detectedBrand = brandMap[token];
        break;
      }
    }

    // Procurar categoria
    const fullText = normalized;
    for (const [key, value] of Object.entries(categoryMap)) {
      if (fullText.includes(key)) {
        detectedCategory = value;
        break;
      }
    }

    // Procurar modelo (baseado nos veículos carregados)
    if (vehicles.length > 0) {
      const availableModels = [...new Set(vehicles.map(v => v.modelo).filter(Boolean))];
      for (const token of tokens) {
        const matchingModel = availableModels.find(model => 
          normalizeText(model).includes(token) || token.includes(normalizeText(model))
        );
        if (matchingModel) {
          detectedModel = matchingModel;
          break;
        }
      }
    }

    // Aplicar filtros detectados
    if (detectedBrand) {
      result.brand = detectedBrand;
      result.brands = [detectedBrand];
    }
    if (detectedModel) {
      result.model = detectedModel;
      result.models = [detectedModel];
    }
    if (detectedCategory) {
      result.category = [detectedCategory];
      result.carTypes = [detectedCategory];
    }

    return result;
  }, [vehicles]);

  // Função para aplicar busca inteligente
  const applySearch = useCallback((term) => {
    if (!term || !term.trim()) return;

    const parsed = parseQuery(term);
    const searchFilters = {
      search: term.trim(),
      ...parsed
    };

    updateFilters(searchFilters);
    console.log('🔍 Busca inteligente aplicada:', term, 'Filtros detectados:', parsed);
  }, [parseQuery, updateFilters]);

  // Otimização com useMemo para prevenir React Error #130
  const value = useMemo(() => ({
    filters,
    debouncedFilters, // Filtros com debounce para aplicação efetiva
    vehicles, // Veículos disponíveis
    updateFilters,
    updatePriceRange,
    toggleArrayFilter,
    clearAllFilters,
    getActiveFiltersCount,
    applySearch, // Busca inteligente unificada
    parseQuery  // Parser de consulta
  }), [
    filters,
    debouncedFilters,
    vehicles,
    updateFilters,
    updatePriceRange,
    toggleArrayFilter,
    clearAllFilters,
    getActiveFiltersCount,
    applySearch,
    parseQuery
  ]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

// Exportar o contexto também
export { FilterContext };