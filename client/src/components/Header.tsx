import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";

const LOGO_AZUL = "https://i.postimg.cc/7Zvv28w2/Logo_%C3%81tria_Azul.png";
const LOGO_BRANCO = "https://i.postimg.cc/25m34dvJ/Logo_%C3%81tria_Branco.png";

const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Estoque", href: "/estoque" },
  { label: "Financiamento", href: "/financiamento" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "#contato" },
];

const WHATSAPP =
  "https://wa.me/5519999999999?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20veículos.";

function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isNavy = scrolled;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isNavy ? "bg-atria-navy shadow-lg" : "bg-white shadow-sm"
      }`}
    >
      {/* Top bar — visible only when NOT scrolled */}
      {!scrolled && (
        <div className="bg-atria-navy py-1.5 hidden md:block">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <span className="text-blue-200 text-xs font-inter">
              📍 Campinas, SP — Seg a Sex 9h–19h · Sáb 9h–17h
            </span>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-xs font-inter flex items-center gap-1.5 hover:text-atria-yellow transition-colors"
            >
              <Phone size={11} />
              (19) 99999-9999
            </a>
          </div>
        </div>
      )}

      {/* Main nav */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex-shrink-0">
          <img
            src={isNavy ? LOGO_BRANCO : LOGO_AZUL}
            alt="Átria Veículos"
            className="h-9 md:h-11 w-auto object-contain transition-all duration-300"
            onError={(e) => {
              // Fallback text if image fails
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent && !parent.querySelector("span")) {
                const span = document.createElement("span");
                span.innerHTML = `<span class="font-barlow-condensed font-black text-2xl uppercase tracking-tight ${isNavy ? "text-white" : "text-atria-navy"}">ÁTRIA VEÍCULOS</span>`;
                parent.appendChild(span);
              }
            }}
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`font-inter text-sm font-semibold uppercase tracking-wider transition-colors ${
                isNavy
                  ? "text-white/80 hover:text-atria-yellow"
                  : "text-atria-text-dark hover:text-atria-navy"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-sm font-inter font-semibold transition-colors ${
              isNavy ? "text-green-300 hover:text-green-200" : "text-green-600 hover:text-green-700"
            }`}
          >
            <WaIcon />
            WhatsApp
          </a>
          <a href="/estoque" className="btn-yellow rounded text-sm px-5 py-2.5">
            Ver Estoque
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`lg:hidden p-2 transition-colors ${isNavy ? "text-white" : "text-atria-navy"}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`lg:hidden border-t overflow-hidden ${
              isNavy ? "border-white/10 bg-atria-navy" : "border-gray-100 bg-white"
            }`}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`font-inter font-semibold text-sm uppercase tracking-wider px-3 py-3 rounded transition-colors ${
                    isNavy
                      ? "text-white/80 hover:text-white hover:bg-white/10"
                      : "text-atria-text-dark hover:text-atria-navy hover:bg-atria-gray-light"
                  }`}
                >
                  {l.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-inter font-bold uppercase tracking-wider text-sm py-3 rounded transition-colors"
                >
                  <WaIcon />
                  WhatsApp
                </a>
                <a href="/estoque" className="btn-yellow rounded text-sm text-center py-3">
                  Ver Estoque
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
