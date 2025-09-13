import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * FilterSidebar — versão final segura e performática
 *
 * - Abre/fecha por eventos globais:
 *     window.dispatchEvent(new CustomEvent('openFilterSidebar'))
 *     window.dispatchEvent(new CustomEvent('closeFilterSidebar'))
 *   (ESC e clique no backdrop também fecham)
 *
 * - Sem jQuery. Sem loops de render. Computações só quando OPEN.
 * - Deriva opções (marcas/modelos/tags/anos/faixa de preço) com useMemo
 *   e só quando o overlay estiver aberto, evitando custo na página.
 *
 * - Integração "agnóstica":
 *     • Emite eventos que o app pode ouvir:
 *         'atria:filters/apply'  (detail = filtros)
 *         'atria:filters/clear'
 *     • Se existir um bridge global (window.ATRIA_FILTERS.apply/clear),
 *       ele é chamado também. Assim não quebramos seu FilterContext atual.
 *
 * - Mantém classes/estrutura (.wrap-fixed-sidebar, .filters-panel, etc.)
 *   para respeitar o visual existente.
 */

const getVehicles = () => {
  // Se o app expuser os veículos globalmente, usamos; senão, lista vazia.
  // Não criamos import fixo para não acoplar/compilar errado.
  return (
    window.__ATRIA_VEHICLES__ ||
    window.ATRIA_VEHICLES ||
    window.__VEHICLES__ ||
    []
  );
};

const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));

export default function FilterSidebar() {
  const [open, setOpen] = useState(false);

  // Estado local dos filtros (mantemos básico; seu contexto pode sobrepor)
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [tags, setTags] = useState(new Set());

  // Evitar recomputar enquanto fechado
  const vehicles = useMemo(() => (open ? getVehicles() : []), [open]);

  // Derivados leves (defensivos)
  const { brands, models, allTags, years, priceRange } = useMemo(() => {
    if (!open || !Array.isArray(vehicles) || vehicles.length === 0) {
      return {
        brands: [],
        models: [],
        allTags: [],
        years: [],
        priceRange: [0, 0],
      };
    }

    // Normaliza propriedades mais comuns: brand, model, year, price, tags
    const brands = unique(
      vehicles.map((v) => (v.brand || v.marca || v.make || "").toString().trim())
    ).sort((a, b) => a.localeCompare(b));

    const models = unique(
      vehicles.map((v) => (v.model || v.modelo || v.name || "").toString().trim())
    ).sort((a, b) => a.localeCompare(b));

    const yearVals = vehicles
      .map((v) => Number(v.year || v.ano || v.yearModel || v.anoModelo))
      .filter((n) => Number.isFinite(n));
    const minY = yearVals.length ? Math.min(...yearVals) : 0;
    const maxY = yearVals.length ? Math.max(...yearVals) : 0;
    const years = Array.from(new Set(yearVals.sort((a, b) => b - a)));

    const prices = vehicles
      .map((v) => Number(v.price || v.preco || v.listPrice || v.value))
      .filter((n) => Number.isFinite(n) && n > 0);
    const minP = prices.length ? Math.min(...prices) : 0;
    const maxP = prices.length ? Math.max(...prices) : 0;

    // Tags podem vir como string "A,B" ou array
    const tagList = [];
    for (const v of vehicles) {
      const raw =
        v.tags ||
        v.etiquetas ||
        v.offerTags ||
        v.ofertas ||
        v.labels ||
        v.badges ||
        [];
      if (Array.isArray(raw)) {
        for (const t of raw) if (t) tagList.push(String(t).trim());
      } else if (typeof raw === "string") {
        raw
          .split(/[;,|]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((t) => tagList.push(t));
      }
    }

    const allTags = unique(tagList).slice(0, 24); // segurança: limita 24
    return {
      brands,
      models,
      allTags,
      years,
      priceRange: [minP, maxP],
    };
  }, [open, vehicles]);

  // Abertura/fechamento (eventos globais, ESC e hash helper)
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("openFilterSidebar", onOpen);
    window.addEventListener("closeFilterSidebar", onClose);
    window.addEventListener("keydown", onKey);

    if (location.hash.includes("openFilters")) setOpen(true);

    return () => {
      window.removeEventListener("openFilterSidebar", onOpen);
      window.removeEventListener("closeFilterSidebar", onClose);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock scroll quando aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Bridge de aplicação/limpeza de filtros
  const applyFilters = () => {
    const payload = {
      search,
      brand,
      model,
      minPrice: toNumberOrNull(minPrice),
      maxPrice: toNumberOrNull(maxPrice),
      yearFrom: toNumberOrNull(yearFrom),
      yearTo: toNumberOrNull(yearTo),
      tags: Array.from(tags),
      _ts: Date.now(),
    };

    // Evento para qualquer listener do app
    window.dispatchEvent(
      new CustomEvent("atria:filters/apply", { detail: payload })
    );
    // Bridge opcional
    try {
      window.ATRIA_FILTERS?.apply?.(payload);
    } catch {}

    // Também mantenho o antigo hábito (se alguém escuta isso)
    window.dispatchEvent(
      new CustomEvent("filtersApplied", { detail: payload })
    );

    // Fecha após aplicar
    window.dispatchEvent(new CustomEvent("closeFilterSidebar"));
  };

  const clearFilters = () => {
    setSearch("");
    setBrand("");
    setModel("");
    setMinPrice("");
    setMaxPrice("");
    setYearFrom("");
    setYearTo("");
    setTags(new Set());

    window.dispatchEvent(new CustomEvent("atria:filters/clear"));
    try {
      window.ATRIA_FILTERS?.clear?.();
    } catch {}

    // Mantém aberto para o usuário ver os campos limpos; mude para fechar se preferir.
  };

  const toggleTag = (t) => {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  if (!open) return null;

  const portalNode = document.getElementById("filters-root") || document.body;

  return createPortal(
    <div
      className={`wrap-fixed-sidebar is-open`}
      role="dialog"
      aria-modal="true"
      aria-label="Filtros do Estoque"
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      onClick={() => setOpen(false)}
    >
      <div
        className="filters-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 520,
          width: "90vw",
          height: "100vh",
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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
          <strong>Filtros</strong>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-link"
              onClick={clearFilters}
              style={{ cursor: "pointer" }}
              aria-label="Limpar filtros"
            >
              Limpar
            </button>
            <button
              className="filters-close"
              aria-label="Fechar"
              onClick={() => setOpen(false)}
              style={{
                fontSize: 18,
                lineHeight: 1,
                background: "transparent",
                border: 0,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div
          className="filters-content"
          style={{
            padding: 16,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* Busca */}
          <section className="filters-section" aria-label="Busca">
            <label
              htmlFor="fs-search"
              className="label"
              style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
            >
              Buscar
            </label>
            <input
              id="fs-search"
              type="search"
              className="input"
              placeholder="Ex.: Corolla, SUV, automático…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
          </section>

          {/* Marca / Modelo */}
          <section
            className="filters-section"
            aria-label="Marca e Modelo"
            style={{ marginTop: 16 }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="fs-brand"
                  className="label"
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Marca
                </label>
                <select
                  id="fs-brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    background: "#fff",
                  }}
                >
                  <option value="">Todas</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="fs-model"
                  className="label"
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Modelo
                </label>
                <select
                  id="fs-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    background: "#fff",
                  }}
                >
                  <option value="">Todos</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Preço */}
          <section
            className="filters-section"
            aria-label="Preço"
            style={{ marginTop: 16 }}
          >
            <label className="label" style={{ fontWeight: 600 }}>
              Preço
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={
                  priceRange[0] ? `de ${formatBRL(priceRange[0])}` : "Mín."
                }
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={priceInputStyle}
                aria-label="Preço mínimo"
              />
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={
                  priceRange[1] ? `até ${formatBRL(priceRange[1])}` : "Máx."
                }
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={priceInputStyle}
                aria-label="Preço máximo"
              />
            </div>
          </section>

          {/* Ano */}
          <section
            className="filters-section"
            aria-label="Ano"
            style={{ marginTop: 16 }}
          >
            <label className="label" style={{ fontWeight: 600 }}>
              Ano
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="De"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                style={priceInputStyle}
                aria-label="Ano inicial"
              />
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Até"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                style={priceInputStyle}
                aria-label="Ano final"
              />
            </div>
          </section>

          {/* Tags (Ofertas) */}
          {allTags.length > 0 && (
            <section
              className="filters-section"
              aria-label="Ofertas/Tags"
              style={{ marginTop: 16 }}
            >
              <label className="label" style={{ fontWeight: 600 }}>
                Ofertas
              </label>
              <div
                className="tags-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                {allTags.map((t) => {
                  const active = tags.has(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`tag-btn ${active ? "is-active" : ""}`}
                      aria-pressed={active}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 999,
                        border: `1px solid ${active ? "#1A75FF" : "#ddd"}`,
                        background: active ? "rgba(26,117,255,.08)" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div
          className="filters-footer"
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #eee",
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-light"
            style={footerBtn("light")}
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="btn btn-primary"
            style={footerBtn("primary")}
          >
            Aplicar filtros
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="filters-backdrop"
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)" }}
      />
    </div>,
    portalNode
  );
}

function toNumberOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatBRL(n) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `R$ ${n}`;
  }
}

const priceInputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
  background: "#fff",
};

function footerBtn(kind) {
  if (kind === "primary") {
    return {
      padding: "10px 16px",
      borderRadius: 8,
      background:
        "linear-gradient(135deg, rgba(26,117,255,1) 0%, rgba(99,102,241,1) 100%)",
      color: "#fff",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
    };
  }
  return {
    padding: "10px 16px",
    borderRadius: 8,
    background: "#fff",
    color: "#111",
    fontWeight: 600,
    border: "1px solid #ddd",
    cursor: "pointer",
  };
}
