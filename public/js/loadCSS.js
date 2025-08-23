
  // Sistema de carregamento progressivo de CSS
  function loadCSS(href, media) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = media || 'all';
    document.head.appendChild(link);
    
    if (media !== 'all') {
      link.onload = () => { link.media = 'all'; };
    }
    
    return link;
  }
  
  // Aguardar CSS principal carregar e depois mostrar elementos progressivamente
  document.addEventListener('DOMContentLoaded', () => {
    // Aguarda 200ms para o CSS principal (preload) ser aplicado
    setTimeout(() => {
      // Remover loading state se existir
      const loadingEl = document.querySelector('.css-loading');
      if (loadingEl) loadingEl.remove();
      
      // Mostrar elementos que estavam escondidos
      const hiddenElements = document.querySelectorAll('.wow, .slick-carousel, .photoswipe-gallery, .animate__animated');
      hiddenElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transition = 'opacity 0.3s ease';
      });
      
      // Carregar CSS adicional (se necessário) 
      // loadCSS('/css/bootstrap.min.css');
      // loadCSS('/css/animate.css');
      // loadCSS('/css/fontawesome.css');
      
    }, 200);
  });
  