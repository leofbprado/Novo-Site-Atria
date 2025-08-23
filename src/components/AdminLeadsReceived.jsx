import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminLeadsReceived = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

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
      console.log(`✅ Total de leads carregados: ${allLeads.length} (${leadsSiteData.length} do site + ${leadsSimulacaoData.length} de simulação)`);
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
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openMessageModal = (message, nome) => {
    setSelectedMessage({ message, nome });
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const renderStatusIcon = (enviado) => {
    if (enviado) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
          <span style={{ marginRight: '4px', fontSize: '16px' }}>✓</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Enviado</span>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', alignItems: 'center', color: '#ef4444' }}>
          <span style={{ marginRight: '4px', fontSize: '16px' }}>✗</span>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Não enviado</span>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Leads Recebidos</h1>
            <p style={{ color: '#6b7280' }}>Gerencie todos os leads capturados pelo site</p>
          </div>
          <button
            onClick={loadLeads}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <span style={{ marginRight: '8px', animation: loading ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            Recarregar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px', color: '#2563eb' }}>👥</span>
            </div>
            <div style={{ marginLeft: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Total de Leads</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{leads.length}</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px', color: '#16a34a' }}>✓</span>
            </div>
            <div style={{ marginLeft: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Enviados</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {leads.filter(lead => lead.enviado).length}
              </p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px', color: '#dc2626' }}>✗</span>
            </div>
            <div style={{ marginLeft: '12px' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Não Enviados</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {leads.filter(lead => !lead.enviado).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
            <span style={{ marginRight: '12px', fontSize: '24px', animation: 'spin 1s linear infinite' }}>🔄</span>
            <span style={{ color: '#6b7280' }}>Carregando leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <span style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px', display: 'block' }}>💬</span>
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>Nenhum lead encontrado</h3>
            <p style={{ color: '#6b7280' }}>Os leads capturados pelo site aparecerão aqui.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      📅 Data
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      🏷️ Tipo
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      👤 Nome
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      📞 Telefone
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      ✉️ E-mail/CPF
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      🚗 Veículo
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      💰 Detalhes
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      Status
                    </th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>
                      💬 Ações
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {leads.map((lead) => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#111827' }}>
                        {formatDateTime(lead.timestamp || lead.data_criacao)}
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          backgroundColor: lead.tipo === 'simulacao' ? '#fef3c7' : '#dbeafe',
                          color: lead.tipo === 'simulacao' ? '#92400e' : '#1d4ed8'
                        }}>
                          {lead.tipo === 'simulacao' ? '💳 Simulação' : '📬 Site'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{lead.nome}</div>
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#111827' }}>
                        {lead.telefone}
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#111827' }}>
                        {lead.tipo === 'simulacao' ? `CPF: ${lead.cpf}` : (lead.email || '-')}
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#111827' }}>
                        {lead.tipo === 'simulacao' && lead.veiculo ? 
                          lead.veiculo.nome : 
                          (lead.modelo || '-')}
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#111827' }}>
                        {lead.tipo === 'simulacao' ? 
                          <div>
                            <div style={{ fontSize: '12px' }}>💵 Entrada: R$ {lead.entrada?.toLocaleString('pt-BR') || '0'}</div>
                            <div style={{ fontSize: '12px' }}>📅 {lead.parcelas || '0'}x</div>
                            <div style={{ fontSize: '12px' }}>🚗 R$ {lead.valor_veiculo?.toLocaleString('pt-BR') || '0'}</div>
                          </div> : 
                          (lead.canal || '-')}
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        {lead.tipo === 'simulacao' ? 
                          <span style={{ color: '#10b981', fontWeight: 600 }}>✓ {lead.status_interacao || 'simulado'}</span> :
                          renderStatusIcon(lead.enviado)}
                      </td>
                      <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                        {lead.tipo === 'simulacao' && lead.veiculo?.url ? (
                          <a 
                            href={lead.veiculo.url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 12px',
                              fontSize: '14px',
                              backgroundColor: '#dcfce7',
                              color: '#16a34a',
                              border: 'none',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              marginRight: '8px'
                            }}
                          >
                            🚗 Ver Veículo
                          </a>
                        ) : (
                          <button
                            onClick={() => openMessageModal(lead.mensagem, lead.nome)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px 12px',
                              fontSize: '14px',
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            💬 Ver Mensagem
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div style={{ display: 'block' }}>
              {leads.map((lead) => (
                <div key={lead.id} style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#111827', margin: 0 }}>{lead.nome}</h3>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{formatDateTime(lead.timestamp || lead.data_criacao)}</p>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        marginTop: '4px',
                        backgroundColor: lead.tipo === 'simulacao' ? '#fef3c7' : '#dbeafe',
                        color: lead.tipo === 'simulacao' ? '#92400e' : '#1d4ed8'
                      }}>
                        {lead.tipo === 'simulacao' ? '💳 Simulação' : '📬 Site'}
                      </span>
                    </div>
                    {lead.tipo === 'simulacao' ? 
                      <span style={{ color: '#10b981', fontWeight: 600, fontSize: '12px' }}>✓ {lead.status_interacao || 'simulado'}</span> :
                      renderStatusIcon(lead.enviado)}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                      <span style={{ marginRight: '8px' }}>📞</span>
                      {lead.telefone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                      <span style={{ marginRight: '8px' }}>✉️</span>
                      {lead.tipo === 'simulacao' ? `CPF: ${lead.cpf}` : (lead.email || '-')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                      <span style={{ marginRight: '8px' }}>🚗</span>
                      {lead.tipo === 'simulacao' && lead.veiculo ? 
                        lead.veiculo.nome : 
                        (lead.modelo || '-')}
                    </div>
                    {lead.tipo === 'simulacao' ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                          <span style={{ marginRight: '8px' }}>💵</span>
                          Entrada: R$ {lead.entrada?.toLocaleString('pt-BR') || '0'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                          <span style={{ marginRight: '8px' }}>📅</span>
                          {lead.parcelas || '0'} parcelas
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                          <span style={{ marginRight: '8px' }}>💰</span>
                          Valor: R$ {lead.valor_veiculo?.toLocaleString('pt-BR') || '0'}
                        </div>
                      </>
                    ) : (
                      lead.canal && (
                        <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                          <span style={{ marginRight: '8px' }}>🏷️</span>
                          {lead.canal}
                        </div>
                      )
                    )}
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    {lead.tipo === 'simulacao' && lead.veiculo?.url ? (
                      <a 
                        href={lead.veiculo.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 12px',
                          fontSize: '14px',
                          backgroundColor: '#dcfce7',
                          color: '#16a34a',
                          border: 'none',
                          borderRadius: '6px',
                          textDecoration: 'none'
                        }}
                      >
                        🚗 Ver Veículo
                      </a>
                    ) : (
                      <button
                        onClick={() => openMessageModal(lead.mensagem, lead.nome)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px 12px',
                          fontSize: '14px',
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        💬 Ver Mensagem
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '512px', width: '100%', maxHeight: '384px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#111827', margin: 0 }}>
                  Mensagem de {selectedMessage.nome}
                </h3>
                <button
                  onClick={closeMessageModal}
                  style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                >
                  ✗
                </button>
              </div>
            </div>
            <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '256px' }}>
              <p style={{ color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>
                {selectedMessage.message}
              </p>
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={closeMessageModal}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadsReceived;