import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Faq2 from "@/components/otherPages/Faq2";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";

import React from "react";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Faq || Boxcar - Reactjs Car Template",
  description: "Boxcar - Reactjs Car Template",
};
export default function FaqPage() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Faq2 />

      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
      <FixedBottomMenu />
    </>
  );
}
