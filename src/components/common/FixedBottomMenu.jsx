import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LucideIcon from "@/components/icons/LucideIcon";
import { analytics } from '@/lib/analytics';

export default function FixedBottomMenu() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Menu items para o mobile menu lateral
  const menuItems = [
    {
      label: 'Início',
      icon: 'fa-home',
      href: '/',
    },
    {
      label: 'Estoque',
      icon: 'fa-car',
      href: '/estoque',
    },
    {
      label: 'Simular Financiamento',
      icon: 'fa-credit-card',
      href: '/simulador',
    },
    ...(isLoggedIn ? [{
      label: 'Meus Favoritos',
      icon: 'fa-star',
      href: '/favoritos',
    }] : []),
    {
      label: 'Vender meu carro',
      icon: 'fa-upload',
      href: '/vender',
    },
    {
      label: 'Blog',
      icon: 'fa-newspaper',
      href: '/blog',
    },
    {
      label: 'Sobre a Átria',
      icon: 'fa-building',
      href: '/sobre',
    },
    {
      label: isLoggedIn ? 'Sair' : 'Entrar',
      icon: isLoggedIn ? 'fa-sign-out-alt' : 'fa-user',
      href: '/login',
    },
  ];

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <>
      {/* Overlay */}
      {showMobileMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Lateral */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '300px',
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
          transform: showMobileMenu ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 10001,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <img height="60" width="150" fetchpriority="low" decoding="async" loading="lazy" src="https://res.cloudinary.com/dyngqkiyl/image/upload/f_avif,q_auto,w_150,h_60,c_fit/v1754490506/brands/atria-logo.avif" alt="Átria Veículos" style={{ height: '40px', width: 'auto', }} />
          <button
            onClick={closeMobileMenu}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#666',
              fontSize: '20px',
            }}
            aria-label="Fechar menu"
          >
            <LucideIcon name="x" size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav style={{ padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href || 
                (item.href === '/' && pathname === '/') ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <li key={index} style={{ marginBottom: '16px' }}>
                  <Link
                    to={item.href}
                    onClick={closeMobileMenu}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      color: isActive ? '#405FF2' : '#4a5568',
                      backgroundColor: isActive ? '#f0f4ff' : 'transparent',
                      borderRadius: '8px',
                      margin: '0 16px',
                      fontSize: '16px',
                      fontWeight: isActive ? '600' : '400',
                      transition: 'all 0.2s ease',
                    }}

                  >
                    <span
                      style={{
                        fontSize: '20px',
                        marginRight: '12px',
                        width: '20px',
                        textAlign: 'center',
                        color: isActive ? '#405FF2' : '#718096',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon === 'fa-home' && <LucideIcon name="home" size={20} />}
                      {item.icon === 'fa-car' && <LucideIcon name="car" size={20} />}
                      {item.icon === 'fa-credit-card' && <LucideIcon name="calculator" size={20} />}
                      {item.icon === 'fa-star' && <LucideIcon name="star" size={20} />}
                      {item.icon === 'fa-upload' && <LucideIcon name="upload" size={20} />}
                      {item.icon === 'fa-newspaper' && <LucideIcon name="newspaper" size={20} />}
                      {item.icon === 'fa-building' && <LucideIcon name="building" size={20} />}
                      {item.icon === 'fa-user' && <LucideIcon name="user" size={20} />}
                      {item.icon === 'fa-sign-out-alt' && <LucideIcon name="log-out" size={20} />}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Fixed Bottom Menu */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #000000',
          zIndex: 10001,
          padding: '8px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            maxWidth: '100%',
            margin: '0 auto',
            padding: '0 8px',
          }}
        >
          {/* Estoque */}
          <Link
            to="/estoque"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: pathname.includes('/estoque') || pathname.includes('/inventory') ? '#405FF2' : '#000000',
              fontSize: '11px',
              padding: '8px 4px',
              transition: 'all 0.2s ease',
              minWidth: '60px',
            }}
          >
            <LucideIcon name="car" size={20} style={{ marginBottom: '4px' }} />
            <span>Estoque</span>
          </Link>

          {/* Financiamento */}
          <Link
            to="/simulador"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: pathname.includes('/simulador') || pathname.includes('/loan-calculator') ? '#405FF2' : '#000000',
              fontSize: '11px',
              padding: '8px 4px',
              transition: 'all 0.2s ease',
              minWidth: '80px',
            }}
          >
            <LucideIcon name="calculator" size={20} style={{ marginBottom: '4px' }} />
            <span>Financiamento</span>
          </Link>

          {/* Ligar */}
          <a
            href="tel:+5519996525211"
            onClick={() => analytics.clickPhone('+5519996525211', 'fixed_bottom_menu')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#000000',
              fontSize: '11px',
              padding: '8px 4px',
              transition: 'all 0.2s ease',
              minWidth: '60px',
            }}
          >
            <LucideIcon name="phone-call" size={20} style={{ marginBottom: '4px' }} />
            <span>Ligar</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/5519996525211"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.clickWhatsApp(null, 'fixed_bottom_menu')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#25D366',
              fontSize: '11px',
              padding: '8px 4px',
              transition: 'all 0.2s ease',
              minWidth: '70px',
            }}
          >
            <LucideIcon name="message-square" size={20} style={{ marginBottom: '4px' }} />
            <span>WhatsApp</span>
          </a>

          {/* Menu */}
          <button
            onClick={toggleMobileMenu}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: showMobileMenu ? '#405FF2' : '#000000',
              fontSize: '11px',
              padding: '8px 4px',
              transition: 'all 0.2s ease',
              minWidth: '60px',
            }}
          >
            <LucideIcon name="menu" size={20} style={{ marginBottom: '4px' }} />
            <span>Menu</span>
          </button>
        </div>
      </div>
    </>
  );
}