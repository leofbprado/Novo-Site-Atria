import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Scroll para o topo quando a rota muda
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Evita animação desnecessária
    });
  }, [pathname]);

  return null;
}

export default ScrollToTop;