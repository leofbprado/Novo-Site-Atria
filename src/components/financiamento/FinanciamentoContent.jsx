import LoanCalculator from "@/components/otherPages/LoanCalculator";
import React from "react";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Financiamento || Átria Veículos",
  description: "Simulador de financiamento - Átria Veículos",
};

// Componente apenas com o conteúdo da página de financiamento
export default function FinanciamentoContent() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <LoanCalculator />
    </>
  );
}