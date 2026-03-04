/**
 * Script para enviar todas as imagens da pasta /public para Cloudinary
 * Ignora imagens da Galoco e organiza tudo na pasta atria-site
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Pasta base local
const publicFolder = path.join(__dirname, 'public');

// Estatísticas do upload
let stats = {
  total: 0,
  uploaded: 0,
  ignored: 0,
  errors: 0
};

// Função para fazer upload via REST API
const uploadToCloudinary = async (filePath, publicId) => {
  const formData = new FormData();
  
  // Ler arquivo como buffer e converter para blob
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);
  
  formData.append('file', blob);
  formData.append('upload_preset', 'atria_upload');
  formData.append('public_id', publicId);
  formData.append('folder', 'atria-site');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return await response.json();
};

// Função recursiva para varrer todas as imagens da pasta /public
const walkAndUpload = async (dir) => {
  console.log(`🔍 Varrendo pasta: ${path.relative(__dirname, dir)}`);
  
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(publicFolder, fullPath);

    // Ignora qualquer coisa com "galoco" no nome (case insensitive)
    if (fullPath.toLowerCase().includes('galoco')) {
      console.log(`❌ Ignorado (Galoco): ${relativePath}`);
      stats.ignored++;
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await walkAndUpload(fullPath); // recursivamente
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

      if (validExtensions.includes(ext)) {
        stats.total++;
        
        try {
          // Criar public_id baseado no caminho relativo
          const publicId = relativePath
            .replace(/\.[^/.]+$/, '') // remove extensão
            .replace(/\\/g, '/') // compatível com Windows
            .replace(/\s+/g, '-') // substitui espaços por hífens
            .toLowerCase();

          console.log(`📤 Enviando: ${relativePath}`);
          
          const result = await uploadToCloudinary(fullPath, publicId);

          console.log(`✅ Sucesso: ${result.secure_url}`);
          console.log(`   📐 ${result.width}x${result.height} | ${Math.round(result.bytes / 1024)} KB`);
          stats.uploaded++;
          
        } catch (error) {
          console.error(`🚨 Erro ao enviar ${relativePath}:`, error.message);
          stats.errors++;
        }
        
        // Pausa entre uploads para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
};

// Função principal
const main = async () => {
  console.log('🚀 Iniciando upload em massa para Cloudinary');
  console.log(`📁 Pasta base: ${publicFolder}`);
  console.log(`☁️  Cloud: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`📂 Destino: atria-site/`);
  console.log('🚫 Ignorando: arquivos com "galoco" no nome\n');

  // Verificar se a pasta public existe
  if (!fs.existsSync(publicFolder)) {
    console.error('❌ Pasta /public não encontrada!');
    return;
  }

  const startTime = Date.now();
  
  try {
    await walkAndUpload(publicFolder);
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log('\n🎉 Upload em massa concluído!');
  console.log('📊 Estatísticas:');
  console.log(`   📷 Total de imagens: ${stats.total}`);
  console.log(`   ✅ Enviadas: ${stats.uploaded}`);
  console.log(`   🚫 Ignoradas: ${stats.ignored}`);
  console.log(`   ❌ Erros: ${stats.errors}`);
  console.log(`   ⏱️  Tempo: ${duration}s`);
  
  if (stats.uploaded > 0) {
    console.log('\n🌐 Suas imagens estão agora disponíveis no Cloudinary!');
    console.log('📋 Acesse: https://console.cloudinary.com/console/media_library');
    console.log('📁 Pasta: atria-site/');
  }
};

// Executar
main().catch(console.error);