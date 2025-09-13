import React, { useState } from "react";
import FilterSidebar from "@/components/carListings/FilterSidebar";
import Listings1 from "@/components/carListings/Listings1";
import FloatingFilterButton from "@/components/common/FloatingFilterButton";

export default function InventoryListPage1() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = e.currentTarget.elements.q?.value?.trim() || "";
    setSearchTerm(q);
  };

  // Abre o Drawer/Sheet de filtros (mobile)
  const openFilterSidebar = () => {
    try {
      window.dispatchEvent(new CustomEvent("openFilterSidebar"));
    } catch (err) {
      console.warn("Não foi possível abrir o FilterSidebar:", err);
    }
  };

  return (
    <div className="inventory-page">
      {/* Barra de busca */}
      <section className="inventory-search py-6 border-b">
        <div className="container">
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
          >
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Buscar veículos por marca, modelo ou ano..."
              aria-label="Buscar veículos por marca, modelo ou ano"
              style={{
                flex: 1,
                height: 56,
                border: "1px solid #e9ecef",
                borderRadius: 12,
                padding: "0 16px",
                fontSize: 16,
                outline: "none",
                minWidth: 220,
              }}
            />

            {/* Grupo de botões: Buscar + Filtros */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                style={{
                  height: 56,
                  padding: "0 22px",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                  background: "linear-gradient(90deg,#FF8A00,#FF6200)",
                }}
              >
                Buscar
              </button>

              {/* NOVO: botão Filtros (abre o FilterSidebar no mobile) */}
              <button
                type="button"
                onClick={openFilterSidebar}
                aria-controls="filter-sidebar"
                aria-expanded="false"
                style={{
                  height: 56,
                  padding: "0 18px",
                  borderRadius: 12,
                  border: "1px solid #e9ecef",
                  background: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Filtros
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* GRID: sidebar + listagem (desktop) */}
      <div className="inventory-grid container py-8">
        <aside className="inventory-sidebar">
          {/* Sidebar visível no desktop; no mobile quem entra é o Drawer do próprio FilterSidebar */}
          <FilterSidebar />
        </aside>

        <div className="inventory-content">
          <Listings1 searchQuery={searchTerm} />
        </div>
      </div>

      {/* NOVO: botão flutuante para abrir filtros ao rolar a página (mobile) */}
      <FloatingFilterButton />
    </div>
  );
}
