/**
 * Upload de imagens de exemplo para Cloudinary
 */

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';

// Imagens de exemplo do site
const sampleImages = [
  {
    url: 'https://i.postimg.cc/cL811HdX/freepik-the-style-is-candid-image-photography-with-natural-20062.jpg',
    publicId: 'depoimento-joao-carlos',
    folder: 'atria-veiculos/testimonials'
  },
  {
    url: 'https://i.postimg.cc/FKy9cBdS/freepik-the-style-is-candid-image-photography-with-natural-20063.jpg',
    publicId: 'depoimento-gabriel',
    folder: 'atria-veiculos/testimonials'
  },
  {
    url: 'https://lirp.cdn-website.com/6fcc5fff/dms3rep/multi/opt/WhatsApp+Image+2025-07-11+at+10.37.01-1920w.jpeg',
    publicId: 'blog-gps-perigoso',
    folder: 'atria-veiculos/blog'
  }
];

async function uploadSampleImages() {
  console.log('📤 Fazendo upload de imagens de exemplo para Cloudinary...\n');
  
  for (let i = 0; i < sampleImages.length; i++) {
    const image = sampleImages[i];
    
    try {
      console.log(`${i + 1}/${sampleImages.length} - Fazendo upload: ${image.publicId}`);
      console.log(`   URL: ${image.url}`);
      
      const formData = new FormData();
      formData.append('file', image.url);
      formData.append('upload_preset', 'atria_upload');
      formData.append('public_id', image.publicId);
      formData.append('folder', image.folder);

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
      
    } catch (error) {
      console.error(`   ❌ Erro no upload: ${error.message}\n`);
    }
    
    // Pausa entre uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎉 Upload de imagens de exemplo concluído!');
  console.log('📋 Verifique seu painel Cloudinary para ver as imagens nas pastas:');
  console.log('   - atria-veiculos/testimonials');
  console.log('   - atria-veiculos/blog');
}

// Executar
uploadSampleImages();