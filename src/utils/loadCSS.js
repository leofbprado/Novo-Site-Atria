// Função para carregamento assíncrono de CSS
export function loadCSS(href, before, media) {
  "use strict";
  var doc = window.document;
  var ss = doc.createElement("link");
  var ref;
  if (before) {
    ref = before;
  } else {
    var refs = (doc.body || doc.getElementsByTagName("head")[0]).childNodes;
    ref = refs[refs.length - 1];
  }

  var sheets = doc.styleSheets;
  ss.rel = "stylesheet";
  ss.href = href;
  ss.media = "only x";

  function ready(cb) {
    if (doc.body) {
      return cb();
    }
    setTimeout(function () {
      ready(cb);
    });
  }

  ready(function () {
    ref.parentNode.insertBefore(ss, before ? ref : ref.nextSibling);
  });

  var onloadcssdefined = function (cb) {
    var resolvedHref = ss.href;
    var i = sheets.length;
    while (i--) {
      if (sheets[i].href === resolvedHref) {
        return cb();
      }
    }
    setTimeout(function () {
      onloadcssdefined(cb);
    });
  };

  function loadCB() {
    if (ss.addEventListener) {
      ss.removeEventListener("load", loadCB);
    }
    ss.media = media || "all";
  }

  if (ss.addEventListener) {
    ss.addEventListener("load", loadCB);
  }
  ss.onloadcssdefined = onloadcssdefined;
  onloadcssdefined(loadCB);
  return ss;
}

// Função para carregar CSS crítico após o carregamento inicial
export function loadDeferredCSS() {
  // Remove loading screen se existir
  const loadingElement = document.querySelector('.css-loading');
  if (loadingElement) {
    loadingElement.remove();
  }

  // Lista de CSS não críticos para carregar após o primeiro paint
  const deferredStyles = [
    // CSS principal será carregado pelo Vite automaticamente
    // Aqui podemos adicionar CSS específicos se necessário
  ];

  deferredStyles.forEach(href => {
    loadCSS(href);
  });

  // CORREÇÃO: NÃO REMOVER CSS CRÍTICO DO HERO
  // Comentado para preservar regras de visibilidade do Hero
  /*
  setTimeout(() => {
    const criticalStyle = document.querySelector('style');
    if (criticalStyle && criticalStyle.innerHTML.includes('CSS CRÍTICO')) {
      // Manter apenas algumas regras críticas
      criticalStyle.innerHTML = `
        :root {
          --theme-color-dark: #1a2332;
          --theme-color-light: #ffffff;
          --title-font: "DM Sans", sans-serif;
        }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: var(--title-font); }
      `;
    }
  }, 3000);
  */
}

// Auto-executar após carregamento da página
if (typeof window !== 'undefined') {
  // Aguardar primeiro paint antes de carregar CSS não crítico
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Delay para garantir que critical CSS já foi renderizado
      setTimeout(loadDeferredCSS, 100);
    });
  } else {
    setTimeout(loadDeferredCSS, 100);
  }
}