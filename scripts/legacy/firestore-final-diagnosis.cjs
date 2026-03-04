const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

// Importar função de geração de URL
const { buildVehicleCanonicalPath } = require('./src/utils/vehiclePaths.js');

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAOCr6v7Y5NNf3THSRlCIwzjX1JwGGWk84",
  authDomain: "novo-site-atria.firebaseapp.com",
  projectId: "novo-site-atria",
  storageBucket: "novo-site-atria.appspot.com",
  messagingSenderId: "1010043095439",
  appId: "1:1010043095439:web:48b0fb7c4ccb8f7d8ccbf6"
};

async function diagnoseFinalFirestoreState() {
  console.log('🔍 DIAGNÓSTICO PÓS-LIMPEZA FIRESTORE');
  console.log('=====================================\n');

  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Conectar na coleção veiculos
    console.log('📡 Conectando na coleção "veiculos"...');
    const vehiclesCollection = collection(db, 'veiculos');
    
    // Buscar todos os documentos para análise estatística
    const allSnapshot = await getDocs(vehiclesCollection);
    const allVehicles = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`✅ Total de veículos encontrados: ${allVehicles.length}\n`);

    // Selecionar 5 documentos aleatórios para análise detalhada
    const randomVehicles = [];
    const indices = new Set();
    
    while (randomVehicles.length < Math.min(5, allVehicles.length)) {
      const randomIndex = Math.floor(Math.random() * allVehicles.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        randomVehicles.push(allVehicles[randomIndex]);
      }
    }

    console.log('📋 ANÁLISE DE 5 DOCUMENTOS ALEATÓRIOS:');
    console.log('| Placa    | Marca     | Modelo     | Ano  | shortId | codigo | legacy_uuid | Path gerado | Status |');
    console.log('|----------|-----------|------------|------|---------|--------|-------------|-------------|--------|');
    
    const results = [];
    
    for (const vehicle of randomVehicles) {
      const placa = (vehicle.placa || 'N/A').substring(0, 8).padEnd(8);
      const marca = (vehicle.marca || 'N/A').substring(0, 9).padEnd(9);
      const modelo = (vehicle.modelo || 'N/A').substring(0, 10).padEnd(10);
      const ano = String(vehicle.ano_modelo || vehicle.ano_fabricacao || 'N/A').padEnd(4);
      const shortId = vehicle.shortId || 'N/A';
      const codigo = vehicle.codigo || 'N/A';
      const legacyUuid = vehicle.legacy_uuid ? 'SIM' : 'NÃO';
      
      // Gerar path usando a função utilitária
      let generatedPath = 'ERRO';
      let status = 'ERRO';
      
      try {
        const path = buildVehicleCanonicalPath(vehicle);
        if (path && path.startsWith('/carros/')) {
          generatedPath = path.length > 35 ? path.substring(0, 32) + '...' : path;
          status = 'OK';
        } else {
          generatedPath = 'FALHOU';
        }
      } catch (error) {
        generatedPath = 'ERRO';
        console.log(`⚠️ Erro ao gerar path para ${vehicle.placa}: ${error.message}`);
      }
      
      console.log(`| ${placa} | ${marca} | ${modelo} | ${ano} | ${shortId.padEnd(7)} | ${codigo.padEnd(6)} | ${legacyUuid.padEnd(11)} | ${generatedPath.padEnd(11)} | ${status.padEnd(6)} |`);
      
      results.push({
        vehicle,
        hasShortId: !!vehicle.shortId,
        hasLegacyUuid: !!vehicle.legacy_uuid,
        pathGenerated: status === 'OK',
        generatedPath: status === 'OK' ? buildVehicleCanonicalPath(vehicle) : null
      });
    }

    console.log('\n📊 ANÁLISE ESTATÍSTICA COMPLETA:');
    console.log('==================================');
    
    // Estatísticas gerais
    const vehiclesWithShortId = allVehicles.filter(v => v.shortId).length;
    const vehiclesWithLegacyUuid = allVehicles.filter(v => v.legacy_uuid).length;
    const vehiclesWithCodigo = allVehicles.filter(v => v.codigo).length;
    
    console.log(`📝 Total de documentos: ${allVehicles.length}`);
    console.log(`🆔 Documentos com shortId: ${vehiclesWithShortId}`);
    console.log(`🔗 Documentos ainda com legacy_uuid: ${vehiclesWithLegacyUuid}`);
    console.log(`📋 Documentos com codigo: ${vehiclesWithCodigo}`);
    console.log(`✅ Taxa de shortId: ${((vehiclesWithShortId / allVehicles.length) * 100).toFixed(1)}%`);
    
    if (vehiclesWithLegacyUuid > 0) {
      console.log(`⚠️ ATENÇÃO: ${vehiclesWithLegacyUuid} documentos ainda possuem legacy_uuid!`);
      
      // Mostrar exemplos dos que ainda têm legacy_uuid
      const withLegacyUuid = allVehicles.filter(v => v.legacy_uuid).slice(0, 3);
      console.log('\n🔍 Exemplos de documentos com legacy_uuid:');
      withLegacyUuid.forEach(v => {
        console.log(`  - ${v.marca} ${v.modelo} (${v.placa}): legacy_uuid = ${v.legacy_uuid}`);
      });
    } else {
      console.log('✅ PERFEITO: Nenhum documento possui legacy_uuid!');
    }

    console.log('\n🎯 EXEMPLOS DE URLS FINAIS GERADAS:');
    console.log('===================================');
    
    const successfulPaths = results.filter(r => r.pathGenerated).slice(0, 3);
    
    if (successfulPaths.length > 0) {
      successfulPaths.forEach((result, index) => {
        const v = result.vehicle;
        console.log(`${index + 1}. ${v.marca} ${v.modelo} ${v.ano_modelo || v.ano_fabricacao}`);
        console.log(`   URL: ${result.generatedPath}`);
        console.log(`   shortId: ${v.shortId}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma URL foi gerada com sucesso!');
    }

    // Verificação de integridade dos shortIds
    console.log('🔍 VERIFICAÇÃO DE INTEGRIDADE DOS SHORTIDS:');
    console.log('==========================================');
    
    const shortIdPattern = /^[A-Z0-9]{5}$/;
    const validShortIds = allVehicles.filter(v => v.shortId && shortIdPattern.test(v.shortId)).length;
    const invalidShortIds = allVehicles.filter(v => v.shortId && !shortIdPattern.test(v.shortId));
    
    console.log(`✅ ShortIds válidos (5 chars alfanuméricos): ${validShortIds}`);
    console.log(`❌ ShortIds inválidos: ${invalidShortIds.length}`);
    
    if (invalidShortIds.length > 0) {
      console.log('\n⚠️ Exemplos de shortIds inválidos:');
      invalidShortIds.slice(0, 3).forEach(v => {
        console.log(`  - ${v.placa}: "${v.shortId}" (${v.shortId?.length || 0} chars)`);
      });
    }

    // Status final
    console.log('\n🎯 STATUS FINAL DA MIGRAÇÃO:');
    console.log('============================');
    
    const migrationSuccess = vehiclesWithLegacyUuid === 0 && vehiclesWithShortId === allVehicles.length && validShortIds === vehiclesWithShortId;
    
    if (migrationSuccess) {
      console.log('✅ MIGRAÇÃO 100% CONCLUÍDA COM SUCESSO!');
      console.log('   • Todos os veículos possuem shortId válido');
      console.log('   • Nenhum documento possui legacy_uuid');
      console.log('   • Geração de URLs funcionando corretamente');
    } else {
      console.log('⚠️ MIGRAÇÃO PARCIAL - ATENÇÃO NECESSÁRIA:');
      if (vehiclesWithLegacyUuid > 0) {
        console.log(`   • ${vehiclesWithLegacyUuid} documentos ainda possuem legacy_uuid`);
      }
      if (vehiclesWithShortId < allVehicles.length) {
        console.log(`   • ${allVehicles.length - vehiclesWithShortId} documentos sem shortId`);
      }
      if (validShortIds < vehiclesWithShortId) {
        console.log(`   • ${vehiclesWithShortId - validShortIds} shortIds inválidos`);
      }
    }

    console.log('\n🏁 Diagnóstico finalizado!');
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
    process.exit(1);
  }
}

// Executar diagnóstico
diagnoseFinalFirestoreState();