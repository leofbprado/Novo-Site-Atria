import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * WebSiteSchema Component - Global Schema.org WebSite with SearchAction
 * Provides global structured data for search functionality
 */
const WebSiteSchema = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://www.atriaveiculos.com';

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Átria Veículos",
    "alternateName": "Átria Veículos Campinas",
    "url": BASE_URL,
    "description": "Concessionária de veículos seminovos em Campinas-SP. Carros com qualidade, procedência e garantia.",
    "inLanguage": "pt-BR",
    "publisher": {
      "@type": "AutoDealer",
      "name": "Átria Veículos",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Campinas",
        "addressRegion": "SP",
        "addressCountry": "BR"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/estoque?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema, null, 0)}
      </script>
    </Helmet>
  );
};

export default WebSiteSchema;