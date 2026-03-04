import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, orderBy, query, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFr1cGnBo4IRqRwzIJg7W6Zb-5w1-z_aI",
  authDomain: "atria-veiculos.firebaseapp.com",
  projectId: "atria-veiculos",
  storageBucket: "atria-veiculos.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkRecentLeads() {
  try {
    console.log('🔍 Verificando leads de simulação recentes...\n');
    
    const leadsCollection = collection(db, 'leads_simulacao');
    const leadsQuery = query(leadsCollection, orderBy('data_criacao', 'desc'), limit(5));
    const snapshot = await getDocs(leadsQuery);
    
    console.log(`📊 Total de leads de simulação encontrados: ${snapshot.size}\n`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`--- LEAD ${index + 1} ---`);
      console.log(`🆔 ID: ${doc.id}`);
      console.log(`👤 Nome: ${data.nome_cliente || 'N/A'}`);
      console.log(`📱 CPF: ${data.cpf_cliente || 'N/A'}`);
      console.log(`🚗 Veículo: ${data.veiculo_marca || 'N/A'} ${data.veiculo_modelo || 'N/A'} ${data.veiculo_ano || 'N/A'}`);
      console.log(`⏰ Data: ${data.data_criacao ? new Date(data.data_criacao).toLocaleString('pt-BR') : 'N/A'}`);
      console.log(`📨 UUID Simulação: ${data.simulacao_uuid || 'N/A'}`);
      console.log(`💰 Valor: R$ ${data.veiculo_valor ? (data.veiculo_valor / 100).toFixed(2) : 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar leads:', error);
  }
}

checkRecentLeads();