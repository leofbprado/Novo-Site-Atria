import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBw3f7jKOk5ApzGsls45IQqhUCAA8jcFqQ",
  authDomain: "atria-veiculos.firebaseapp.com",
  projectId: "atria-veiculos",
  storageBucket: "atria-veiculos.firebasestorage.app",
  messagingSenderId: "863589438788",
  appId: "1:863589438788:web:63829cc90d759bc9abe1bc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkImportedPhotos() {
  try {
    console.log('🔍 VERIFICANDO FOTOS IMPORTADAS NO FIRESTORE');
    console.log('='.repeat(60));
    
    // Buscar primeiros 5 veículos
    const vehiclesSnapshot = await getDocs(query(collection(db, 'veiculos'), limit(5)));
    
    if (vehiclesSnapshot.empty) {
      console.log('❌ Nenhum veículo encontrado no Firestore');
      return;
    }
    
    console.log(`📊 Analisando ${vehiclesSnapshot.size} veículos importados...\n`);
    
    let totalVehicles = 0;
    let vehiclesWithPhotos = 0;
    let totalPhotos = 0;
    
    vehiclesSnapshot.forEach((doc, index) => {
      const vehicle = doc.data();
      totalVehicles++;
      
      console.log(`🚗 VEÍCULO ${index + 1}: ${vehicle.marca || 'N/A'} ${vehicle.modelo || 'N/A'}`);
      console.log(`   📄 Document ID: ${doc.id}`);
      console.log(`   🆔 Vehicle UUID: ${vehicle.vehicle_uuid || 'N/A'}`);
      
      // Verificar campo 'photos' (novo sistema)
      if (vehicle.photos && Array.isArray(vehicle.photos)) {
        console.log(`   📸 Campo 'photos': ${vehicle.photos.length} fotos`);
        vehicle.photos.slice(0, 3).forEach((photo, i) => {
          console.log(`     ${i + 1}. ${photo}`);
        });
        if (vehicle.photos.length > 3) {
          console.log(`     ... e mais ${vehicle.photos.length - 3} fotos`);
        }
        vehiclesWithPhotos++;
        totalPhotos += vehicle.photos.length;
      } else {
        console.log(`   📸 Campo 'photos': (vazio ou não é array)`);
      }
      
      // Verificar campo 'imagens' (sistema legado)
      if (vehicle.imagens && Array.isArray(vehicle.imagens)) {
        console.log(`   🖼️ Campo 'imagens': ${vehicle.imagens.length} fotos`);
      } else {
        console.log(`   🖼️ Campo 'imagens': (vazio ou não é array)`);
      }
      
      // Verificar foto destaque
      if (vehicle.foto_destaque) {
        console.log(`   ⭐ Foto destaque: ${vehicle.foto_destaque}`);
      }
      
      // Verificar tags de fotos
      if (vehicle.tags && typeof vehicle.tags === 'object') {
        const tagKeys = Object.keys(vehicle.tags);
        console.log(`   🏷️ Tags de fotos: ${tagKeys.length} fotos com tags`);
      }
      
      console.log(''); // Linha em branco
    });
    
    console.log('📊 RESUMO:');
    console.log(`   • Veículos analisados: ${totalVehicles}`);
    console.log(`   • Veículos com fotos: ${vehiclesWithPhotos}`);
    console.log(`   • Total de fotos: ${totalPhotos}`);
    console.log(`   • Média de fotos: ${totalPhotos > 0 ? (totalPhotos/vehiclesWithPhotos).toFixed(1) : 0}`);
    
    // Verificar estrutura completa de um veículo
    const firstVehicle = vehiclesSnapshot.docs[0].data();
    console.log('\n🔍 ESTRUTURA COMPLETA DO PRIMEIRO VEÍCULO:');
    console.log('-'.repeat(40));
    console.log('Campos relacionados a fotos encontrados:');
    
    const photoFields = ['photos', 'imagens', 'foto_destaque', 'fotos', 'imagem_capa', 'tags'];
    photoFields.forEach(field => {
      if (firstVehicle[field] !== undefined) {
        const value = firstVehicle[field];
        if (Array.isArray(value)) {
          console.log(`   ${field}: array com ${value.length} itens`);
        } else if (typeof value === 'object') {
          console.log(`   ${field}: object com ${Object.keys(value).length} chaves`);
        } else {
          console.log(`   ${field}: ${typeof value} - ${value}`);
        }
      } else {
        console.log(`   ${field}: (não existe)`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICAÇÃO CONCLUÍDA');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

checkImportedPhotos();