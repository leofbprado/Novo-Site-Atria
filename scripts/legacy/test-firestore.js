import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

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

console.log('🔍 TESTANDO CONEXÃO COM FIREBASE');
console.log('=================================\n');

try {
  // Testar leitura
  console.log('📖 Tentando LER dados do Firestore...');
  const vehiclesRef = collection(db, 'veiculos');
  const q = query(vehiclesRef, limit(5));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('❌ Coleção vazia ou sem permissão de leitura');
  } else {
    console.log(`✅ LEITURA OK! ${snapshot.size} documentos encontrados`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.marca} ${data.modelo}`);
    });
  }
} catch (error) {
  console.error('❌ Erro na leitura:', error.code, error.message);
}

console.log('\n💡 DIAGNÓSTICO:');
console.log('   - Se leitura funciona mas escrita não: problema de quotas');
console.log('   - Se ambos falham: problema de autenticação/permissões');
console.log('   - Verifique o Firebase Console > Firestore > Usage');