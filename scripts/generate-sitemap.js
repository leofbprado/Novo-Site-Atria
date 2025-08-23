/**
 * Generate Sitemap and Robots.txt for Átria Veículos
 * Generates /sitemap.xml and /robots.txt for production builds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = process.env.VITE_BASE_URL || 'https://www.atriaveiculos.com';
const outputDir = path.join(__dirname, '../dist');
const now = new Date().toISOString();

// Static pages configuration
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/estoque', priority: '0.7', changefreq: 'daily' },
  { url: '/sobre', priority: '0.6', changefreq: 'monthly' },
  { url: '/contato', priority: '0.6', changefreq: 'monthly' },
  { url: '/vender-meu-carro', priority: '0.7', changefreq: 'monthly' },
  { url: '/financiamento', priority: '0.7', changefreq: 'monthly' },
  { url: '/blog', priority: '0.6', changefreq: 'weekly' }
];

/**
 * Generate clean slug for vehicle
 */
function generateVehicleSlug(vehicle) {
  const marca = vehicle.marca || '';
  const modelo = vehicle.modelo || '';
  const ano = vehicle.ano_modelo || vehicle.ano_fabricacao || '';
  const id = vehicle.vehicle_uuid || vehicle.id || '';
  
  return `${marca}-${modelo}-${ano}-${id}`
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
}

/**
 * Get vehicles from Firebase (if available) or mock data for build
 */
async function getVehicles() {
  try {
    // In build environment, we'll use a simpler approach
    // In production, this could fetch from Firebase or an API
    return [
      // Example vehicle for sitemap generation
      {
        id: 'example-vehicle',
        vehicle_uuid: 'example-uuid',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano_modelo: '2020',
        updated_at: now
      }
    ];
  } catch (error) {
    console.warn('Could not fetch vehicles for sitemap:', error.message);
    return [];
  }
}

/**
 * Generate sitemap.xml content
 */
function generateSitemap(pages, vehicles) {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages
  for (const page of pages) {
    sitemap += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  // Add vehicle pages with canonical format
  for (const vehicle of vehicles) {
    const identifier = vehicle.vehicle_uuid || vehicle.id || '';
    const marca = vehicle.marca || '';
    const modelo = vehicle.modelo || '';
    
    // Create canonical slug: modelo-marca-id (matching VehicleSEO format)
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
    
    const lastmod = vehicle.updated_at || now;
    
    sitemap += `
  <url>
    <loc>${BASE_URL}/campinas-sp/veiculo-seminovo-usado-atria/comprar-${slug}-usado-seminovo-campinas-sp</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  sitemap += `
</urlset>`;

  return sitemap;
}

/**
 * Generate robots.txt content
 */
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Block admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /*?*

# Block development files
Disallow: /*.js$
Disallow: /*.css$
Disallow: /*.json$

# Allow specific file types
Allow: /images/
Allow: /icons/
Allow: /favicon.ico

# Crawl delay
Crawl-delay: 1

# Sitemap location
Sitemap: ${BASE_URL}/sitemap.xml`;
}

/**
 * Main function to generate sitemap and robots.txt
 */
async function generateSEOFiles() {
  try {
    console.log('🗂️ Generating sitemap and robots.txt...');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get vehicles data
    const vehicles = await getVehicles();
    console.log(`📋 Found ${vehicles.length} vehicles for sitemap`);

    // Generate sitemap
    const sitemapContent = generateSitemap(staticPages, vehicles);
    const sitemapPath = path.join(outputDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
    console.log(`✅ Generated sitemap.xml with ${staticPages.length + vehicles.length} URLs`);

    // Generate robots.txt
    const robotsContent = generateRobotsTxt();
    const robotsPath = path.join(outputDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent, 'utf8');
    console.log('✅ Generated robots.txt');

    console.log('🎯 SEO files generated successfully!');

  } catch (error) {
    console.error('❌ Error generating SEO files:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSEOFiles();
}

export { generateSEOFiles, generateVehicleSlug };