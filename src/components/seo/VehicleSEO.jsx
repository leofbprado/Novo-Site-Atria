import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * VehicleSEO Component - Complete SEO implementation for vehicle detail pages
 * Includes: canonical URL, meta tags, OpenGraph, Twitter Cards, JSON-LD Vehicle schema, and Local SEO
 */
const VehicleSEO = ({ carItem, currentUrl }) => {
  if (!carItem) return null;

  // Environment variables with fallback
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://www.atriaveiculos.com';
  
  // Generate clean canonical URL using new shortId-based format
  // Format: /carros/{marca}/{modelo}/{ano}-{shortId}
  const generateCanonicalUrl = () => {
    // Import buildVehicleCanonicalPath function
    const buildPath = (vehicle) => {
      const normalize = (text) => {
        if (!text) return '';
        return text
          .toLowerCase()
          .replace(/[áàâãä]/g, 'a')
          .replace(/[éèêë]/g, 'e')
          .replace(/[íìîï]/g, 'i')
          .replace(/[óòôõö]/g, 'o')
          .replace(/[úùûü]/g, 'u')
          .replace(/[ç]/g, 'c')
          .replace(/[ñ]/g, 'n')
          .replace(/[^a-z0-9\-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      };
      
      const marca = normalize(vehicle.marca);
      const modelo = normalize(vehicle.modelo);
      const ano = vehicle.ano_modelo || vehicle.ano_fabricacao || '';
      const id = vehicle.shortId || vehicle.codigo;
      
      if (!marca || !modelo || !ano || !id) return null;
      
      return `/carros/${marca}/${modelo}/${ano}-${id}`;
    };
    
    const path = buildPath(carItem);
    return path ? `${BASE_URL}${path}` : BASE_URL;
  };

  // Format price for display and schema
  const formatPrice = (price) => {
    if (!price) return null;
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) : price;
    return isNaN(numPrice) ? null : numPrice;
  };

  // Format mileage for display
  const formatMileage = (km) => {
    if (!km) return null;
    const numKm = typeof km === 'string' ? parseFloat(km.replace(/[^\d]/g, '')) : km;
    return isNaN(numKm) ? null : numKm;
  };

  // Generate SEO-optimized title (following recommended structure)
  const generateTitle = () => {
    const marca = carItem.marca || '';
    const modelo = carItem.modelo || '';
    const ano = carItem.ano_modelo || carItem.ano_fabricacao || '';
    
    // Format: "Toyota Corolla 2022 | Seminovos em Campinas - Átria Veículos"
    let title = `${marca} ${modelo} ${ano}`.trim();
    if (title) {
      title += ' | Seminovos em Campinas - Átria Veículos';
    } else {
      title = 'Seminovos em Campinas - Átria Veículos';
    }
    
    return title;
  };

  // Generate SEO-optimized description (following recommended structure)
  const generateDescription = () => {
    const marca = carItem.marca || '';
    const modelo = carItem.modelo || '';
    const versao = carItem.versao || '';
    const ano = carItem.ano_modelo || carItem.ano_fabricacao || '';
    const km = formatMileage(carItem.quilometragem || carItem.km);
    const price = formatPrice(carItem.preco || carItem.valor);
    
    // Format: "Toyota Corolla Altis 2022, 45.000 km, R$ 92.900. Confira fotos, preço e condições na Átria Veículos em Campinas."
    let desc = `${marca} ${modelo} ${versao} ${ano}`.trim().replace(/\s+/g, ' ');
    
    if (km) desc += `, ${km.toLocaleString('pt-BR')} km`;
    if (price) desc += `, R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    desc += '. Confira fotos, preço e condições na Átria Veículos em Campinas.';
    
    return desc.length > 160 ? desc.substring(0, 157) + '...' : desc;
  };

  // Get primary image URL (1200x630 for OG)
  const getPrimaryImageUrl = () => {
    const photos = carItem.photos || carItem.imagens || [];
    if (photos.length > 0 && photos[0]) {
      // If using Cloudinary, ensure minimum 1200x630 size
      const imageUrl = photos[0];
      if (imageUrl.includes('cloudinary.com')) {
        return imageUrl.replace('/upload/', '/upload/c_fill,w_1200,h_630,q_auto,f_auto/');
      }
      return imageUrl;
    }
    return `${BASE_URL}/images/default-car-1200x630.jpg`;
  };

  // Get primary image as ImageObject for JSON-LD
  const getPrimaryImageObject = () => {
    const photos = carItem.photos || carItem.imagens || [];
    if (photos.length > 0 && photos[0]) {
      const imageUrl = photos[0];
      if (imageUrl.includes('cloudinary.com')) {
        const optimizedUrl = imageUrl.replace('/upload/', '/upload/c_fill,w_1200,h_630,q_auto,f_auto/');
        return {
          "@type": "ImageObject",
          "url": optimizedUrl,
          "width": 1200,
          "height": 630
        };
      }
      return {
        "@type": "ImageObject",
        "url": imageUrl
      };
    }
    return {
      "@type": "ImageObject",
      "url": `${BASE_URL}/images/default-car-1200x630.jpg`,
      "width": 1200,
      "height": 630
    };
  };

  const canonicalUrl = generateCanonicalUrl();
  const title = generateTitle();
  const description = generateDescription();
  const imageUrl = getPrimaryImageUrl();
  const price = formatPrice(carItem.preco || carItem.valor);
  const mileage = formatMileage(carItem.quilometragem || carItem.km);



  // JSON-LD Vehicle Schema (Enhanced)
  const vehicleSchema = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "inLanguage": "pt-BR",
    "name": `${carItem.marca || ''} ${carItem.modelo || ''} ${carItem.ano_modelo || carItem.ano_fabricacao || ''}`.trim(),
    "brand": carItem.marca || undefined,
    "model": carItem.modelo || undefined,
    "vehicleModelDate": carItem.ano_modelo || carItem.ano_fabricacao || undefined,
    "vehicleTransmission": carItem.cambio || undefined,
    "fuelType": carItem.combustivel || undefined,
    "bodyType": carItem.categoria || undefined,
    "url": canonicalUrl,
    "image": getPrimaryImageObject(),
    ...(carItem.cor && { "color": carItem.cor }),
    ...(carItem.versao && { "vehicleConfiguration": carItem.versao }),
    ...(mileage && {
      "mileageFromOdometer": {
        "@type": "QuantitativeValue",
        "value": mileage,
        "unitCode": "KMT"
      }
    }),
    ...(price && {
      "offers": {
        "@type": "Offer",
        "price": price.toFixed(2),
        "priceCurrency": "BRL",
        "availability": carItem.disponivel === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        "itemCondition": "https://schema.org/UsedCondition",
        "availableAtOrFrom": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Campinas",
            "addressRegion": "SP",
            "addressCountry": "BR"
          }
        }
      }
    }),
    "seller": {
      "@type": "AutoDealer",
      "name": "Átria Veículos",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Campinas",
        "addressRegion": "SP",
        "addressCountry": "BR"
      }
    }
  };

  // Note: BreadcrumbList JSON-LD is now managed by useBreadcrumbJsonLd hook
  // to ensure proper updates when navigating between vehicles

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`${carItem.marca || ''}, ${carItem.modelo || ''}, ${carItem.ano_modelo || carItem.ano_fabricacao || ''}, seminovos Campinas, Átria Veículos`} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Átria Veículos" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* OpenGraph Tags */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Átria Veículos" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Local SEO */}
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="Campinas" />
      <meta name="ICBM" content="-22.9056,-47.0608" />
      
      {/* Product specific */}
      {price && <meta property="product:price:amount" content={price} />}
      {price && <meta property="product:price:currency" content="BRL" />}
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(vehicleSchema, null, 0)}
      </script>
      {/* BreadcrumbList JSON-LD is managed by useBreadcrumbJsonLd hook for dynamic updates */}
    </Helmet>
  );
};

export default VehicleSEO;