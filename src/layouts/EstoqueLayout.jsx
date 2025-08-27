import { Outlet } from "react-router-dom";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";

export default function EstoqueLayout() {
  console.log("✅ EstoqueLayout carregado!"); // debug

  return (
    <div className="page-estoque" data-page="estoque">
      {/* Header igual ao padrão interno */}
      <Header1
        headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1"
        white={true}
      />

      {/* Breadcrumb e título da página */}
      <section className="breadcrumb-area bg-light py-4 border-b">
        <div className="container">
          <h1 className="page-title text-2xl font-bold text-gray-900 mb-2">
            Estoque
          </h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 text-sm text-gray-600">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Estoque
              </li>
            </ol>
          </nav>
        </div>
      </section>

      {/* Conteúdo da página (InventoryListPage1 é renderizado aqui via <Outlet />) */}
      <main id="estoque-main" className="layout-radius">
        <Outlet />
      </main>

      {/* Footer igual ao padrão interno */}
      <Footer1 />
    </div>
  );
}
