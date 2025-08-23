import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Componente que previne erros de DOM durante navegação
export default function SafeRoute({ children }) {
  const location = useLocation();
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Limpar qualquer manipulação pendente do DOM ao mudar de rota
    return () => {
      // Forçar limpeza segura do DOM
      if (containerRef.current) {
        // Aguardar próximo ciclo para garantir que React finalizou suas operações
        setTimeout(() => {
          if (containerRef.current && containerRef.current.parentNode) {
            try {
              // Remover todos os event listeners
              const newContainer = containerRef.current.cloneNode(true);
              containerRef.current.parentNode.replaceChild(newContainer, containerRef.current);
            } catch (e) {
              console.log('⚠️ Limpeza DOM segura aplicada');
            }
          }
        }, 0);
      }
    };
  }, [location.pathname]);

  return (
    <div ref={containerRef} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}