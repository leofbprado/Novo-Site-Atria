import { Link } from "react-router-dom";

export default function SimpleBottomMenu() {
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        height: '70px'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100%',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <Link 
          to="/inventory-list-01" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#6b7280',
            fontSize: '12px'
          }}
        >
          <div style={{ marginBottom: '4px' }}>📦</div>
          <span>Estoque</span>
        </Link>
        
        <Link 
          to="/loan-calculator" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#6b7280',
            fontSize: '12px'
          }}
        >
          <div style={{ marginBottom: '4px' }}>💰</div>
          <span>Financiamento</span>
        </Link>
        
        <a 
          href="tel:+5519996525211" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#6b7280',
            fontSize: '12px'
          }}
        >
          <div style={{ marginBottom: '4px' }}>📞</div>
          <span>Ligar</span>
        </a>
        
        <a 
          href="https://wa.me/5519996525211?text=Olá! Gostaria de mais informações sobre os veículos." 
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#6b7280',
            fontSize: '12px'
          }}
        >
          <div style={{ marginBottom: '4px' }}>💬</div>
          <span>WhatsApp</span>
        </a>
        
        <Link 
          to="/contact" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#6b7280',
            fontSize: '12px'
          }}
        >
          <div style={{ marginBottom: '4px' }}>☰</div>
          <span>Menu</span>
        </Link>
      </div>
    </div>
  );
}