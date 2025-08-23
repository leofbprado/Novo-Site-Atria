import React from 'react';

/**
 * LocalSEOText Component - Adds location-specific text for Local SEO
 * Displays "Disponível em Campinas-SP" in a subtle, non-intrusive way
 */
const LocalSEOText = ({ className = '', style = {} }) => {
  const defaultStyle = {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    ...style
  };

  return (
    <div className={`local-seo-text ${className}`} style={defaultStyle}>
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <span>Disponível em Campinas-SP</span>
    </div>
  );
};

export default LocalSEOText;