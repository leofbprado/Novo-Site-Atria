/**
 * Upload das imagens de marcas para Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';

// Extrair todas as URLs únicas das marcas
const brandImages = [
  // Principais marcas
  { path: "/images/brands/audi.png", name: "audi" },
  { path: "/images/brands/volvo.png", name: "volvo" },
  { path: "/images/bmw-logo.png", name: "bmw" },
  { path: "/images/ford-logo.png", name: "ford" },
  { path: "/images/brands/mercedes-benz.png", name: "mercedes-benz" },
  { path: "/images/brands/peugeot.png", name: "peugeot" },
  { path: "/images/brands/volkswagen.png", name: "volkswagen" },
  { path: "/images/resource/brand-caoa-chery.png", name: "caoa-chery" },
  { path: "/images/resource/brand-fiat.png", name: "fiat" },
  { path: "/images/resource/brand-jeep.png", name: "jeep" },
  { path: "/images/resource/honda.png", name: "honda" },
  { path: "/images/resource/hyundai.png", name: "hyundai" },
  { path: "/images/resource/citroen.png", name: "citroen" },
  { path: "/images/brands/toyota.png", name: "toyota" },
  { path: "/images/brands/chevrolet.png", name: "chevrolet" },
  { path: "/images/brands/renault.png", name: "renault" },
  { path: "/images/brands/kia-new.png", name: "kia" },
  { path: "/images/jac-logo.png", name: "jac" },
  { path: "/images/lifan-logo.png", name: "lifan" },
  { path: "/images/brands/nissan.png", name: "nissan" },
  { path: "/images/brands/mitsubishi.png", name: "mitsubishi" },
  { path: "/images/brands/suzuki.png", name: "suzuki" },
  { path: "/images/brands/mini.png", name: "mini" }
];

async function uploadBrandImages() {
  console.log('🏷️ Fazendo upload das imagens de marcas para Cloudinary...\n');
  
  const results = [];
  
  for (let i = 0; i < brandImages.length; i++) {
    const brand = brandImages[i];
    
    try {
      console.log(`${i + 1}/${brandImages.length} - Upload: ${brand.name}`);
      console.log(`   Path local: ${brand.path}`);
      
      // Construir URL completa (assumindo site local ou produção)
      const fullUrl = `https://novo-site-atria.web.app${brand.path}`;
      
      const formData = new FormData();
      formData.append('file', fullUrl);
      formData.append('upload_preset', 'atria_upload');
      formData.append('public_id', brand.name);
      formData.append('folder', 'atria-veiculos/brands');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`   ❌ Erro: ${errorText}`);
        continue;
      }

      const result = await response.json();
      console.log(`   ✅ Sucesso: ${result.secure_url}`);
      console.log(`   📐 ${result.width}x${result.height} | ${Math.round(result.bytes / 1024)} KB\n`);
      
      results.push({
        originalPath: brand.path,
        cloudinaryUrl: result.secure_url,
        publicId: result.public_id,
        brandName: brand.name
      });
      
    } catch (error) {
      console.error(`   ❌ Erro no upload: ${error.message}\n`);
    }
    
    // Pausa entre uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 Upload de marcas concluído!');
  console.log(`✅ ${results.length} imagens enviadas com sucesso`);
  
  // Gerar mapeamento para atualizar o código
  console.log('\n📋 Mapeamento para atualizar o código:');
  results.forEach(result => {
    console.log(`"${result.originalPath}": "atria-veiculos/brands/${result.brandName}"`);
  });
  
  return results;
}

// Executar
uploadBrandImages();