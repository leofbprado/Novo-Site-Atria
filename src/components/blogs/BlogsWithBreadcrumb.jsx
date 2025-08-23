import React from "react";
import { Link } from "react-router-dom";
import Blogs from "../homes/home-1/Blogs";

export default function BlogsWithBreadcrumb() {
  return (
    <>
      <style>{`
        /* Fix layout and positioning issues */
        .blog-page-breadcrumb {
          position: relative !important;
          z-index: 1 !important;
          padding: 42px 0 !important;
          background: #fff !important;
          margin-bottom: 0 !important;
        }
        .blog-page-breadcrumb .boxcar-title-three {
          margin-bottom: 0 !important;
          position: relative !important;
        }
        .blog-page-breadcrumb .boxcar-title-three .breadcrumb {
          margin-bottom: 12px !important;
          position: relative !important;
          z-index: 10 !important;
        }
        .blog-page-breadcrumb .boxcar-title-three .title {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          font-size: 40px !important;
          font-weight: 700 !important;
          color: #1a2332 !important;
          margin: 0 0 36px 0 !important;
          text-align: left !important;
          line-height: 1.2 !important;
          position: relative !important;
          z-index: 10 !important;
        }
        /* Ensure blog section doesn't overlap */
        .blog-section-homepage {
          position: relative !important;
          z-index: 2 !important;
          margin-top: 0 !important;
          clear: both !important;
        }
        /* Remove any absolute positioning that might cause overlap */
        .blog-section-homepage * {
          position: relative !important;
        }
      `}</style>
      
      <section className="inventory-section pb-0 layout-radius blog-page-breadcrumb">
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            <nav id="bc-blog" aria-label="breadcrumb" className="breadcrumb">
              <ol>
                <li><Link to="/">Início</Link></li>
                <li className="bc-sep" aria-hidden="true">/</li>
                <li aria-current="page">Blog</li>
              </ol>
            </nav>
            <h2 className="title">Últimas do Blog</h2>
          </div>
        </div>
      </section>
      
      {/* Renderiza o componente Blogs original sem título duplicado */}
      <Blogs hiddenTitle={true} />
    </>
  );
}