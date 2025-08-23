import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';

export default function EstoqueAdmin() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminFilters, setAdminFilters] = useState({
    search: '',
    status: 'all', // all, active, inactive
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  
  // Estados para o modal de edição
  const [editModal, setEditModal] = useState({
    isOpen: false,
    vehicle: null,
    loading: false,
    error: '',
    success: ''
  });
  const [editForm, setEditForm] = useState({
    promocao: false,
    categoria: ''
  });

  useEffect(() => {
    loadVehiclesAdmin();
  }, []);

  const loadVehiclesAdmin = async () => {
    try {
      setLoading(true);
      setError("");

      // Query administrativa - pega TODOS os veículos
      const vehiclesRef = collection(db, 'veiculos');
      const q = query(vehiclesRef, orderBy('created_at', 'desc'));
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
      
      // Calcular estatísticas
      const activeCount = vehiclesList.filter(v => v.ativo === true).length;
      setStats({
        total: vehiclesList.length,
        active: activeCount,
        inactive: vehiclesList.length - activeCount
      });

      console.log(`[ADMIN] ${vehiclesList.length} veículos carregados para administração`);
    } catch (error) {
      console.error("Erro ao carregar veículos (admin):", error);
      setError("Erro ao carregar veículos para administração");
    } finally {
      setLoading(false);
    }
  };

  // Filtros administrativos avançados
  useEffect(() => {
    const start = performance.now();
    
    let filtered = vehicles;

    // Filtro por status
    if (adminFilters.status === 'active') {
      filtered = filtered.filter(v => v.ativo === true);
    } else if (adminFilters.status === 'inactive') {
      filtered = filtered.filter(v => v.ativo === false);
    }

    // Filtro por busca
    if (adminFilters.search?.trim()) {
      const searchTerm = adminFilters.search.toLowerCase().trim();
      filtered = filtered.filter((vehicle) => {
        const searchText = `
          ${vehicle.marca || ''}
          ${vehicle.modelo || ''}
          ${vehicle.versao || ''}
          ${vehicle.placa || ''}
          ${vehicle.chassi || ''}
          ${vehicle.id || ''}
        `.toLowerCase();
        return searchText.includes(searchTerm);
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      const aVal = a[adminFilters.sortBy] || '';
      const bVal = b[adminFilters.sortBy] || '';
      
      if (adminFilters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredVehicles(filtered);

    const end = performance.now();
    console.log(`[ADMIN FILTER] "${adminFilters.search}" → ${filtered.length} veículos. Tempo: ${Math.round(end - start)}ms`);
  }, [vehicles, adminFilters]);

  const formatPrice = (price) => {
    if (!price || price === 0) return "Não informado";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  };

  const handleStatusFilter = (status) => {
    setAdminFilters(prev => ({ ...prev, status }));
  };

  const handleSort = (field) => {
    setAdminFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Função para abrir modal de edição ao clicar na placa
  const openEditModal = (vehicle) => {
    setEditModal({
      isOpen: true,
      vehicle: vehicle,
      loading: false,
      error: '',
      success: ''
    });
    
    // Preencher formulário com dados existentes (se houver)
    setEditForm({
      promocao: vehicle.promocao || false,
      categoria: vehicle.categoria || vehicle.tipo_veiculo || ''
    });
    
    console.log('🔧 Modal de edição aberto para:', vehicle.placa, vehicle.marca, vehicle.modelo);
  };

  // Função para fechar modal de edição
  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      vehicle: null,
      loading: false,
      error: '',
      success: ''
    });
    setEditForm({
      promocao: false,
      categoria: ''
    });
  };

  // Função para salvar alterações no Firebase
  const saveVehicleChanges = async () => {
    if (!editModal.vehicle) return;

    setEditModal(prev => ({ ...prev, loading: true, error: '', success: '' }));

    try {
      const vehicleRef = doc(db, 'veiculos', editModal.vehicle.id);
      
      await updateDoc(vehicleRef, {
        promocao: editForm.promocao,
        categoria: editForm.categoria,
        updated_at: new Date()
      });

      console.log('✅ Veículo atualizado:', {
        placa: editModal.vehicle.placa,
        promocao: editForm.promocao,
        categoria: editForm.categoria
      });

      setEditModal(prev => ({ 
        ...prev, 
        loading: false, 
        success: 'Veículo atualizado com sucesso!' 
      }));

      // Recarregar lista de veículos para refletir alterações
      setTimeout(() => {
        loadVehiclesAdmin();
        closeEditModal();
      }, 1500);

    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      setEditModal(prev => ({ 
        ...prev, 
        loading: false, 
        error: `Erro ao salvar: ${error.message}` 
      }));
    }
  };

  return (
    <>
      <Helmet>
        <title>Administração de Estoque - Átria Veículos</title>
        <meta name="description" content="Painel administrativo para gerenciamento do estoque de veículos." />
      </Helmet>

      {/* HEADER ADMINISTRATIVO */}
      <div style={{ 
        backgroundColor: '#1e293b', 
        color: 'white', 
        padding: '20px 0',
        borderBottom: '3px solid #f59e0b'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
              🔧 Administração de Estoque
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
              Painel gerencial para controle de veículos
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => window.location.href = '/admin'}
              style={{
                backgroundColor: '#64748b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Admin
            </button>
            <button 
              onClick={() => window.location.href = '/estoque'}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Ver Site Público
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL DE ESTATÍSTICAS */}
      <div style={{ 
        backgroundColor: '#f1f5f9', 
        padding: '20px 0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 20px'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                Total de Veículos
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#059669' }}>
                {stats.active}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                Ativos (Públicos)
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#dc2626' }}>
                {stats.inactive}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                Inativos (Ocultos)
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#7c3aed' }}>
                {filteredVehicles.length}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                Filtrados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLES ADMINISTRATIVOS */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px 0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '0 20px'
        }}>
          {/* Busca Administrativa */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Buscar por marca, modelo, placa, chassi, ID..."
              value={adminFilters.search}
              onChange={(e) => setAdminFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                width: '100%',
                maxWidth: '600px',
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
          </div>

          {/* Filtros de Status */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Status:
            </span>
            {[
              { key: 'all', label: 'Todos', color: '#6b7280' },
              { key: 'active', label: 'Ativos', color: '#059669' },
              { key: 'inactive', label: 'Inativos', color: '#dc2626' }
            ].map(status => (
              <button
                key={status.key}
                onClick={() => handleStatusFilter(status.key)}
                style={{
                  padding: '6px 12px',
                  border: `2px solid ${adminFilters.status === status.key ? status.color : '#e5e7eb'}`,
                  backgroundColor: adminFilters.status === status.key ? status.color : 'white',
                  color: adminFilters.status === status.key ? 'white' : status.color,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {status.label}
              </button>
            ))}
          </div>

          {/* Ordenação */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Ordenar por:
            </span>
            {[
              { key: 'created_at', label: 'Data Criação' },
              { key: 'marca', label: 'Marca' },
              { key: 'modelo', label: 'Modelo' },
              { key: 'preco', label: 'Preço' },
              { key: 'ano_modelo', label: 'Ano' }
            ].map(sort => (
              <button
                key={sort.key}
                onClick={() => handleSort(sort.key)}
                style={{
                  padding: '6px 12px',
                  border: `2px solid ${adminFilters.sortBy === sort.key ? '#3b82f6' : '#e5e7eb'}`,
                  backgroundColor: adminFilters.sortBy === sort.key ? '#3b82f6' : 'white',
                  color: adminFilters.sortBy === sort.key ? 'white' : '#374151',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {sort.label} {adminFilters.sortBy === sort.key && (adminFilters.sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LISTA ADMINISTRATIVA DE VEÍCULOS */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        minHeight: '500px',
        padding: '20px 0'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
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
                borderTop: '4px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '20px', color: '#6b7280' }}>Carregando dados administrativos...</p>
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
            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {/* Cabeçalho da tabela */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 100px 150px 120px 100px 120px 80px 100px 80px',
                gap: '12px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151'
              }}>
                <div>STATUS</div>
                <div>IMAGEM</div>
                <div>VEÍCULO</div>
                <div>PREÇO</div>
                <div>ANO</div>
                <div>PLACA</div>
                <div>KM</div>
                <div>CRIADO</div>
                <div>AÇÕES</div>
              </div>

              {/* Linhas dos veículos */}
              {filteredVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 100px 150px 120px 100px 120px 80px 100px 80px',
                    gap: '12px',
                    padding: '16px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '14px',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textAlign: 'center',
                    backgroundColor: vehicle.ativo ? '#d1fae5' : '#fee2e2',
                    color: vehicle.ativo ? '#065f46' : '#991b1b'
                  }}>
                    {vehicle.ativo ? 'ATIVO' : 'INATIVO'}
                  </div>

                  <div style={{ width: '80px', height: '60px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                    {vehicle.imagens && vehicle.imagens[0] ? (
                      <img fetchpriority="low" decoding="async" loading="lazy" src={vehicle.imagens[0]} alt="Veículo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: '10px'
                      }}>
                        Sem foto
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>
                      {vehicle.marca} {vehicle.modelo}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {vehicle.versao || 'Versão não informada'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                      ID: {vehicle.id.substring(0, 8)}...
                    </div>
                  </div>

                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {formatPrice(vehicle.preco)}
                  </div>

                  <div style={{ color: '#374151' }}>
                    {vehicle.ano_modelo || 'N/A'}
                  </div>

                  <div 
                    style={{ 
                      color: '#1A75FF', 
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: '600'
                    }}
                    onClick={() => openEditModal(vehicle)}
                    title="Clique para editar campos customizados"
                  >
                    {vehicle.placa || 'N/A'}
                  </div>

                  <div style={{ color: '#374151' }}>
                    {vehicle.km ? `${vehicle.km.toLocaleString()} km` : 'N/A'}
                  </div>

                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formatDate(vehicle.created_at)}
                  </div>

                  <div>
                    <button
                      onClick={() => window.location.href = `/veiculo-individual/${vehicle.id}`}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredVehicles.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#6b7280',
              backgroundColor: 'white',
              borderRadius: '8px'
            }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                Nenhum veículo encontrado
              </h3>
              <p>Tente ajustar os filtros ou termo de busca.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição por Placa */}
      {editModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            {/* Cabeçalho do Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f1f5f9'
            }}>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a2332',
                  margin: 0,
                  fontFamily: 'DM Sans, sans-serif'
                }}>
                  Editar Campos Customizados
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '4px 0 0 0'
                }}>
                  Placa: <strong>{editModal.vehicle?.placa}</strong>
                </p>
              </div>
              <button
                onClick={closeEditModal}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            {/* Informações do Veículo */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Dados do Veículo
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                fontSize: '14px'
              }}>
                <div>
                  <strong>Marca:</strong> {editModal.vehicle?.marca || 'N/A'}
                </div>
                <div>
                  <strong>Modelo:</strong> {editModal.vehicle?.modelo || 'N/A'}
                </div>
                <div>
                  <strong>Ano:</strong> {editModal.vehicle?.ano_modelo || 'N/A'}
                </div>
                <div>
                  <strong>Preço:</strong> {formatPrice(editModal.vehicle?.preco)}
                </div>
              </div>
            </div>

            {/* Campos Customizados */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a2332',
                marginBottom: '16px'
              }}>
                Campos Customizados
              </h4>

              {/* Campo Promoção */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#374151'
                }}>
                  <input
                    type="checkbox"
                    checked={editForm.promocao}
                    onChange={(e) => setEditForm(prev => ({ ...prev, promocao: e.target.checked }))}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#1A75FF'
                    }}
                  />
                  <span style={{ fontWeight: '500' }}>
                    Este carro está em promoção
                  </span>
                </label>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginTop: '4px',
                  marginLeft: '30px'
                }}>
                  Carros em promoção receberão badge especial na homepage
                </p>
              </div>

              {/* Campo Categoria */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Categoria do veículo
                </label>
                <select
                  value={editForm.categoria}
                  onChange={(e) => setEditForm(prev => ({ ...prev, categoria: e.target.value }))}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    fontSize: '16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1A75FF'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                >
                  <option value="">Selecione a categoria</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatch">Hatch</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Van">Van</option>
                  <option value="Outro">Outro</option>
                </select>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>
                  Usado para categorização e filtros no site
                </p>
              </div>
            </div>

            {/* Mensagens de Status */}
            {editModal.error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <p style={{
                  color: '#dc2626',
                  fontSize: '14px',
                  margin: 0
                }}>
                  {editModal.error}
                </p>
              </div>
            )}

            {editModal.success && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <p style={{
                  color: '#16a34a',
                  fontSize: '14px',
                  margin: 0
                }}>
                  {editModal.success}
                </p>
              </div>
            )}

            {/* Botões de Ação */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '16px',
              borderTop: '2px solid #f1f5f9'
            }}>
              <button
                onClick={closeEditModal}
                disabled={editModal.loading}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  borderRadius: '8px',
                  cursor: editModal.loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={saveVehicleChanges}
                disabled={editModal.loading}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  backgroundColor: editModal.loading ? '#d1d5db' : '#1A75FF',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: editModal.loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  minWidth: '120px'
                }}
              >
                {editModal.loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}