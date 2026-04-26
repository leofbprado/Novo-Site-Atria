import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { track, trackLead, trackIntent } from "@/lib/track";

const WA_NUMBER = "5519996525211";

const WA_OPTIONS = [
  {
    label: "Quero comprar um carro",
    msg: "Olá! Vim pelo site e quero comprar um carro. Podem me ajudar?",
  },
  {
    label: "Quero vender meu carro",
    msg: "Olá! Vim pelo site e quero vender meu carro. Como funciona a avaliação?",
  },
  {
    label: "Simular financiamento",
    msg: "Olá! Vim pelo site e quero simular um financiamento. Podem me ajudar?",
  },
  {
    label: "Falar com atendente",
    msg: "Olá! Vim pelo site e gostaria de falar com um atendente.",
  },
];

function WhatsAppFloat() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [location] = useLocation();
  // Na ficha do veículo, a sticky bottom bar substitui o float (evita
  // competição visual entre dois CTAs e o pulse). Cobre as 3 rotas que
  // renderizam VehicleDetail — atual /campinas-sp/, legacy /campinas/ e
  // legacy /veiculo/.
  const hidden =
    location.startsWith("/campinas-sp/") ||
    location.startsWith("/campinas/") ||
    location.startsWith("/veiculo/");
  // Pulsar após 15 segundos na página
  useEffect(() => {
    if (hidden) return;
    const t = setTimeout(() => setPulse(true), 15000);
    return () => clearTimeout(t);
  }, [hidden]);

  if (hidden) return null;

  // Parar de pulsar quando abrir o chat
  const handleToggle = () => {
    if (!open) {
      trackIntent("lead_whatsapp_floating_aberto", { origem: "floating" });
    }
    setOpen((o) => !o);
    setPulse(false);
  };

  const handleOption = (label: string, msg: string) => {
    trackLead({
      clarityEvent: "lead_whatsapp_floating",
      gtmEvent: "whatsapp_click",
      origem: "floating",
      source: `floating-${label.toLowerCase().replace(/\s+/g, "-")}`,
    });
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Mini-chat */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-atria-gray-medium w-72 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-green-500 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-inter font-semibold text-white text-sm">Átria Veículos</p>
              <p className="font-inter text-white/80 text-xs">Responde em minutos</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white text-lg leading-none"
              aria-label="Fechar"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            <p className="font-inter text-sm text-atria-text-gray mb-3">
              Olá! Como podemos te ajudar? 👋
            </p>
            <div className="space-y-2">
              {WA_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleOption(opt.label, opt.msg)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-atria-gray-medium hover:border-green-400 hover:bg-green-50 font-inter text-sm text-atria-text-dark transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={handleToggle}
        aria-label="Falar no WhatsApp"
        className={`relative flex items-center justify-center w-14 h-14 bg-gradient-to-b from-green-500 to-green-600 hover:brightness-110 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          pulse ? "animate-bounce" : ""
        }`}
      >
        {pulse && (
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
        )}
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
          </svg>
        )}
      </button>
    </div>
  );
}

interface LayoutProps {
  children: ReactNode;
}

/**
 * Listener global de cliques em links WhatsApp e telefone.
 * Captura QUALQUER <a href="https://wa.me/..."> ou <a href="tel:..."> da página
 * sem precisar plugar manualmente em cada componente.
 *
 * Também captura window.open() de WA quando feito programaticamente, mas pra
 * isso usamos um interceptador separado abaixo.
 */
function useGlobalLinkTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      // Procura o <a> mais próximo
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";

      if (href.startsWith("https://wa.me/") || href.startsWith("https://api.whatsapp.com/")) {
        // Extrai o número
        const match = href.match(/wa\.me\/(\d+)|phone=(\d+)/);
        const number = match?.[1] || match?.[2];
        track("whatsapp_click", {
          source: anchor.getAttribute("data-source") || "link",
          number,
          location: window.location.pathname,
        });
      } else if (href.startsWith("tel:")) {
        track("phone_click", {
          source: anchor.getAttribute("data-source") || "link",
          number: href.replace("tel:", ""),
          location: window.location.pathname,
        });
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
}

/**
 * Intercepta window.open() pra capturar wa.me aberto programaticamente.
 * Necessário porque vários componentes (formulários, round-robin de consignação)
 * usam window.open() em vez de <a href>.
 */
function useGlobalWindowOpenTracking() {
  useEffect(() => {
    const orig = window.open;
    window.open = function (url, ...rest) {
      try {
        if (typeof url === "string") {
          if (url.startsWith("https://wa.me/") || url.startsWith("https://api.whatsapp.com/")) {
            const match = url.match(/wa\.me\/(\d+)|phone=(\d+)/);
            const number = match?.[1] || match?.[2];
            track("whatsapp_click", {
              source: "window.open",
              number,
              location: window.location.pathname,
            });
          }
        }
      } catch { /* não bloqueia */ }
      return orig.call(this, url, ...rest);
    };
    return () => { window.open = orig; };
  }, []);
}

export function Layout({ children }: LayoutProps) {
  useGlobalLinkTracking();
  useGlobalWindowOpenTracking();
  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
