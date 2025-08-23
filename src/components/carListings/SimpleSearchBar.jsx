import React, { useState } from 'react';

export default function SimpleSearchBar({ onSearch }) {
  const [searchValue, setSearchValue] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    console.log('Search value changed:', value);
    
    // Call the parent callback immediately
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClick = (e) => {
    console.log('Input clicked', e);
  };

  const handleFocus = (e) => {
    console.log('Input focused', e);
  };

  return (
    <div style={{ 
      zIndex: 9999,
      position: 'relative',
      backgroundColor: 'yellow',
      padding: '20px',
      border: '3px solid red'
    }}>
      <h2 style={{ color: 'red', fontSize: '24px' }}>TESTE DE BUSCA</h2>
      <p style={{ color: 'blue', fontSize: '16px' }}>Valor atual: "{searchValue}"</p>
      <input
        type="text"
        value={searchValue}
        onChange={handleChange}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={(e) => console.log('Key pressed:', e.key)}
        placeholder="Digite algo aqui para testar..."
        style={{
          zIndex: 9999,
          position: 'relative',
          width: '300px',
          height: '40px',
          fontSize: '16px',
          padding: '10px',
          border: '2px solid black',
          backgroundColor: 'white'
        }}
      />
      <button
        onClick={() => {
          console.log('Button filtrar clicked');
          const event = new CustomEvent('openFilterSidebar');
          window.dispatchEvent(event);
        }}
        style={{
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none'
        }}
      >
        Filtrar
      </button>
      <button
        onClick={() => {
          console.log('Button limpar clicked');
          setSearchValue('');
          if (onSearch) onSearch('');
        }}
        style={{
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none'
        }}
      >
        Limpar
      </button>
    </div>
  );
}