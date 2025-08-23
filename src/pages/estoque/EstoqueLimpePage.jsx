import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function EstoqueLimpePage() {
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

  // Apply filters instantly
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
    console.log(`[Filtro LIMPO] "${filters.search}" → ${filtered.length} veículos. Tempo: ${Math.round(end - start)}ms`);
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

  return (
    <>
      <Helmet>
        <title>Estoque de Veículos - Átria Veículos</title>
        <meta name="description" content="Confira nosso estoque de veículos seminovos e usados com as melhores condições de financiamento." />
      </Helmet>

      {/* HEADER LIMPO */}
      <div style={{ 
        backgroundColor: '#0c1123', 
        color: 'white', 
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/logos/logo-white.png" alt="Átria Veículos" style={{ height: '40px', marginRight: '15px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
              Estoque de Veículos
            </h1>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Voltar ao Início
          </button>
        </div>
      </div>

      {/* BUSCA OTIMIZADA */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px 0',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center',
            maxWidth: '600px'
          }}>
            <input
              type="text"
              placeholder="Pesquisar marca, modelo..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                flex: 1,
                height: '48px',
                padding: '0 16px',
                fontSize: '16px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={() => setFilters({ search: '' })}
              style={{
                height: '48px',
                padding: '0 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Limpar
            </button>
          </div>
          <div style={{ 
            marginTop: '15px', 
            color: '#6b7280',
            fontSize: '14px'
          }}>
            {loading ? (
              "Carregando veículos..."
            ) : error ? (
              error
            ) : (
              `${filteredVehicles.length} de ${vehicles.length} veículo${vehicles.length !== 1 ? 's' : ''} encontrado${filteredVehicles.length !== 1 ? 's' : ''}`
            )}
          </div>
        </div>
      </div>

      {/* LISTA DE VEÍCULOS OTIMIZADA */}
      <div style={{ 
        backgroundColor: '#f9fafb', 
        minHeight: '500px',
        padding: '40px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px'
        }}>
          {loading && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '400px',
              flexDirection: 'column'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '20px', color: '#6b7280' }}>Carregando veículos...</p>
            </div>
          )}

          {error && (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fef2f2', 
              color: '#dc2626',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '24px'
            }}>
              {filteredVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {/* Imagem do veículo */}
                  <div style={{ 
                    height: '200px', 
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    {vehicle.imagens && vehicle.imagens[0] ? (
                      <img fetchpriority="low" decoding="async" loading="lazy" src={vehicle.imagens[0]} alt={`${vehicle.marca} ${vehicle.modelo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      'Imagem não disponível'
                    )}
                  </div>

                  {/* Informações do veículo */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      margin: '0 0 8px 0',
                      color: '#1f2937'
                    }}>
                      {vehicle.marca} {vehicle.modelo}
                    </h3>
                    
                    {vehicle.versao && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#6b7280', 
                        margin: '0 0 12px 0'
                      }}>
                        {vehicle.versao}
                      </p>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      marginBottom: '16px',
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      <span>{vehicle.ano_modelo}</span>
                      <span>{formatKm(vehicle.km)}</span>
                      <span>{vehicle.combustivel}</span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#1f2937'
                        }}>
                          {formatPrice(vehicle.preco)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => window.location.href = `/veiculo-individual/${vehicle.id}`}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredVehicles.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                Nenhum veículo encontrado
              </h3>
              <p>Tente buscar por outra marca ou modelo.</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER MÍNIMO */}
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
          <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="/images/logos/logo-white.png" alt="Átria Veículos" style={{ height: '40px', marginBottom: '20px' }} />
          <p style={{ margin: 0, color: '#9ca3af' }}>
            © 2025 Átria Veículos. Todos os direitos reservados.
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#9ca3af' }}>
            WhatsApp: (19) 99652-5211 | financiamento@atriaveiculos.com.br
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}