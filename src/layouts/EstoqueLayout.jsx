import { Outlet, Link } from "react-router-dom";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";

export default function EstoqueLayout() {
  return (
    <div className="page-estoque" data-page="estoque">
      {/* Header padrão interno com cantos curvos */}
      <Header1
        headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1"
        white={true}
      />

      {/* Bloco padrão idêntico às internas (SEM pb-0 para não zerar o padding!) */}
      <section
        className="inventory-section layout-radius"
        style={{ paddingTop: 14, paddingBottom: 14 }}
      >
        <div className="boxcar-title-three container">
          {/* Breadcrumb linear padrão */}
          <nav className="breadcrumb">
            <ol>
              <li><Link to="/">Início</Link></li>
              <li aria-current="page"><span>Estoque</span></li>
            </ol>
          </nav>

          {/* Título com a mesma fonte/escala das internas */}
          <h1 className="title">Estoque de Veículos</h1>
        </div>
      </section>

      {/* Conteúdo da página (lista/filtros) */}
      <main id="estoque-main" className="layout-radius">
        <Outlet />
      </main>

      <Footer1 />
    </div>
  );
}
