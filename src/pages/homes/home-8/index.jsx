import Header5 from "@/components/headers/Header5";
import Features from "@/components/homes/home-8/Features";
import Brands from "@/components/homes/home-8/Brands";
import Cars from "@/components/homes/home-8/Cars";
import CarType from "@/components/homes/home-8/CarType";

import Hero from "@/components/homes/home-8/Hero";
import React from "react";
import Facts from "@/components/homes/home-8/Facts";
import Cars2 from "@/components/homes/home-8/Cars2";
import Testimonials from "@/components/homes/home-8/Testimonials";
import Blogs from "@/components/homes/home-4/Blogs";
import NewsLetter from "@/components/homes/home-8/NewsLetter";
import Footer4 from "@/components/footers/Footer4";

import MetaComponent from "@/components/common/Metacomonent";
const metadata = {
  title: "Home 8 || Boxcar - Reactjs Car Template",
  description: "Boxcar - Reactjs Car Template",
};
export default function HomePage8() {
  return (
    <>
      <MetaComponent meta={metadata} />
      <Header5 />
      <Hero />
      <CarType />
      <Brands />
      <Cars />
      <Features />
      <Facts />
      <div className="mt-5"></div>
      <Cars2 />
      <Testimonials />
      <Blogs />
      <NewsLetter />
      <Footer4 />
    </>
  );
}
