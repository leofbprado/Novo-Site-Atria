import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Compare from "@/components/otherPages/Compare";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import React from "react";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Comparar Veículos || Átria Veículos",
  description: "Átria Veículos - Comparar Veículos",
};
export default function ComparePage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      // Redirecionar para login com aviso
      navigate('/login?message=Para comparar veículos, você precisa fazer login.&redirect=/comparar');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null; // Não renderizar nada durante o redirecionamento
  }

  return (
    <>
      <MetaComponent meta={metadata} />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
      <Compare />

      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
      <FixedBottomMenu />
    </>
  );
}
