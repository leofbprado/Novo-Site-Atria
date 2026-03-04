/**
 * Script para fazer upload das imagens do Firebase para o Cloudinary
 * Execute: node upload-images-cloudinary.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDhM3jGKXhf6hGGr1HrjCn0Xz1vQ2oJ_Sw",
  authDomain: "novo-site-atria.firebaseapp.com",
  projectId: "novo-site-atria",
  storageBucket: "novo-site-atria.firebasestorage.app",
  messagingSenderId: "183421464486",
  appId: "1:183421464486:web:f3c8c89c8b5f2c9b8d8f1c"
};

// Configuração Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dyngqkiyl';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Upload de imagem para Cloudinary usando API autenticada
 */
const uploadToCloudinary = async (imageUrl, options = {}) => {
  try {
    const {
      folder = 'atria-veiculos/veiculos',
      publicId
    } = options;

    console.log(`📤 Fazendo upload: ${imageUrl}`);

    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('folder', folder);
    
    if (publicId) {
      formData.append('public_id', publicId);
    }

    // Gerar assinatura para upload autenticado
    const timestamp = Math.round(new Date().getTime() / 1000);
    formData.append('timestamp', timestamp);
    formData.append('api_key', CLOUDINARY_API_KEY);

    // Em um ambiente real, você precisaria gerar a assinatura
    // Para este exemplo, vamos usar upload preset não-autenticado
    formData.append('upload_preset', 'atria_upload');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro no upload:`, errorText);
      return null;
    }

    const result = await response.json();
    console.log(`✅ Upload concluído: ${result.secure_url}`);
    
    return result.secure_url;
  } catch (error) {
    console.error('❌ Erro no upload:', error.message);
    return null;
  }
};

/**
 * Processar veículos e fazer upload das imagens
 */
const processVehicleImages = async () => {
  try {
    console.log('🚗 Buscando veículos no Firebase...');
    
    const vehiclesRef = collection(db, 'vehicles');
    const snapshot = await getDocs(vehiclesRef);
    
    console.log(`📊 ${snapshot.size} veículos encontrados`);
    
    let processedCount = 0;
    let uploadedCount = 0;

    for (const docSnap of snapshot.docs) {
      const vehicle = docSnap.data();
      const vehicleId = docSnap.id;
      
      console.log(`\n🔧 Processando: ${vehicle.marca} ${vehicle.modelo} (${vehicle.placa || vehicleId})`);
      
      if (!vehicle.fotos || vehicle.fotos.length === 0) {
        console.log('⚠️ Sem fotos para processar');
        continue;
      }

      const cloudinaryPhotos = [];
      let hasNewUploads = false;

      for (let i = 0; i < vehicle.fotos.length; i++) {
        const foto = vehicle.fotos[i];
        
        // Se já está no Cloudinary, manter
        if (typeof foto === 'string' && foto.includes('cloudinary.com')) {
          cloudinaryPhotos.push(foto);
          continue;
        }

        // Fazer upload de imagens externas
        if (typeof foto === 'string' && (foto.startsWith('http') || foto.startsWith('https'))) {
          const publicId = `${vehicle.placa || vehicleId}-foto-${i + 1}`.replace(/[^a-zA-Z0-9-_]/g, '-');
          
          const cloudinaryUrl = await uploadToCloudinary(foto, {
            folder: 'atria-veiculos/veiculos',
            publicId: publicId
          });

          if (cloudinaryUrl) {
            cloudinaryPhotos.push(cloudinaryUrl);
            hasNewUploads = true;
            uploadedCount++;
          } else {
            cloudinaryPhotos.push(foto); // Manter original se upload falhar
          }

          // Pausa para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          cloudinaryPhotos.push(foto);
        }
      }

      // Atualizar Firestore se houve novos uploads
      if (hasNewUploads) {
        try {
          await updateDoc(doc(db, 'vehicles', vehicleId), {
            fotos: cloudinaryPhotos,
            cloudinary_updated_at: new Date()
          });
          console.log('✅ Firestore atualizado com URLs do Cloudinary');
        } catch (error) {
          console.error('❌ Erro ao atualizar Firestore:', error.message);
        }
      }

      processedCount++;
    }

    console.log(`\n🎉 Processamento concluído!`);
    console.log(`📊 Veículos processados: ${processedCount}`);
    console.log(`📤 Imagens enviadas para Cloudinary: ${uploadedCount}`);

  } catch (error) {
    console.error('❌ Erro no processamento:', error);
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Iniciando upload de imagens para Cloudinary...\n');
  
  if (!CLOUDINARY_API_KEY) {
    console.error('❌ CLOUDINARY_API_KEY não configurada nas variáveis de ambiente');
    process.exit(1);
  }
  
  processVehicleImages()
    .then(() => {
      console.log('\n✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro:', error);
      process.exit(1);
    });
}