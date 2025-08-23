const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDocs, updateDoc } = require('firebase/firestore');

// Configuração Firebase - novo-site-atria
const firebaseConfig = {
  apiKey: "AIzaSyCng1gtGC16C8NoYoc-B1fSk22q_bkhv0c",
  authDomain: "novo-site-atria.firebaseapp.com",
  projectId: "novo-site-atria",
  storageBucket: "novo-site-atria.firebasestorage.app",
  messagingSenderId: "1073104197604",
  appId: "1:1073104197604:web:67ee785a7a8f54ca0319f1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para processar preço brasileiro
function processPrice(priceStr) {
  if (!priceStr) return 0;
  const cleanPrice = priceStr.toString()
    .replace(/R\$\s*/, '')  // Remove R$
    .replace(/\./g, '')     // Remove pontos (milhares)
    .replace(',', '.')      // Substitui vírgula por ponto decimal
    .trim();
  return parseFloat(cleanPrice) || 0;
}

async function fixVehiclePrices() {
  try {
    console.log('🔧 Iniciando correção dos preços dos veículos...');
    
    // 1. Ler planilha Excel
    const workbook = XLSX.readFile('./attached_assets/estoque_atria_com_opcionais_1753793366979.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const spreadsheetData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 ${spreadsheetData.length} veículos encontrados na planilha`);
    
    // 2. Buscar veículos no Firestore
    const vehiclesSnapshot = await getDocs(collection(db, 'veiculos'));
    const firestoreVehicles = [];
    
    vehiclesSnapshot.forEach(doc => {
      firestoreVehicles.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`🗄️ ${firestoreVehicles.length} veículos encontrados no Firestore`);
    
    // 3. Analisar preços incorretos
    const vehiclesWithZeroPrice = firestoreVehicles.filter(v => !v.preco || v.preco === 0);
    console.log(`⚠️ ${vehiclesWithZeroPrice.length} veículos com preço = 0 ou inválido`);
    
    // 4. Criar mapa de veículos da planilha por placa
    const spreadsheetMap = {};
    spreadsheetData.forEach(row => {
      const placa = (row.Placa || '').toString().trim();
      if (placa) {
        spreadsheetMap[placa] = row;
      }
    });
    
    // 5. Corrigir preços
    let fixedCount = 0;
    let notFoundCount = 0;
    
    for (const vehicle of vehiclesWithZeroPrice) {
      const placa = vehicle.placa;
      const spreadsheetRow = spreadsheetMap[placa];
      
      if (spreadsheetRow && spreadsheetRow.Preço) {
        const newPrice = processPrice(spreadsheetRow.Preço);
        
        if (newPrice > 0) {
          console.log(`🔧 Corrigindo: ${placa} - ${vehicle.marca} ${vehicle.modelo} - R$ ${newPrice}`);
          
          await updateDoc(doc(db, 'veiculos', vehicle.id), {
            preco: newPrice
          });
          
          fixedCount++;
        }
      } else {
        console.log(`❌ Não encontrado na planilha: ${placa} - ${vehicle.marca} ${vehicle.modelo}`);
        notFoundCount++;
      }
    }
    
    console.log('');
    console.log('📊 RESUMO DA CORREÇÃO:');
    console.log(`✅ Preços corrigidos: ${fixedCount}`);
    console.log(`❌ Não encontrados na planilha: ${notFoundCount}`);
    console.log(`✅ Correção concluída!`);
    
  } catch (error) {
    console.error('❌ Erro na correção dos preços:', error);
  }
}

fixVehiclePrices();