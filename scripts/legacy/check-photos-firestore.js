import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBw3f7jKOk5ApzGsls45IQqhUCAA8jcFqQ",
  authDomain: "atria-veiculos.firebaseapp.com",
  projectId: "atria-veiculos",
  storageBucket: "atria-veiculos.firebasestorage.app",
  messagingSenderId: "644463113399",
  appId: "1:644463113399:web:b513aa46a87cf2e8e8e6a1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔍 VERIFICANDO CAMPO PHOTOS NO FIRESTORE');
console.log('========================================\n');

try {
  const vehiclesRef = collection(db, 'veiculos');
  const q = query(vehiclesRef, limit(10));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('❌ Nenhum veículo encontrado no Firestore!');
  } else {
    console.log(`📊 Analisando ${snapshot.size} veículos:\n`);
    
    let withPhotos = 0;
    let withImagens = 0;
    let withImagemPrincipal = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const hasPhotos = data.photos && Array.isArray(data.photos) && data.photos.length > 0;
      const hasImagens = data.imagens && Array.isArray(data.imagens) && data.imagens.length > 0;
      const hasImagemPrincipal = !!data.imagemPrincipal;
      
      if (hasPhotos) withPhotos++;
      if (hasImagens) withImagens++;
      if (hasImagemPrincipal) withImagemPrincipal++;
      
      console.log(`📋 Veículo: ${data.marca} ${data.modelo}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   photos: ${hasPhotos ? `✅ SIM (${data.photos.length} fotos)` : '❌ NÃO'}`);
      console.log(`   imagens: ${hasImagens ? `✅ SIM (${data.imagens.length} fotos)` : '❌ NÃO'}`);
      console.log(`   imagemPrincipal: ${hasImagemPrincipal ? '✅ SIM' : '❌ NÃO'}`);
      
      if (hasPhotos) {
        console.log(`   Primeira foto: ${data.photos[0].substring(0, 60)}...`);
      }
      
      console.log('');
    });
    
    console.log('\n📊 RESUMO:');
    console.log(`   Veículos com campo photos: ${withPhotos}/${snapshot.size}`);
    console.log(`   Veículos com campo imagens: ${withImagens}/${snapshot.size}`);
    console.log(`   Veículos com imagemPrincipal: ${withImagemPrincipal}/${snapshot.size}`);
  }
} catch (error) {
  console.error('❌ Erro ao acessar Firestore:', error.message);
  console.log('\n💡 Possíveis causas:');
  console.log('   1. Problemas de conexão com a internet');
  console.log('   2. Permissões do Firestore não configuradas');
  console.log('   3. Projeto Firebase incorreto');
}