import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import DealerSingle from "@/components/otherPages/DealerSingle";
import { dealers } from "@/data/dealers";

import React from "react";
import { useParams } from "react-router-dom";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Dealer Single || Boxcar - Reactjs Car Template",
  description: "Boxcar - Reactjs Car Template",
};
export default function DealerSinglePage() {
  let params = useParams();
  const dealerItem =
    dealers.map((elm, i) => elm.id == params.id)[0] || dealers[0];
  return (
    <>
      <MetaComponent meta={metadata} />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <DealerSingle dealerItem={dealerItem} />

      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
