import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "novo-site-atria.firebaseapp.com",
  projectId: "novo-site-atria",
  storageBucket: "novo-site-atria.firebasestorage.app",
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearAllVehicles() {
  try {
    console.log('🧹 Removendo TODOS os veículos do sistema...');
    
    const vehiclesRef = collection(db, 'veiculos');
    const snapshot = await getDocs(vehiclesRef);
    
    console.log('📊 Total de veículos encontrados:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('✅ Base de dados já está vazia');
      return 0;
    }
    
    // Processar em lotes menores para evitar timeouts
    const batchSize = 100;
    let deletedCount = 0;
    const docs = [];
    
    snapshot.forEach((docSnapshot) => {
      docs.push(docSnapshot);
    });
    
    console.log('🗑️ Processando remoção em lotes de', batchSize, 'veículos...');
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });
      
      await batch.commit();
      deletedCount += batchDocs.length;
      
      console.log(`✅ Removidos ${deletedCount}/${docs.length} veículos...`);
      
      // Pequena pausa para evitar throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 Limpeza completa realizada!');
    console.log('📊 Total removido:', deletedCount, 'veículos');
    
    // Verificação final
    const finalSnapshot = await getDocs(vehiclesRef);
    console.log('🔍 Verificação final:', finalSnapshot.size, 'veículos restantes');
    
    return deletedCount;
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error.message);
    throw error;
  }
}

// Executar limpeza
clearAllVehicles()
  .then((deleted) => {
    console.log(`✅ Processo concluído! ${deleted} veículos removidos`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });