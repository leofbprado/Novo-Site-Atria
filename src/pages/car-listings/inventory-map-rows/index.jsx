import Listings4 from "@/components/carListings/Listings4";
import Sidebar from "@/components/carListings/Sidebar";

import Header1 from "@/components/headers/Header1";
import React from "react";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Inventory Map Rows || Boxcar - Reactjs Car Template",
  description: "Boxcar - Reactjs Car Template",
};
export default function InventoryMapRowsPage() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Sidebar />
      <Listings4 />
    </>
  );
}
