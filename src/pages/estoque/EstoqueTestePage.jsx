import React, { useState, useEffect } from "react";
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function EstoqueTestePage() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const vehiclesRef = collection(db, 'veiculos');
      const q = query(vehiclesRef, where('ativo', '==', true));
      const querySnapshot = await getDocs(q);

      const vehiclesList = [];
      querySnapshot.forEach((doc) => {
        vehiclesList.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setVehicles(vehiclesList);
      setFilteredVehicles(vehiclesList);
    } catch (error) {
      console.error("Erro ao carregar veículos:", error);
      setError("Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters instantly with performance monitoring
  useEffect(() => {
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
      `[Filtro INSTANTÂNEO] "${filters.search}" → ${filtered.length} veículos. Tempo: ${Math.round(end - start)}ms`
    );
  }, [vehicles, filters.search]);

  const formatPrice = (price) => {
    if (!price || price === 0) return "Consulte";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* CABEÇALHO LIMPO */}
      <h1 style={{ 
        color: '#1f2937', 
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: '700'
      }}>
        TESTE PERFORMANCE - PÁGINA OTIMIZADA
      </h1>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '12px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }}>
        <strong>Status:</strong> {loading ? "Carregando..." : error ? error : `${filteredVehicles.length} de ${vehicles.length} veículos encontrados`}
      </div>

      {/* INPUT OTIMIZADO */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: '#374151'
        }}>
          Campo de Busca (teste de lag):
        </label>
        <input
          type="text"
          placeholder="Digite marca, modelo..."
          value={filters.search}
          onChange={(e) => {
            console.log('Input change:', e.target.value);
            setFilters(prev => ({ ...prev, search: e.target.value }));
          }}
          style={{
            width: '100%',
            height: '40px',
            padding: '0 12px',
            fontSize: '16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            outline: 'none',
            backgroundColor: '#ffffff',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* LISTA ULTRA OTIMIZADA */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
          Carregando...
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fef2f2', 
          color: '#dc2626',
          borderRadius: '6px',
          border: '1px solid #fecaca'
        }}>
          Erro: {error}
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            Lista de Veículos ({filteredVehicles.length})
          </h3>
          
          {filteredVehicles.slice(0, 20).map((vehicle) => (
            <div 
              key={vehicle.id} 
              style={{ 
                padding: '16px', 
                marginBottom: '12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ 
                fontWeight: '600', 
                fontSize: '16px',
                color: '#1f2937',
                marginBottom: '4px'
              }}>
                {vehicle.marca} {vehicle.modelo} {vehicle.versao}
              </div>
              <div style={{ 
                color: '#6b7280', 
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                Ano: {vehicle.ano_modelo} | Combustível: {vehicle.combustivel} | Preço: {formatPrice(vehicle.preco)}
              </div>
            </div>
          ))}
          
          {filteredVehicles.length > 20 && (
            <div style={{ 
              padding: '16px', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              ... e mais {filteredVehicles.length - 20} veículos
            </div>
          )}
        </div>
      )}
    </div>
  );
}