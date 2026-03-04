import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAwg6LfghZLr4bTxNLNL3mXQtPP6hpJp8o",
  authDomain: "atria-veiculos-2025.firebaseapp.com",
  projectId: "atria-veiculos-2025",
  storageBucket: "atria-veiculos-2025.firebasestorage.app",
  messagingSenderId: "318792265430",
  appId: "1:318792265430:web:d7b52dcd4c6e3c46c2e6c4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugBroncoData() {
  console.log('🔍 Investigando dados da Ford Bronco...\n');
  
  try {
    const vehiclesRef = collection(db, 'veiculos');
    const snapshot = await getDocs(vehiclesRef);
    
    const broncoVehicles = [];
    const allKeys = new Set();
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const key = `${data.placa}_${data.modelo}_${data.ano}`.toLowerCase();
      allKeys.add(key);
      
      if (data.modelo && data.modelo.toLowerCase().includes('bronco')) {
        broncoVehicles.push({
          id: doc.id,
          placa: data.placa,
          marca: data.marca,
          modelo: data.modelo,
          versao: data.versao,
          ano: data.ano,
          ano_modelo: data.ano_modelo,
          preco: data.preco,
          chave_gerada: key,
          data_cadastro: data.data_cadastro,
          data_atualizacao: data.data_atualizacao
        });
      }
    });
    
    console.log(`📊 Total de veículos no banco: ${snapshot.size}`);
    console.log(`🚙 Ford Broncos encontrados: ${broncoVehicles.length}\n`);
    
    if (broncoVehicles.length > 0) {
      console.log('🔍 DETALHES DOS BRONCOS:');
      broncoVehicles.forEach((bronco, index) => {
        console.log(`\n--- BRONCO ${index + 1} ---`);
        console.log(`ID Firestore: ${bronco.id}`);
        console.log(`Placa: "${bronco.placa}"`);
        console.log(`Marca: "${bronco.marca}"`);
        console.log(`Modelo: "${bronco.modelo}"`);
        console.log(`Versão: "${bronco.versao}"`);
        console.log(`Ano: "${bronco.ano}" (tipo: ${typeof bronco.ano})`);
        console.log(`Ano Modelo: "${bronco.ano_modelo}" (tipo: ${typeof bronco.ano_modelo})`);
        console.log(`Preço: R$ ${bronco.preco}`);
        console.log(`Chave gerada: "${bronco.chave_gerada}"`);
        console.log(`Data cadastro: ${bronco.data_cadastro}`);
        console.log(`Data atualização: ${bronco.data_atualizacao}`);
      });
      
      // Detectar duplicatas
      const chaves = broncoVehicles.map(b => b.chave_gerada);
      const duplicatas = chaves.filter((chave, index) => chaves.indexOf(chave) !== index);
      
      if (duplicatas.length > 0) {
        console.log('\n❌ DUPLICATAS DETECTADAS:');
        duplicatas.forEach(chave => {
          console.log(`Chave duplicada: "${chave}"`);
        });
      } else {
        console.log('\n✅ Nenhuma duplicata detectada nas chaves atuais');
      }
    } else {
      console.log('❌ Nenhum Ford Bronco encontrado no banco de dados');
    }
    
    // Mostrar algumas chaves de exemplo para debug
    console.log('\n📋 Primeiras 10 chaves no sistema:');
    Array.from(allKeys).slice(0, 10).forEach(key => {
      console.log(`  "${key}"`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao debugar:', error);
  }
}

debugBroncoData();