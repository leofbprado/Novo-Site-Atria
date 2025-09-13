import React from "react";
import { Outlet } from "react-router-dom";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import FloatingFilterButton from "@/components/common/FloatingFilterButton";
import { LazyFilterSidebarWithSuspense } from "@/components/lazy/LazyComponents";

export default function EstoqueLayout() {
  return (
    <div className="page-estoque" data-page="estoque">
      {/* Header padrão interno */}
      <Header1
        headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1"
        white={true}
      />

      {/* Título + breadcrumb (mantém seu padrão) */}
      <section className="breadcrumb-area bg-light py-4 border-b breadcrumb-one">
        <div className="container">
          <nav className="breadcrumb" aria-label="breadcrumb">
            <ol>
              <li><a href="/">Início</a></li>
              <li className="active">Estoque</li>
            </ol>
          </nav>
          <h1 className="page-title">Estoque de Veículos</h1>
        </div>
      </section>

      {/* Conteúdo */}
      <main id="estoque-main" className="layout-radius">
        <Outlet />
      </main>

      {/* Monta o Drawer/Sheet de filtros no nível do layout (fica invisível até abrir) */}
      <LazyFilterSidebarWithSuspense />

      {/* Botão flutuante (mobile) para abrir filtros a qualquer momento */}
      <FloatingFilterButton />

      {/* Footer padrão */}
      <Footer1 />
    </div>
  );
}
