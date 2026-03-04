
// ⚡ CRITICAL JAVASCRIPT INLINE (1.2KB)
window.ATRIA_PERF=window.ATRIA_PERF||{marks:{},measures:{},mark:function(name){this.marks[name]=performance.now();performance.mark&&performance.mark(name);},measure:function(name,start){const startTime=this.marks[start]||0;const duration=performance.now()-startTime;this.measures[name]=duration;performance.measure&&performance.measure(name,start);console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);}};
window.ATRIA_PERF.mark('Script Start');

// Font loading optimization
if('fonts' in document){
  const fontPromises=[
    new FontFace('DM Sans','url(https://fonts.gstatic.com/s/dmsans/v11/rP2Hp2ywxg089UriCZOIHQ.woff2)',{weight:'400',display:'swap'}).load(),
    new FontFace('DM Sans','url(https://fonts.gstatic.com/s/dmsans/v11/rP2Cp2ywxg089UriAWCrCBimCw.woff2)',{weight:'700',display:'swap'}).load()
  ];
  
  Promise.all(fontPromises).then(fonts=>{
    fonts.forEach(font=>document.fonts.add(font));
    window.ATRIA_PERF.mark('Fonts Loaded');
    document.documentElement.classList.add('fonts-loaded');
  }).catch(err=>console.warn('Font loading failed:',err));
}

// Touch optimization for carousel
window.ATRIA_TOUCH={startX:0,handleTouchStart:function(e){this.startX=e.touches[0].pageX;},handleTouchMove:function(e){const currentX=e.touches[0].pageX;const deltaX=currentX-this.startX;if(Math.abs(deltaX)>50){const carousel=e.currentTarget.closest('.car-slider-three');if(carousel&&carousel.slick){deltaX>0?carousel.slick.slickPrev():carousel.slick.slickNext();this.startX=currentX;}}}};

// Lazy loading optimization
if('IntersectionObserver' in window){
  window.ATRIA_OBSERVER=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el=entry.target;
        if(el.dataset.src){el.src=el.dataset.src;el.removeAttribute('data-src');}
        if(el.dataset.lazy)el.classList.add('lazy-loaded');
        window.ATRIA_OBSERVER.unobserve(el);
      }
    });
  },{rootMargin:'50px 0px',threshold:0.1});
}


// 🚀 Carregamento progressivo de ícones Font Awesome
function loadNonCriticalIcons() {
  const nonCriticalIcons = {
    'fa-gas-pump': '\\f52f',
    'fa-gauge': '\\f624', 
    'fa-gear': '\\f013',
    'fa-share': '\\f064',
    'fa-eye': '\\f06e',
    'fa-play': '\\f04b',
    'fa-calendar': '\\f133',
    'fa-clock': '\\f017',
    'fa-user': '\\f007',
    'fa-tag': '\\f02b',
    'fa-filter': '\\f0b0',
    'fa-sort': '\\f0dc',
    'fa-grid': '\\f00a',
    'fa-list': '\\f03a',
    'fa-home': '\\f015',
    'fa-info-circle': '\\f05a',
    'fa-exclamation-triangle': '\\f071',
    'fa-whatsapp': '\\f232',
    'fa-facebook': '\\f09a',
    'fa-instagram': '\\f16d',
    'fa-youtube': '\\f167',
    'fa-linkedin': '\\f08c'
  };

  // Criar CSS dinamicamente
  const iconCSS = Object.entries(nonCriticalIcons)
    .map(([className, content]) => `.${className}:before { content: "${content}"; }`)
    .join('\n');

  const style = document.createElement('style');
  style.textContent = iconCSS;
  document.head.appendChild(style);
  
  console.log('✅ Ícones não-críticos carregados');
}

// Carregar após interação ou timeout
const loadIconsOnInteraction = () => {
  loadNonCriticalIcons();
  ['scroll', 'click', 'touchstart', 'keydown'].forEach(event => {
    document.removeEventListener(event, loadIconsOnInteraction);
  });
};

['scroll', 'click', 'touchstart', 'keydown'].forEach(event => {
  document.addEventListener(event, loadIconsOnInteraction, { once: true });
});

// Timeout de segurança
setTimeout(loadNonCriticalIcons, 4000);

