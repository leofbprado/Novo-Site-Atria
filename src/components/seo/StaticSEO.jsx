import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * StaticSEO Component - SEO implementation for static pages
 * Optimized for local Campinas market with specific meta data for each page
 */
const StaticSEO = ({ page }) => {
  // Environment variables with fallback
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://www.atriaveiculos.com';
  
  // Page-specific SEO configurations
  const seoConfigs = {
    home: {
      title: "Seminovos em Campinas | Átria Veículos",
      description: "Encontre carros seminovos inspecionados em Campinas. As melhores condições de compra, venda e financiamento na Átria Veículos.",
      keywords: "seminovos Campinas, Átria Veículos, comprar carro usado",
      path: ""
    },
    about: {
      title: "Átria Veículos | Concessionária de Seminovos em Campinas",
      description: "Conheça a Átria Veículos, referência em seminovos inspecionados em Campinas. Transparência, confiança e qualidade em cada carro.",
      keywords: "sobre Átria Veículos, loja de carros Campinas",
      path: "/sobre"
    },
    contact: {
      title: "Fale Conosco | Átria Veículos Campinas",
      description: "Entre em contato com a Átria Veículos em Campinas. Tire dúvidas sobre compra, venda ou financiamento de carros seminovos inspecionados.",
      keywords: "contato Átria Veículos, telefone loja carros Campinas",
      path: "/contato"
    },
    evaluation: {
      title: "Avalie Seu Carro | Átria Veículos Campinas",
      description: "Descubra quanto vale seu carro em Campinas com a Átria Veículos. Avaliação rápida, justa e sem compromisso.",
      keywords: "avaliação de carros Campinas, vender carro usado Campinas",
      path: "/avaliacao"
    },
    blog: {
      title: "Blog Átria Veículos | Dicas e Novidades de Carros Seminovos",
      description: "Confira no Blog da Átria Veículos em Campinas dicas de manutenção, novidades do mercado e tendências de carros seminovos inspecionados.",
      keywords: "blog Átria Veículos, dicas carros usados, notícias automotivas",
      path: "/blog"
    },
    estoque: {
      title: "Estoque de Seminovos em Campinas | Átria Veículos",
      description: "Explore nosso estoque completo de carros seminovos inspecionados em Campinas. Encontre o veículo ideal com as melhores condições.",
      keywords: "estoque carros seminovos Campinas, Átria Veículos, carros usados",
      path: "/estoque"
    },
    financiamento: {
      title: "Financiamento de Veículos em Campinas | Átria Veículos",
      description: "Financie seu carro seminovo com as melhores taxas em Campinas. Simule e aprove seu crédito na Átria Veículos.",
      keywords: "financiamento carros Campinas, crédito veículos, simulador financiamento",
      path: "/financiamento"
    }
  };

  const config = seoConfigs[page] || seoConfigs.home;
  const canonicalUrl = `${BASE_URL}${config.path}`;

  // JSON-LD WebSite Schema for homepage
  const websiteSchema = page === 'home' ? {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Átria Veículos",
    "url": BASE_URL,
    "description": "Concessionária de seminovos em Campinas com carros inspecionados e garantia",
    "inLanguage": "pt-BR",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/estoque?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "AutoDealer",
      "name": "Átria Veículos",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Campinas",
        "addressRegion": "SP",
        "addressCountry": "BR"
      }
    }
  } : null;

  // JSON-LD Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": "Átria Veículos",
    "url": BASE_URL,
    "description": "Concessionária especializada em seminovos inspecionados em Campinas-SP",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Campinas",
      "addressRegion": "SP", 
      "addressCountry": "BR"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Campinas e região"
    },
    "serviceType": [
      "Venda de veículos seminovos",
      "Financiamento de veículos", 
      "Avaliação de carros usados"
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      <meta name="keywords" content={config.keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Átria Veículos" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* OpenGraph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${BASE_URL}/images/atria-og-image.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Átria Veículos" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image" content={`${BASE_URL}/images/atria-twitter-card.jpg`} />
      
      {/* Local SEO */}
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="Campinas" />
      <meta name="ICBM" content="-22.9056,-47.0608" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema, null, 0)}
      </script>
      
      {/* WebSite schema for homepage only */}
      {websiteSchema && (
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema, null, 0)}
        </script>
      )}
    </Helmet>
  );
};

export default StaticSEO;