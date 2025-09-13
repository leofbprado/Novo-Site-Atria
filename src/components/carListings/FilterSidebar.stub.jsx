import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * FilterSidebar (SAFE STUB)
 * - Monta NADA até ser aberto.
 * - Sem loops, sem contexto, sem jQuery.
 * - Abre com: window.dispatchEvent(new CustomEvent('openFilterSidebar'))
 *   (ou clique no botão "Filtros" da página, se ele dispara esse evento).
 * - Fecha com ESC, backdrop ou evento 'closeFilterSidebar'.
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

    // Se acessar com #openFilters, já abre (útil sem console)
    if (location.hash.includes("openFilters")) setOpen(true);

    return () => {
      window.removeEventListener("openFilterSidebar", onOpen);
      window.removeEventListener("closeFilterSidebar", onClose);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Não monta nada enquanto fechado (zero custo)
  if (!open) return null;

  const portalNode = document.getElementById("filters-root") || document.body;

  const ui = (
    <div
      className={`wrap-fixed-sidebar ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Filtros (modo seguro)"
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      onClick={() => setOpen(false)}
    >
      <div
        className="filters-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 480,
          width: "90vw",
          height: "100vh",
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
        }}
      >
        <div
          className="filters-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
          }}
        >
          <strong>Filtros — modo seguro</strong>
          <button
            className="filters-close"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            style={{ fontSize: 18, lineHeight: 1, background: "transparent", border: 0, cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        <div className="filters-content" style={{ padding: 16 }}>
          <p style={{ margin: 0, opacity: 0.85 }}>
            Este é um stub temporário para destravar o ambiente. Se a página entrou com ele,
            a causa do travamento está no <code>FilterSidebar.jsx</code> original.
            Me envie o arquivo completo <code>src/components/carListings/FilterSidebar.jsx</code> e eu devolvo corrigido, mantendo o visual.
          </p>
        </div>

        <div
          className="filters-footer"
          style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", gap: 8, justifyContent: "flex-end" }}
        >
          <button onClick={() => setOpen(false)} className="btn btn-light">Fechar</button>
        </div>
      </div>

      {/* Backdrop extra por segurança */}
      <div
        className="filters-backdrop"
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)" }}
      />
    </div>
  );

  // Evita "toques" no scroll do body quando aberto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(ui, portalNode);
}
