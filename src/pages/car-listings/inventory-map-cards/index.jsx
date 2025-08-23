import Listings3 from "@/components/carListings/Listings3";
import Sidebar from "@/components/carListings/Sidebar";

import Header1 from "@/components/headers/Header1";
import React from "react";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Inventory Map Cards || Boxcar - Reactjs Car Template",
  description: "Boxcar - Reactjs Car Template",
};
export default function InventoryMapCardsPage() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Sidebar />
      <Listings3 />
    </>
  );
}
