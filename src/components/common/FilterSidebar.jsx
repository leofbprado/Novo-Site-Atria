import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * Conteúdo dos filtros (UI/controles) — o “bloco” que você já usa no desktop.
 * Aqui só embrulhamos em um overlay mobile.
 */
import CommonFilterSidebar from "../common/FilterSidebar";

/** CSS do drawer (já existentes no projeto) */
import "../../styles/filter-sidebar.css";
import "../../styles/filters-modal.css";

export default function FilterSidebar() {
  const { pathname } = useLocation();
  const wrapRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const bodyOverflowPrev = useRef("");

  /** Abrir/fechar com estado + classe compatível com seu CSS */
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  /** Expor helpers (útil para teste no console) */
  useEffect(() => {
    window.openFilters = open;
    window.closeFilters = close;
    return () => {
      delete window.openFilters;
      delete window.closeFilters;
    };
  }, [open, close]);

  /** Ouvir evento global -> abre o painel */
  useEffect(() => {
    const handleOpenEvt = () => open();
    window.addEventListener("openFilterSidebar", handleOpenEvt);
    return () => window.removeEventListener("openFilterSidebar", handleOpenEvt);
  }, [open]);

  /** Compatibilidade: qualquer botão com .filter-popup abre o painel */
  useEffect(() => {
    const buttons = Array.from(document.querySelectorAll(".filter-popup"));
    const onClick = (e) => {
      e.preventDefault?.();
      open();
    };
    buttons.forEach((b) => b.addEventListener("click", onClick));
    return () => buttons.forEach((b) => b.removeEventListener("click", onClick));
  }, [pathname, open]);

  /** Aplicar/retirar classe .active + travar scroll do body */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (isOpen) {
      wrap.classList.add("active");
      bodyOverflowPrev.current = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";
    } else {
      wrap.classList.remove("active");
      document.body.style.overflow = bodyOverflowPrev.current;
    }
    // cleanup no unmount
    return () => {
      document.body.style.overflow = bodyOverflowPrev.current;
    };
  }, [isOpen]);

  /** Fechar com ESC */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  /** Garantir que ao trocar de rota o painel feche */
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* 
        Estrutura compatível com seus CSS:
        - .wrap-fixed-sidebar    => contêiner do overlay (classe .active abre)
        - .sidebar-backdrop      => backdrop/click-to-close
        - .filters-panel.mobile  => o “sheet” em si
      */}
      <div
        ref={wrapRef}
        id="filter-sidebar"
        className="wrap-fixed-sidebar"
        aria-hidden={!isOpen}
      >
        {/* Backdrop fecha o painel */}
        <div
          className="sidebar-backdrop close-filters"
          onClick={close}
          aria-hidden="true"
        />

        <aside
          className="filters-panel mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros de veículos"
        >
          <header className="filters-header">
            <h3 style={{ margin: 0, fontWeight: 700 }}>Filtros</h3>
            <button
              type="button"
              className="close-filters"
              aria-label="Fechar filtros"
              onClick={close}
            >
              ✕
            </button>
          </header>

          <div className="filters-body">
            {/* 
              Reuso do conteúdo de filtros já existente.
              Este componente NÃO controla o overlay; apenas renderiza os controles.
            */}
            <CommonFilterSidebar />
          </div>

          <footer className="filters-footer">
            <button type="button" className="clear-filters" onClick={() => {
              // opção: emitir um evento para limpar filtros, se você já usa Context
              const ev = new CustomEvent("clearFilters");
              window.dispatchEvent(ev);
            }}>
              Limpar
            </button>
            <button type="button" className="apply-filters" onClick={close}>
              Aplicar
            </button>
          </footer>
        </aside>
      </div>
    </>
  );
}
