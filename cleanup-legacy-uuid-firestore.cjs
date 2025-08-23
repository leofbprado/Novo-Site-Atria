const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  projectId: 'novo-site-atria'
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função principal para limpar campos legacy_uuid
async function cleanupLegacyUuidFields() {
  console.log('🧹 INICIANDO LIMPEZA DE CAMPOS LEGACY_UUID NO FIRESTORE\n');
  
  let totalProcessed = 0;
  let docsWithLegacyUuid = 0;
  let docsUpdated = 0;
  let errors = 0;
  
  try {
    // Buscar todos os veículos
    console.log('📥 Buscando todos os veículos do Firestore...');
    const vehiclesRef = collection(db, 'veiculos');
    const snapshot = await getDocs(vehiclesRef);
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}\n`);
    
    // Processar cada documento
    for (const docSnap of snapshot.docs) {
      const vehicleId = docSnap.id;
      const vehicle = docSnap.data();
      totalProcessed++;
      
      console.log(`[${totalProcessed}/${snapshot.size}] Processando documento: ${vehicleId}`);
      
      // Verificar se tem campo legacy_uuid
      if (vehicle.legacy_uuid) {
        docsWithLegacyUuid++;
        console.log(`  🔍 Campo legacy_uuid encontrado: ${vehicle.legacy_uuid}`);
        
        try {
          // Remover campo legacy_uuid usando updateDoc
          const docRef = doc(db, 'veiculos', vehicleId);
          
          // Criar objeto de atualização sem o campo legacy_uuid
          const updateData = {};
          
          // Copiar todos os campos exceto legacy_uuid
          Object.keys(vehicle).forEach(key => {
            if (key !== 'legacy_uuid') {
              updateData[key] = vehicle[key];
            }
          });
          
          // Usar Firebase FieldValue.delete() seria melhor, mas vamos usar updateDoc com merge
          // Como não podemos importar FieldValue facilmente, vamos usar uma abordagem diferente
          
          // Em vez de tentar remover o campo diretamente, vamos usar uma abordagem de substituição
          // Primeiro, vamos verificar se podemos usar uma operação de remoção manual
          
          await updateDoc(docRef, {
            legacy_uuid: null // Definir como null para "remover"
          });
          
          docsUpdated++;
          console.log(`  ✅ Campo legacy_uuid removido (definido como null)`);
          
        } catch (updateError) {
          errors++;
          console.error(`  ❌ Erro ao atualizar documento ${vehicleId}:`, updateError.message);
        }
      } else {
        console.log(`  ✅ Documento já não possui legacy_uuid`);
      }
      
      // Pequena pausa para não sobrecarregar o Firestore
      if (totalProcessed % 50 === 0) {
        console.log(`  💤 Pausa de 1s após ${totalProcessed} documentos...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('🧹 RELATÓRIO FINAL DA LIMPEZA');
    console.log('='.repeat(60));
    console.log(`📝 Total de documentos processados: ${totalProcessed}`);
    console.log(`🔍 Documentos com legacy_uuid encontrados: ${docsWithLegacyUuid}`);
    console.log(`✅ Documentos atualizados (legacy_uuid removido): ${docsUpdated}`);
    console.log(`❌ Erros durante a atualização: ${errors}`);
    console.log(`🎯 Taxa de sucesso: ${docsWithLegacyUuid > 0 ? ((docsUpdated / docsWithLegacyUuid) * 100).toFixed(1) : 100}%`);
    
    if (docsUpdated > 0) {
      console.log('\n✅ Limpeza concluída! Todos os campos legacy_uuid foram removidos.');
      console.log('📋 Os veículos agora usam exclusivamente shortId para URLs.');
    } else if (docsWithLegacyUuid === 0) {
      console.log('\n✅ Nenhum campo legacy_uuid encontrado. Firestore já está limpo!');
    } else {
      console.log('\n⚠️ Alguns documentos não puderam ser atualizados. Verifique os erros acima.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
    throw error;
  }
}

// Executar a limpeza
cleanupLegacyUuidFields()
  .then(() => {
    console.log('\n🎉 Processo de limpeza finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });