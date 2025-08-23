import React from 'react';
import { useParams } from 'react-router-dom';

const AdminDetailPage = () => {
  const { section } = useParams();
  
  const getSectionTitle = (section) => {
    switch (section) {
      case 'importar':
        return 'Importação de Dados';
      case 'blog':
        return 'Gerenciamento de Blog';
      case 'destaques':
        return 'Gerenciamento de Destaques';
      case 'home':
        return 'Configurações da Home';
      default:
        return 'Área Administrativa';
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'DM Sans, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '450px'
      }}>
        <div style={{
          fontSize: '48px',
          color: '#ffc107',
          marginBottom: '16px'
        }}>
          ⚙️
        </div>
        <h2 style={{ 
          color: '#333',
          marginBottom: '8px',
          fontSize: '24px'
        }}>
          {getSectionTitle(section)}
        </h2>
        <p style={{ 
          color: '#666',
          fontSize: '16px',
          marginBottom: '24px'
        }}>
          Área administrativa: acesso restrito
        </p>
        <p style={{ 
          color: '#999',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          Seção: <strong>{section || 'não especificada'}</strong>
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            backgroundColor: '#405FF2',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Voltar ao Início
        </a>
      </div>
    </div>
  );
};

export default AdminDetailPage;