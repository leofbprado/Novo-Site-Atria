import Footer1 from "@/components/footers/Footer1";
import Header6 from "@/components/headers/Header6";
import Facts from "@/components/homes/home-1/Facts";
import Blogs from "@/components/homes/home-3/Blogs";
import Team from "@/components/homes/home-4/Team";
import Testimonials from "@/components/homes/home-3/Testimonials";
import Banner2 from "@/components/homes/home-9/Banner2";
import Cars from "@/components/homes/home-9/Cars";
import CarsCollection from "@/components/homes/home-9/CarsCollection";
import Categories from "@/components/homes/home-9/Categories";
import Features from "@/components/homes/home-9/Features";
import Hero from "@/components/homes/home-9/Hero";
import React from "react";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Home 9 || Boxcar - Reactjs Car Template",
  description: "Boxcar - Reactjs Car Template",
};
export default function HomePage9() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <Header6 />
      <Hero />
      <Categories />
      <CarsCollection />
      <Facts />
      <Banner2 />
      <Cars />
      <Features />
      <Team />
      <Testimonials />
      <Blogs />
      <Footer1 />
    </>
  );
}
