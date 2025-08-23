import Invoice from "@/components/otherPages/Invoice";
import React from "react";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Invoice || Boxcar - Reactjs Car Template",
  description: "Boxcar - Reactjs Car Template",
};
export default function InvoicePage() {
  return (
    <div className="wrapper-invoice">
      <Invoice />
    </div>
  );
}
