import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { firebaseLazy } from "@/utils/firebaseLazy";

// CSS crítico primeiro
import "./styles/accessibility-fixes.css";
import "@/styles/overrides.css";

// Disponibiliza React global (se algum script externo precisar)
window.React = React;

/** =========================
 *  Util: carregar CSS assíncrono
 *  ========================= */
const loadCSS = (href, media = "all") => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "style";
  link.href = href;
  link.onload = function () {
    this.onload = null;
    this.rel = "stylesheet";
    this.media = media;
  };
  // Fallback: se preload falhar, injeta stylesheet direto
  link.onerror = function () {
    const fallback = document.createElement("link");
    fallback.rel = "stylesheet";
    fallback.href = href;
    fallback.media = media;
    document.head.appendChild(fallback);
  };
  document.head.appendChild(link);
  return link;
};

/** =========================
 *  Firebase: inicialização condicional
 *  ========================= */
let firebaseInitialized = false;
const initFirebase = (eager = false) => {
  if (firebaseInitialized) return;
  firebaseInitialized = true;
  firebaseLazy.init(eager ? { eager: true } : {});
};

// Rota atual
const currentPath = window.location.pathname;

if (currentPath.startsWith("/estoque")) {
  // Inventory: carrega cedo
  initFirebase(true);
} else {
  // Home/outros: lazy com gatilhos
  const triggers = [];

  // Defino cleanup antes dos handlers
  const cleanup = () => {
    triggers.forEach(([event, handler, capture]) => {
      window.removeEventListener(event, handler, capture);
    });
  };

  // 1) requestIdleCallback (fallback: load)
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => initFirebase(), { timeout: 2000 });
  } else {
    const onLoad = () => {
      initFirebase();
      window.removeEventListener("load", onLoad);
    };
    window.addEventListener("load", onLoad);
  }

  // 2) foco/keydown no campo de busca
  const searchTrigger = (event) => {
    const searchInput = document.querySelector('input[name="q"], .hero input[type="search"]');
    if (searchInput && (event.target === searchInput || searchInput.contains?.(event.target))) {
      initFirebase();
      cleanup();
    }
  };
  triggers.push(["focus", searchTrigger, true]);
  triggers.push(["keydown", searchTrigger, true]);

  // 3) primeiro scroll > 150px
  const scrollTrigger = () => {
    if (window.scrollY > 150) {
      initFirebase();
      cleanup();
    }
  };
  triggers.push(["scroll", scrollTrigger]);

  // Registrar listeners
  triggers.forEach(([event, handler, capture]) => {
    window.addEventListener(event, handler, capture);
  });
}

/** =========================
 *  Defer de recursos não críticos
 *  ========================= */
const loadConsoleFilter = () => import("./utils/consoleFilter.js");

const loadDeferredCSS = () => {
  // carregamento pós-first-paint
  setTimeout(() => {
    // CSS internos via import() para code-splitting
    import("./index.css").catch((err) => console.warn("⚠️ Erro ao carregar CSS principal:", err));
    import("./styles/calllead.css").catch((err) => console.warn("⚠️ Erro ao carregar Call-to-Call CSS:", err));
    import("./styles/safari-fixes.css").catch((err) => console.warn("⚠️ Erro ao carregar Safari fixes:", err));

    // CSS externos
    loadCSS("https://cdn.jsdelivr.net/npm/photoswipe@5.3.4/dist/photoswipe.css");

    console.log("✅ CSS não-crítico carregado de forma assíncrona");
  }, 50);
};

// jQuery sob demanda (ex.: slick)
const loadJQuery = async () => {
  if (!window.jQuery) {
    const { default: $ } = await import("jquery");
    window.jQuery = window.$ = $;
    console.log("✅ jQuery carregado sob demanda");
  }
  return window.jQuery;
};

const initializeApp = async () => {
  // Console filter depois do first paint
  setTimeout(() => {
    loadConsoleFilter().catch((err) => console.warn("⚠️ Erro ao carregar console filter:", err));
  }, 100);

  loadDeferredCSS();

  // jQuery + slick CSS (usa util global loadCSS)
  setTimeout(() => {
    loadJQuery()
      .then(() => {
        loadCSS("/css/slick.css");
        loadCSS("/css/slick-theme.css");
        console.log("✅ jQuery + Slick CSS prontos");
      })
      .catch((err) => console.warn("⚠️ Erro ao preload jQuery:", err));
  }, 2000);

  // Firebase após LCP / idle
  const initFirebaseAfterLCP = () => {
    if (window.location?.pathname?.startsWith("/estoque")) {
      firebaseLazy.init({ eager: true });
    } else {
      setTimeout(() => firebaseLazy.init({ eager: false }), 3000);
    }
  };
  window.requestIdleCallback ? requestIdleCallback(initFirebaseAfterLCP) : setTimeout(initFirebaseAfterLCP, 2000);

  // Defer de recursos utilitários
  import("./utils/resourceDeferrer")
    .then(() => console.log("✅ Resource deferrer loaded"))
    .catch(() => console.warn("⚠️ Resource deferrer failed to load"));
};

// DOM pronto → inicializações não críticas
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
  requestAnimationFrame(initializeApp);
}

/** =========================
 *  Error Boundary para evitar white screen
 *  ========================= */
class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("💥 Root error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
          <h2>Ops! Algo deu errado ao carregar.</h2>
          <p style={{ opacity: 0.7, fontSize: 14 }}>
            O erro foi capturado para debug. A UI não deve ficar em branco.
          </p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f6f8fa", padding: 12, borderRadius: 8 }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/** =========================
 *  Montagem do React
 *  ========================= */
const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("❌ Elemento #root não encontrado em index.html");
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <HelmetProvider>
          <RootErrorBoundary>
            <App />
          </RootErrorBoundary>
        </HelmetProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

// SW apenas em produção
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ Service Worker registrado:", reg.scope))
      .catch((err) => console.warn("⚠️ Erro ao registrar Service Worker:", err));
  });
}
