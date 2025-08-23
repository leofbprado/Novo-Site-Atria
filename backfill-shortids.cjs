const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const crypto = require('crypto');

// Configuração do Firebase
const firebaseConfig = {
  projectId: 'novo-site-atria'
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para gerar shortId de 5 caracteres
function generateShortId(vehicle) {
  // Base preferida: placa normalizada
  let base = '';
  
  if (vehicle.placa && vehicle.placa.trim()) {
    base = vehicle.placa
      .replace(/[^A-Z0-9]/gi, '') // Remove caracteres especiais
      .toUpperCase()
      .trim();
  }
  
  // Fallback: marca + modelo + ano
  if (!base || base.length < 3) {
    const marca = vehicle.marca || '';
    const modelo = vehicle.modelo || '';
    const ano = vehicle.ano_modelo || vehicle.ano_fabricacao || '';
    base = `${marca}${modelo}${ano}`.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }
  
  // Fallback final: ID do documento
  if (!base || base.length < 3) {
    base = vehicle.id || 'UNKNOWN';
  }
  
  // Gerar hash SHA1
  const hash = crypto.createHash('sha1').update(base).digest('hex');
  
  // Converter para base36 e pegar 5 caracteres
  const shortId = parseInt(hash.substring(0, 8), 16).toString(36).toUpperCase().substring(0, 5);
  
  return shortId.padEnd(5, '0'); // Garantir 5 caracteres
}

// Função para verificar se shortId é válido (5 caracteres)
function isValidShortId(shortId) {
  return shortId && typeof shortId === 'string' && shortId.length === 5;
}

// Função principal para fazer o backfill
async function backfillShortIds() {
  console.log('🔄 INICIANDO BACKFILL DE SHORTIDS DE 5 CARACTERES\n');
  
  let totalProcessed = 0;
  let alreadyValid = 0;
  let updatedFrom7To5 = 0;
  let addedNew = 0;
  let examples = [];
  
  try {
    // Buscar todos os veículos
    console.log('📥 Buscando todos os veículos do Firestore...');
    const vehiclesRef = collection(db, 'veiculos');
    const snapshot = await getDocs(vehiclesRef);
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}\n`);
    
    // Processar cada documento
    for (const docSnap of snapshot.docs) {
      const vehicleId = docSnap.id;
      const vehicle = { id: vehicleId, ...docSnap.data() };
      totalProcessed++;
      
      const currentShortId = vehicle.shortId;
      const placa = vehicle.placa || 'N/A';
      
      console.log(`[${totalProcessed}/${snapshot.size}] Processando: ${placa} (ID: ${vehicleId})`);
      
      // Verificar estado atual do shortId
      if (isValidShortId(currentShortId)) {
        // Já tem shortId válido de 5 caracteres
        alreadyValid++;
        console.log(`  ✅ Já possui shortId válido: ${currentShortId}`);
        continue;
      }
      
      // Gerar novo shortId de 5 caracteres
      const newShortId = generateShortId(vehicle);
      
      // Determinar tipo de atualização
      let updateType = '';
      if (currentShortId && currentShortId.length === 7) {
        updateType = '7→5';
        updatedFrom7To5++;
      } else {
        updateType = 'NOVO';
        addedNew++;
      }
      
      // Adicionar exemplo
      if (examples.length < 5) {
        examples.push({
          placa: placa,
          oldShortId: currentShortId || 'N/A',
          newShortId: newShortId,
          type: updateType
        });
      }
      
      try {
        // Atualizar documento no Firestore
        const docRef = doc(db, 'veiculos', vehicleId);
        await updateDoc(docRef, {
          shortId: newShortId,
          codigo: newShortId
        });
        
        console.log(`  ✅ Atualizado: ${currentShortId || 'N/A'} → ${newShortId} (${updateType})`);
        
      } catch (updateError) {
        console.error(`  ❌ Erro ao atualizar documento ${vehicleId}:`, updateError.message);
      }
      
      // Pequena pausa para não sobrecarregar o Firestore
      if (totalProcessed % 50 === 0) {
        console.log(`  💤 Pausa de 1s após ${totalProcessed} documentos...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DO BACKFILL');
    console.log('='.repeat(60));
    console.log(`📝 Total de documentos processados: ${totalProcessed}`);
    console.log(`✅ Já tinham shortId válido (5 chars): ${alreadyValid}`);
    console.log(`🔄 Atualizados de 7→5 caracteres: ${updatedFrom7To5}`);
    console.log(`🆕 Receberam shortId novo: ${addedNew}`);
    console.log(`💾 Total de atualizações feitas: ${updatedFrom7To5 + addedNew}`);
    
    console.log('\n📋 EXEMPLOS DE GERAÇÃO:');
    console.log('| Placa | ShortId Antigo | ShortId Novo | Tipo |');
    console.log('|-------|----------------|--------------|------|');
    
    examples.forEach(example => {
      console.log(`| ${example.placa.padEnd(8)} | ${example.oldShortId.padEnd(14)} | ${example.newShortId.padEnd(12)} | ${example.type} |`);
    });
    
    console.log('\n✅ Backfill concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o backfill:', error.message);
    throw error;
  }
}

// Executar o backfill
backfillShortIds()
  .then(() => {
    console.log('\n🎉 Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });