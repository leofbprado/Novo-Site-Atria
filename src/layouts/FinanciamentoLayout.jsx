import React from "react";
import { Outlet } from "react-router-dom";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";
import Breadcrumb from "@/components/common/Breadcrumb";
import StaticSEO from "@/components/seo/StaticSEO";

// Layout persistente para o módulo de financiamento
export default function FinanciamentoLayout() {
  const breadcrumbItems = [
    { label: "Início", href: "/" },
    { label: "Financiamento" }
  ];

  return (
    <>
      <StaticSEO page="financiamento" />
      {/* Header idêntico ao usado nas páginas individuais */}
      <Header1 
        headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" 
        white={true} 
      />
      
      {/* Main content with breadcrumb */}
      <main id="page" className="page">
        {/* Breadcrumb seguindo padrão do template */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Renderiza o conteúdo da rota filha */}
        <div key="financiamento-content">
          <Outlet />
        </div>
      </main>
      
      {/* Footer idêntico ao existente */}
      <Footer1 />
      
      {/* Menu mobile idêntico ao existente */}
      <FixedBottomMenu />
    </>
  );
}