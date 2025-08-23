import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import LoanCalculator from "@/components/otherPages/LoanCalculator";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";

import React from "react";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Simular Financiamento || Átria Veículos",
  description: "Simulador de financiamento - Átria Veículos",
};

export default function LoanCalculatorPage() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
      <LoanCalculator />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
      <FixedBottomMenu />
    </>
  );
}
