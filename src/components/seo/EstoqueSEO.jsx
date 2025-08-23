import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * EstoqueSEO Component - SEO for inventory listing pages
 * Includes: ItemList schema, prev/next pagination links, and enhanced meta tags
 */
const EstoqueSEO = ({ 
  vehicles = [], 
  currentPage = 1, 
  totalPages = 1, 
  baseUrl = '/estoque',
  title = 'Estoque de Veículos',
  description = 'Encontre o veículo ideal em nosso estoque de seminovos'
}) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://www.atriaveiculos.com';
  
  // Generate URLs for pagination
  const generatePageUrl = (page) => {
    if (page <= 1) return `${BASE_URL}${baseUrl}`;
    return `${BASE_URL}${baseUrl}?page=${page}`;
  };

  // Generate canonical URL for current page
  const canonicalUrl = generatePageUrl(currentPage);

  // Generate vehicle canonical URL (matching VehicleSEO format)
  const generateVehicleCanonicalUrl = (vehicle) => {
    if (!vehicle || (!vehicle.vehicle_uuid && !vehicle.id)) return null;
    
    const identifier = vehicle.vehicle_uuid || vehicle.id;
    const marca = vehicle.marca || '';
    const modelo = vehicle.modelo || '';
    
    // Create slug: modelo-marca-id (same order as VehicleSEO)
    const slug = `${modelo}-${marca}-${identifier}`
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
    
    return `${BASE_URL}/campinas-sp/veiculo-seminovo-usado-atria/comprar-${slug}-usado-seminovo-campinas-sp`;
  };

  // ItemList Schema for inventory listing
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": vehicles.length,
    "itemListElement": vehicles.map((vehicle, index) => {
      const vehicleUrl = generateVehicleCanonicalUrl(vehicle);
      if (!vehicleUrl) return null;
      
      return {
        "@type": "ListItem",
        "position": index + 1,
        "url": vehicleUrl,
        "name": `${vehicle.marca || ''} ${vehicle.modelo || ''} ${vehicle.ano_modelo || vehicle.ano_fabricacao || ''}`.trim()
      };
    }).filter(Boolean) // Remove null items
  };

  // Generate enhanced title with pagination
  const enhancedTitle = currentPage > 1 
    ? `${title} - Página ${currentPage} | Átria Veículos Campinas`
    : `${title} | Átria Veículos Campinas`;

  // Generate enhanced description with pagination
  const enhancedDescription = currentPage > 1
    ? `${description} - Página ${currentPage} de ${totalPages}`
    : description;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{enhancedTitle}</title>
      <meta name="description" content={enhancedDescription} />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Pagination Links */}
      {currentPage > 1 && (
        <link rel="prev" href={generatePageUrl(currentPage - 1)} />
      )}
      {currentPage < totalPages && (
        <link rel="next" href={generatePageUrl(currentPage + 1)} />
      )}
      
      {/* OpenGraph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={enhancedTitle} />
      <meta property="og:description" content={enhancedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Átria Veículos" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={enhancedTitle} />
      <meta name="twitter:description" content={enhancedDescription} />
      
      {/* Local SEO */}
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="Campinas" />
      
      {/* ItemList Schema */}
      {vehicles.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema, null, 0)}
        </script>
      )}
    </Helmet>
  );
};

export default EstoqueSEO;