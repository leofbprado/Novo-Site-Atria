import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * FilterSidebar (SAFE STUB)
 * - Só monta quando "open" (evento/hashtag). Zero custo enquanto fechado.
 * - Abre com: window.dispatchEvent(new CustomEvent('openFilterSidebar'))
 * - Fecha com backdrop/ESC/evento 'closeFilterSidebar'.
 */
export default function FilterSidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };

    window.addEventListener("openFilterSidebar", onOpen);
    window.addEventListener("closeFilterSidebar", onClose);
    window.addEventListener("keydown", onKey);

    // Acessar /estoque#openFilters abre direto (útil sem console)
    if (location.hash.includes("openFilters")) setOpen(true);

    return () => {
      window.removeEventListener("openFilterSidebar", onOpen);
      window.removeEventListener("closeFilterSidebar", onClose);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!open) return null;

  const portalNode = document.getElementById("filters-root") || document.body;

  const ui = (
    <div
      className={`wrap-fixed-sidebar ${open ? "is-open" : ""}`}
      role="dialog" aria-modal="true" aria-label="Filtros (modo seguro)"
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      onClick={() => setOpen(false)}
    >
      <div
        className="filters-panel" onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", maxWidth: 480, width: "90vw", height: "100vh",
          background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.25)"
        }}
      >
        <div className="filters-header"
             style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #eee"}}>
          <strong>Filtros — modo seguro</strong>
          <button className="filters-close" aria-label="Fechar"
                  onClick={() => setOpen(false)}
                  style={{ fontSize: 18, lineHeight: 1, background: "transparent", border: 0, cursor: "pointer" }}>×</button>
        </div>

        <div className="filters-content" style={{ padding: 16 }}>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Stub temporário para destravar. Se a página entrou com ele,
            o travamento está no <code>FilterSidebar.jsx</code> original.
            Me envie <code>src/components/carListings/FilterSidebar.real.jsx</code> completo que eu devolvo corrigido.
          </p>
        </div>

        <div className="filters-footer"
             style={{ padding:"12px 16px", borderTop:"1px solid #eee", display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={() => setOpen(false)} className="btn btn-light">Fechar</button>
        </div>
      </div>

      <div className="filters-backdrop" onClick={() => setOpen(false)}
           style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)" }} />
    </div>
  );

  // Bloqueia scroll do body enquanto aberto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(ui, portalNode);
}
