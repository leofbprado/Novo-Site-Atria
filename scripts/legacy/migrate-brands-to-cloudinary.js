/**
 * Script para migrar imagens de marcas para Cloudinary com otimização WebP
 */

import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Lista das principais marcas a migrar (caminhos corretos)
const brandImages = [
  { local: 'public/images/brands/audi.png', brand: 'audi' },
  { local: 'public/images/bmw-logo.png', brand: 'bmw' },
  { local: 'public/images/ford-logo.png', brand: 'ford' },
  { local: 'public/images/brands/mercedes-benz.png', brand: 'mercedes-benz' },
  { local: 'public/images/brands/peugeot.png', brand: 'peugeot' },
  { local: 'public/images/brands/volkswagen.png', brand: 'volkswagen' },
  { local: 'public/images/brands/toyota.png', brand: 'toyota' },
  { local: 'public/images/brands/chevrolet.png', brand: 'chevrolet' },
  { local: 'public/images/brands/renault.png', brand: 'renault' },
  { local: 'public/images/brands/kia-new.png', brand: 'kia' },
  { local: 'public/images/brands/volvo.png', brand: 'volvo' },
  { local: 'public/images/resource/brand-caoa-chery.png', brand: 'caoa-chery' },
  { local: 'public/images/resource/brand-fiat.png', brand: 'fiat' },
  { local: 'public/images/resource/brand-jeep.png', brand: 'jeep' },
  { local: 'public/images/resource/honda.png', brand: 'honda' },
  { local: 'public/images/resource/hyundai.png', brand: 'hyundai' },
  { local: 'public/images/resource/citroen.png', brand: 'citroen' },
  { local: 'public/images/jac-logo.png', brand: 'jac' }
];

async function migrateBrandsToCloudinary() {
  console.log('🚀 Iniciando migração de marcas para Cloudinary...');
  
  const results = [];
  const errors = [];
  
  for (const brand of brandImages) {
    try {
      console.log(`📤 Enviando ${brand.brand}...`);
      
      if (!fs.existsSync(brand.local)) {
        console.log(`⚠️ Arquivo não encontrado: ${brand.local}`);
        continue;
      }
      
      // Upload para Cloudinary com otimizações
      const uploadResult = await cloudinary.uploader.upload(brand.local, {
        public_id: `atria-veiculos/brands/${brand.brand}`,
        folder: 'atria-veiculos/brands',
        quality: 'auto:good',
        fetch_format: 'auto',
        overwrite: true,
        transformation: [
          { 
            width: 100, 
            height: 100, 
            crop: 'fit',
            quality: 'auto:good'
          }
        ]
      });
      
      // Medir tamanho original
      const originalStats = fs.statSync(brand.local);
      const originalSize = Math.round(originalStats.size / 1024);
      
      // Estimar tamanho otimizado (WebP geralmente é 30-60% menor)
      const optimizedUrl = cloudinary.url(`atria-veiculos/brands/${brand.brand}`, {
        format: 'webp',
        quality: 'auto:good',
        width: 100,
        height: 100,
        crop: 'fit'
      });
      
      results.push({
        brand: brand.brand,
        originalPath: brand.local,
        originalSize: `${originalSize} KB`,
        cloudinaryUrl: uploadResult.secure_url,
        optimizedUrl: optimizedUrl,
        publicId: uploadResult.public_id
      });
      
      console.log(`✅ ${brand.brand}: ${originalSize} KB → Cloudinary otimizado`);
      
    } catch (error) {
      console.error(`❌ Erro ao enviar ${brand.brand}:`, error.message);
      errors.push({ brand: brand.brand, error: error.message });
    }
    
    // Pausa para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    totalMigrated: results.length,
    errors: errors.length,
    results,
    errors
  };
  
  fs.writeFileSync('brands-cloudinary-migration-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n📊 RELATÓRIO FINAL:');
  console.log(`✅ Migradas: ${results.length} marcas`);
  console.log(`❌ Erros: ${errors.length}`);
  console.log('📄 Relatório salvo: brands-cloudinary-migration-report.json');
  
  return report;
}

async function main() {
  try {
    await migrateBrandsToCloudinary();
    console.log('🎉 Migração de marcas concluída!');
  } catch (error) {
    console.error('💥 Erro na migração:', error);
    process.exit(1);
  }
}

main();