import React from "react";
import { Outlet } from "react-router-dom";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";

// Layout persistente para o módulo de estoque
// Usa os mesmos componentes visuais existentes sem alterações
export default function EstoqueLayout() {
  return (
    <>
      {/* Header idêntico ao usado nas páginas individuais */}
      <Header1 
        headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" 
        white={true} 
      />
      
      {/* Main content */}
      <main id="page" className="page">
        {/* Renderiza o conteúdo da rota filha */}
        <div key="estoque-content">
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