import { useState } from "react";
import FilterSidebar from "@/components/carListings/FilterSidebar";
import Listings1 from "@/components/carListings/Listings1";

export default function InventoryListPage1() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = e.currentTarget.elements.q?.value?.trim() || "";
    setSearchTerm(q);
  };

  return (
    <div className="inventory-page">
      {/* Barra de busca — NÃO encostar no título, evitar sobreposição */}
      <section
        className="inventory-search"
        style={{
          marginTop: 10,          // respiro igual às internas (evita ficar “engolida”)
          paddingTop: 8,
          paddingBottom: 8,
          position: "relative",
          zIndex: 2               // garante que fique acima de bordas curvas
        }}
        aria-label="Busca de veículos"
      >
        <div className="container">
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", gap: 12, alignItems: "center" }}
          >
            <input
              type="text"
              name="q"
              defaultValue={searchTerm}
              placeholder="Buscar veículos por marca, modelo ou ano..."
              aria-label="Buscar veículos por marca, modelo ou ano"
              autoComplete="off"
              style={{
                flex: 1,
                height: 56,
                border: "1px solid #e9ecef",
                borderRadius: 12,
                padding: "0 16px",
                fontSize: 16,
                outline: "none",
              }}
            />
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
          </form>
        </div>
      </section>

      {/* GRID: sidebar + listagem (gap curto abaixo da busca) */}
      <div className="inventory-grid container" style={{ marginTop: 12 }}>
        <aside className="inventory-sidebar">
          <FilterSidebar />
        </aside>
        <div className="inventory-content">
          <Listings1 searchQuery={searchTerm} />
        </div>
      </div>
    </div>
  );
}
