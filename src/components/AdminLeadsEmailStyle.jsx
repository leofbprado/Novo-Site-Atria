import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminLeadsEmailStyle = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      // Carregar leads do site
      const leadsSiteCollection = collection(db, 'leads_site');
      const leadsSiteQuery = query(leadsSiteCollection, orderBy('timestamp', 'desc'));
      const leadsSiteSnapshot = await getDocs(leadsSiteQuery);
      
      const leadsSiteData = leadsSiteSnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: 'site',
        ...doc.data()
      }));
      
      // Carregar leads de simulação
      const leadsSimulacaoCollection = collection(db, 'leads_simulacao');
      const leadsSimulacaoSnapshot = await getDocs(leadsSimulacaoCollection);
      
      const leadsSimulacaoData = leadsSimulacaoSnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: 'simulacao',
        timestamp: doc.data().data_criacao || new Date().toISOString(),
        ...doc.data()
      }));
      
      // Combinar todos os leads e ordenar por data
      const allLeads = [...leadsSiteData, ...leadsSimulacaoData].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.data_criacao);
        const dateB = new Date(b.timestamp || b.data_criacao);
        return dateB - dateA;
      });
      
      setLeads(allLeads);
      
      // Auto-selecionar o primeiro lead se houver algum
      if (allLeads.length > 0 && !selectedLead) {
        setSelectedLead(allLeads[0]);
      }
      
      console.log(`✅ Total de leads carregados: ${allLeads.length}`);
    } catch (error) {
      console.error('❌ Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '-';
    
    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      // String timestamp
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) {
      return 'Agora há pouco';
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else if (days < 7) {
      return `${days}d atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const formatFullDateTime = (timestamp) => {
    if (!timestamp) return '-';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLeadTypeColor = (tipo) => {
    switch (tipo) {
      case 'site':
        return { bg: '#dbeafe', text: '#1e40af', label: 'Site' };
      case 'simulacao':
        return { bg: '#dcfce7', text: '#166534', label: 'Simulação' };
      default:
        return { bg: '#f3f4f6', text: '#374151', label: 'Outro' };
    }
  };

  const getStatusColor = (enviado) => {
    return enviado 
      ? { bg: '#dcfce7', text: '#166534', icon: '✓' }
      : { bg: '#fee2e2', text: '#dc2626', icon: '✗' };
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 2fr', 
      gap: '24px', 
      height: '600px',
      padding: '24px' 
    }}>
      {/* Coluna Esquerda - Lista de Leads */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header da Lista */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0,
              fontFamily: 'DM Sans, sans-serif'
            }}>
              📬 Leads Recebidos
            </h3>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: '4px 0 0 0'
            }}>
              {leads.length} leads no total
            </p>
          </div>
          <button
            onClick={loadLeads}
            disabled={loading}
            style={{
              padding: '6px 12px',
              backgroundColor: loading ? '#9ca3af' : '#1A75FF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {loading ? '🔄' : '↻'} Atualizar
          </button>
        </div>

        {/* Lista de Leads */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f8fafc'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#6b7280'
            }}>
              <span style={{ marginRight: '8px' }}>🔄</span>
              Carregando...
            </div>
          ) : leads.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#6b7280'
            }}>
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>📭</span>
              <p>Nenhum lead encontrado</p>
            </div>
          ) : (
            leads.map((lead) => {
              const typeColor = getLeadTypeColor(lead.tipo);
              const statusColor = getStatusColor(lead.enviado);
              const isSelected = selectedLead?.id === lead.id;
              
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'white' : 'transparent',
                    borderLeft: isSelected ? '4px solid #1A75FF' : '4px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = '#ffffff80';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Header do Lead */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0,
                        fontFamily: 'DM Sans, sans-serif'
                      }}>
                        {lead.nome || lead.name || 'Nome não informado'}
                      </h4>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '2px 0 0 0'
                      }}>
                        {lead.celular || lead.whatsapp || lead.telefone || 'Telefone não informado'}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '4px'
                    }}>
                      <span style={{
                        fontSize: '10px',
                        color: '#6b7280'
                      }}>
                        {formatDateTime(lead.timestamp || lead.data_criacao)}
                      </span>
                      <div style={{
                        display: 'flex',
                        gap: '4px'
                      }}>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: typeColor.bg,
                          color: typeColor.text,
                          borderRadius: '10px',
                          fontWeight: '500'
                        }}>
                          {typeColor.label}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderRadius: '10px',
                          fontWeight: '500'
                        }}>
                          {statusColor.icon}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preview da mensagem */}
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {lead.mensagem || lead.message || lead.observacoes || 'Sem mensagem adicional'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Coluna Direita - Detalhes do Lead */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {selectedLead ? (
          <>
            {/* Header do Lead Selecionado */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    {selectedLead.nome || selectedLead.name || 'Nome não informado'}
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '4px 0 0 0'
                  }}>
                    Lead recebido em {formatFullDateTime(selectedLead.timestamp || selectedLead.data_criacao)}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {(() => {
                    const typeColor = getLeadTypeColor(selectedLead.tipo);
                    const statusColor = getStatusColor(selectedLead.enviado);
                    return (
                      <>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          backgroundColor: typeColor.bg,
                          color: typeColor.text,
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          {typeColor.label}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderRadius: '12px',
                          fontWeight: '500'
                        }}>
                          {statusColor.icon} {selectedLead.enviado ? 'Enviado' : 'Não enviado'}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Conteúdo do Lead */}
            <div style={{
              flex: 1,
              padding: '24px',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                {/* Informações de Contato */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 12px 0',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    📞 Contato
                  </h4>
                  <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                    <p style={{ margin: '0 0 6px 0' }}>
                      <strong>Telefone:</strong> {selectedLead.celular || selectedLead.whatsapp || selectedLead.telefone || 'Não informado'}
                    </p>
                    <p style={{ margin: '0 0 6px 0' }}>
                      <strong>E-mail:</strong> {selectedLead.email || 'Não informado'}
                    </p>
                    {selectedLead.cpf && (
                      <p style={{ margin: '0 0 6px 0' }}>
                        <strong>CPF:</strong> {selectedLead.cpf}
                      </p>
                    )}
                  </div>
                </div>

                {/* Informações do Veículo */}
                {(selectedLead.veiculo || selectedLead.marca || selectedLead.modelo) && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 12px 0',
                      fontFamily: 'DM Sans, sans-serif'
                    }}>
                      🚗 Veículo de Interesse
                    </h4>
                    <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>
                      {selectedLead.veiculo ? (
                        <p style={{ margin: '0 0 6px 0' }}>
                          <strong>Veículo:</strong> {selectedLead.veiculo}
                        </p>
                      ) : (
                        <>
                          {selectedLead.marca && (
                            <p style={{ margin: '0 0 6px 0' }}>
                              <strong>Marca:</strong> {selectedLead.marca}
                            </p>
                          )}
                          {selectedLead.modelo && (
                            <p style={{ margin: '0 0 6px 0' }}>
                              <strong>Modelo:</strong> {selectedLead.modelo}
                            </p>
                          )}
                        </>
                      )}
                      {selectedLead.preco && (
                        <p style={{ margin: '0 0 6px 0' }}>
                          <strong>Preço:</strong> {selectedLead.preco}
                        </p>
                      )}
                      {selectedLead.parcela_desejada && (
                        <p style={{ margin: '0 0 6px 0' }}>
                          <strong>Parcela desejada:</strong> {selectedLead.parcela_desejada}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mensagem */}
              {(selectedLead.mensagem || selectedLead.message || selectedLead.observacoes) && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#fffbeb',
                  borderRadius: '8px',
                  border: '1px solid #fbbf24'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 12px 0',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    💬 Mensagem
                  </h4>
                  <div style={{
                    fontSize: '13px',
                    color: '#374151',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedLead.mensagem || selectedLead.message || selectedLead.observacoes}
                  </div>
                </div>
              )}

              {/* Dados Técnicos da Simulação */}
              {selectedLead.tipo === 'simulacao' && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 12px 0',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>
                    📊 Dados da Simulação
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#374151'
                  }}>
                    {selectedLead.valor_veiculo && (
                      <p style={{ margin: 0 }}>
                        <strong>Valor do veículo:</strong> {selectedLead.valor_veiculo}
                      </p>
                    )}
                    {selectedLead.entrada && (
                      <p style={{ margin: 0 }}>
                        <strong>Entrada:</strong> {selectedLead.entrada}
                      </p>
                    )}
                    {selectedLead.parcelas && (
                      <p style={{ margin: 0 }}>
                        <strong>Parcelas:</strong> {selectedLead.parcelas}
                      </p>
                    )}
                    {selectedLead.renda && (
                      <p style={{ margin: 0 }}>
                        <strong>Renda:</strong> {selectedLead.renda}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6b7280'
          }}>
            <span style={{ fontSize: '48px', marginBottom: '16px' }}>📧</span>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              margin: '0 0 8px 0',
              color: '#374151'
            }}>
              Selecione um lead
            </h3>
            <p style={{ margin: 0, textAlign: 'center' }}>
              Escolha um lead da lista ao lado para ver os detalhes completos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeadsEmailStyle;