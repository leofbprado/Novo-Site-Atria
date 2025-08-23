import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import AboutNew from "@/components/otherPages/AboutNew";
import FixedBottomMenu from "@/components/common/FixedBottomMenu";
import React from "react";
import StaticSEO from "@/components/seo/StaticSEO";

export default function AboutPage() {
  return (
    <>
      <StaticSEO page="about" />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" white={true} />
      <main className="page about-page">
        <AboutNew />
      </main>
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
      <FixedBottomMenu />
    </>
  );
}