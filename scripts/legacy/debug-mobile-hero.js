// Script para verificar altura do Hero no mobile
const checkHeroHeight = () => {
  const hero = document.querySelector('.boxcar-banner-section-v1');
  const funFact = document.querySelector('.boxcar-fun-fact-section');
  
  if (hero) {
    const computedStyle = window.getComputedStyle(hero);
    console.log('Hero Height:', computedStyle.height);
    console.log('Hero computed style:', {
      height: computedStyle.height,
      padding: computedStyle.padding,
      position: computedStyle.position
    });
  }
  
  if (funFact) {
    const computedStyle = window.getComputedStyle(funFact);
    console.log('Fun Fact Padding:', {
      paddingTop: computedStyle.paddingTop,
      paddingBottom: computedStyle.paddingBottom
    });
  }
  
  // Verificar viewport
  console.log('Viewport:', {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 767
  });
};

// Executar quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkHeroHeight);
} else {
  checkHeroHeight();
}

// Executar novamente após 2 segundos
setTimeout(checkHeroHeight, 2000);