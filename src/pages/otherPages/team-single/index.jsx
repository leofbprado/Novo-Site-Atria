import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import TeamSingle from "@/components/otherPages/TeamSingle";
import { allTeammember } from "@/data/team";

import React from "react";
import { useParams } from "react-router-dom";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Team Single || Boxcar - Reactjs Car Template",
  description: "Boxcar - Reactjs Car Template",
};
export default function TeamSinglePage() {
  let params = useParams();
  const teamMember =
    allTeammember.filter((elm) => elm.id == params.id)[0] || allTeammember[0];
  return (
    <>
      <MetaComponent meta={metadata} />
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <TeamSingle teamMember={teamMember} />

      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
