import XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import crypto from 'crypto';

// Configuração Firebase
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

/**
 * ESTRATÉGIA INTELIGENTE DE DETECÇÃO DE DUPLICATAS
 * 
 * Sem ID único na planilha, usamos uma combinação de campos para detectar duplicatas:
 * 
 * 1. NÍVEL 1 - IDENTIFICAÇÃO EXATA (100% match):
 *    - Placa (se disponível e não vazia)
 *    - Marca + Modelo + Ano + KM (match exato em todos os 4 campos)
 * 
 * 2. NÍVEL 2 - IDENTIFICAÇÃO PROVÁVEL (95% match):
 *    - Marca + Modelo + Ano + Cor + Preço (diferença de preço < 5%)
 * 
 * 3. NÍVEL 3 - IDENTIFICAÇÃO SUSPEITA (85% match):
 *    - Marca + Modelo + Ano + primeira foto igual
 * 
 * 4. NÍVEL 4 - IDENTIFICAÇÃO POR CONTEXTO (80% match):
 *    - Marca + Modelo + Versão + Ano (mesmo se KM diferir um pouco)
 */

// Função para normalizar strings para comparação
const normalizeString = (str) => {
  if (!str) return '';
  return str.toString().toLowerCase().trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
};

// Função para gerar hash de identificação baseado em múltiplos campos
const generateVehicleHash = (vehicle) => {
  const hashComponents = [
    normalizeString(vehicle.marca),
    normalizeString(vehicle.modelo),
    normalizeString(vehicle.versao),
    vehicle.ano,
    vehicle.km
  ].filter(Boolean).join('|');
  
  return crypto.createHash('md5').update(hashComponents).digest('hex');
};

// Função para detectar duplicatas com múltiplos níveis
const findDuplicates = async (newVehicle) => {
  console.log(`🔍 Verificando duplicatas para: ${newVehicle.marca} ${newVehicle.modelo} ${newVehicle.ano}`);
  
  const duplicates = {
    exact: [],      // 100% match
    probable: [],   // 95% match  
    suspicious: [], // 85% match
    contextual: []  // 80% match
  };

  // Buscar todos os veículos existentes da mesma marca e modelo
  const vehiclesRef = collection(db, 'veiculos');
  let searchQuery = query(vehiclesRef, 
    where('marca', '==', newVehicle.marca),
    where('modelo', '==', newVehicle.modelo)
  );
  
  const snapshot = await getDocs(searchQuery);
  const existingVehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  console.log(`📊 Encontrados ${existingVehicles.length} veículos da mesma marca/modelo para comparar`);

  for (const existing of existingVehicles) {
    let matchLevel = 0;
    let matchReasons = [];

    // NÍVEL 1 - MATCH EXATO POR PLACA
    if (newVehicle.placa && existing.placa && 
        normalizeString(newVehicle.placa) === normalizeString(existing.placa)) {
      duplicates.exact.push({
        vehicle: existing,
        confidence: 100,
        reason: 'Placa idêntica',
        matchType: 'placa'
      });
      continue;
    }

    // NÍVEL 1 - MATCH EXATO POR MÚLTIPLOS CAMPOS
    if (existing.ano === newVehicle.ano && existing.km === newVehicle.km) {
      duplicates.exact.push({
        vehicle: existing,
        confidence: 100,
        reason: 'Marca + Modelo + Ano + KM idênticos',
        matchType: 'complete'
      });
      continue;
    }

    // NÍVEL 2 - MATCH PROVÁVEL POR PREÇO E CARACTERÍSTICAS
    if (existing.ano === newVehicle.ano && 
        normalizeString(existing.cor) === normalizeString(newVehicle.cor)) {
      
      const priceDiff = Math.abs(existing.preco - newVehicle.preco) / Math.max(existing.preco, newVehicle.preco);
      if (priceDiff < 0.05) { // Diferença de preço menor que 5%
        duplicates.probable.push({
          vehicle: existing,
          confidence: 95,
          reason: `Marca + Modelo + Ano + Cor + Preço similar (${(priceDiff * 100).toFixed(1)}% diferença)`,
          matchType: 'price_characteristics'
        });
        continue;
      }
    }

    // NÍVEL 3 - MATCH SUSPEITO POR FOTO
    if (existing.ano === newVehicle.ano && 
        existing.imagemPrincipal && newVehicle.imagemPrincipal &&
        existing.imagemPrincipal === newVehicle.imagemPrincipal) {
      duplicates.suspicious.push({
        vehicle: existing,
        confidence: 85,
        reason: 'Marca + Modelo + Ano + Foto principal idêntica',
        matchType: 'photo'
      });
      continue;
    }

    // NÍVEL 4 - MATCH CONTEXTUAL POR VERSÃO
    if (existing.ano === newVehicle.ano && 
        normalizeString(existing.versao) === normalizeString(newVehicle.versao)) {
      
      const kmDiff = Math.abs(existing.km - newVehicle.km);
      if (kmDiff < 10000) { // Diferença de KM menor que 10.000
        duplicates.contextual.push({
          vehicle: existing,
          confidence: 80,
          reason: `Marca + Modelo + Versão + Ano + KM similar (${kmDiff}km diferença)`,
          matchType: 'contextual'
        });
      }
    }
  }

  return duplicates;
};

// Função principal de importação inteligente
const smartImport = async (filename) => {
  console.log('🚀 Iniciando importação inteligente com detecção de duplicatas...');
  
  // Ler planilha
  const data = readFileSync(filename);
  const workbook = XLSX.read(data, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📊 Processando ${jsonData.length} veículos da planilha...`);

  const results = {
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    duplicatesFound: {
      exact: 0,
      probable: 0,
      suspicious: 0,
      contextual: 0
    }
  };

  for (let i = 0; i < jsonData.length; i++) {
    try {
      const row = jsonData[i];
      console.log(`\n📋 Processando veículo ${i + 1}/${jsonData.length}: ${row.Marca} ${row.Modelo}`);

      // Processar dados do veículo (reutilizar lógica existente)
      const newVehicle = await processVehicleData(row);
      
      // Detectar duplicatas
      const duplicates = await findDuplicates(newVehicle);
      
      // Decidir ação baseada no nível de duplicata encontrado
      if (duplicates.exact.length > 0) {
        const duplicate = duplicates.exact[0];
        console.log(`🔄 ATUALIZANDO: ${duplicate.reason}`);
        
        // Atualizar veículo existente mantendo o UUID original
        await setDoc(doc(db, 'veiculos', duplicate.vehicle.id), {
          ...newVehicle,
          vehicle_uuid: duplicate.vehicle.vehicle_uuid, // Manter UUID original
          data_atualizacao: new Date(),
          historico_atualizacoes: [
            ...(duplicate.vehicle.historico_atualizacoes || []),
            {
              data: new Date(),
              tipo: 'atualizacao_planilha',
              motivo: duplicate.reason
            }
          ]
        });
        
        results.updated++;
        results.duplicatesFound.exact++;
        
      } else if (duplicates.probable.length > 0) {
        const duplicate = duplicates.probable[0];
        console.log(`⚠️  DUPLICATA PROVÁVEL: ${duplicate.reason}`);
        console.log(`   Escolha: [A]tualizar, [P]ular, [N]ovo?`);
        
        // Por segurança, vamos pular duplicatas prováveis e registrar para revisão manual
        console.log(`⏭️  PULANDO: Duplicata provável detectada`);
        results.skipped++;
        results.duplicatesFound.probable++;
        
      } else if (duplicates.suspicious.length > 0 || duplicates.contextual.length > 0) {
        const duplicate = duplicates.suspicious[0] || duplicates.contextual[0];
        console.log(`🤔 DUPLICATA SUSPEITA: ${duplicate.reason}`);
        console.log(`⏭️  IMPORTANDO COMO NOVO: Confiança insuficiente para merge automático`);
        
        // Importar como novo mas marcar para revisão
        await setDoc(doc(db, 'veiculos', newVehicle.vehicle_uuid), {
          ...newVehicle,
          status_duplicata: 'suspeita',
          duplicata_detectada: duplicate,
          requer_revisao_manual: true
        });
        
        results.imported++;
        if (duplicates.suspicious.length > 0) results.duplicatesFound.suspicious++;
        if (duplicates.contextual.length > 0) results.duplicatesFound.contextual++;
        
      } else {
        console.log(`✅ NOVO VEÍCULO: Importando normalmente`);
        
        // Veículo completamente novo
        await setDoc(doc(db, 'veiculos', newVehicle.vehicle_uuid), newVehicle);
        results.imported++;
      }

    } catch (error) {
      console.error(`❌ Erro ao processar veículo ${i + 1}:`, error);
      results.errors++;
    }
  }

  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DA IMPORTAÇÃO');
  console.log('=====================================');
  console.log(`✅ Veículos importados: ${results.imported}`);
  console.log(`🔄 Veículos atualizados: ${results.updated}`);
  console.log(`⏭️  Veículos pulados: ${results.skipped}`);
  console.log(`❌ Erros: ${results.errors}`);
  console.log('\n🔍 DUPLICATAS DETECTADAS:');
  console.log(`• Exatas (100%): ${results.duplicatesFound.exact}`);
  console.log(`• Prováveis (95%): ${results.duplicatesFound.probable}`);
  console.log(`• Suspeitas (85%): ${results.duplicatesFound.suspicious}`);
  console.log(`• Contextuais (80%): ${results.duplicatesFound.contextual}`);
  
  return results;
};

// Função para processar dados do veículo (reutilizar do código existente)
const processVehicleData = async (row) => {
  // Processar opcionais
  const processOptionals = () => {
    const optionals = row.Opcionais || '';
    if (!optionals || !optionals.trim()) return {};
    
    const items = optionals.split(',').map(item => item.trim()).filter(item => item);
    
    const equipamentos = {
      INTERIOR: [],
      EXTERIOR: [],
      SEGURANÇA: [],
      CONFORTO: []
    };
    
    items.forEach(item => {
      const itemLower = item.toLowerCase();
      
      if (itemLower.includes('bancos') || itemLower.includes('central multimídia') || 
          itemLower.includes('cd player') || itemLower.includes('usb') ||
          itemLower.includes('bluetooth')) {
        equipamentos.INTERIOR.push(item);
      }
      else if (itemLower.includes('rodas') || itemLower.includes('teto solar') ||
               itemLower.includes('limpador') || itemLower.includes('retrovisores')) {
        equipamentos.EXTERIOR.push(item);
      }
      else if (itemLower.includes('alarme') || itemLower.includes('freios') ||
               itemLower.includes('abs') || itemLower.includes('airbag') ||
               itemLower.includes('câmera') || itemLower.includes('sensor')) {
        equipamentos.SEGURANÇA.push(item);
      }
      else if (itemLower.includes('ar condicionado') || itemLower.includes('direção') ||
               itemLower.includes('vidros') || itemLower.includes('travas')) {
        equipamentos.CONFORTO.push(item);
      }
      else {
        equipamentos.CONFORTO.push(item);
      }
    });
    
    return equipamentos;
  };

  // Processar fotos
  const processPhotos = () => {
    const photos = [];
    
    if (row['Imagem Principal']) {
      photos.push(row['Imagem Principal'].trim());
    }
    
    if (row.Fotos) {
      const additionalPhotos = row.Fotos.split(';')
        .map(url => url.trim())
        .filter(url => url && url !== row['Imagem Principal']);
      photos.push(...additionalPhotos);
    }
    
    return photos.filter(url => url);
  };

  // Processar preço
  const processPrice = (priceStr) => {
    if (!priceStr) return 0;
    const cleanPrice = priceStr.toString()
      .replace(/[R$]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
    return parseFloat(cleanPrice) || 0;
  };

  // Determinar tipo de veículo
  const determineVehicleType = (modelo) => {
    if (!modelo) return 'Outros';
    const modeloLower = modelo.toLowerCase();
    
    if (modeloLower.includes('suv') || modeloLower.includes('renegade') || 
        modeloLower.includes('compass') || modeloLower.includes('hr-v')) {
      return 'SUV';
    }
    
    if (modeloLower.includes('pick') || modeloLower.includes('ranger') ||
        modeloLower.includes('hilux') || modeloLower.includes('saveiro')) {
      return 'Pick-up';
    }
    
    if (modeloLower.includes('sedan') || modeloLower.includes('city') ||
        modeloLower.includes('civic') || modeloLower.includes('corolla')) {
      return 'Sedan';
    }
    
    return 'Hatch';
  };

  const vehicleUUID = crypto.randomUUID();
  const photosArray = processPhotos();
  const imagemPrincipal = row['Imagem Principal'] ? row['Imagem Principal'].trim() : null;
  
  return {
    vehicle_uuid: vehicleUUID,
    timestamp: Date.now(),
    data_importacao: new Date(),
    
    // Dados básicos
    marca: row.Marca || '',
    modelo: row.Modelo || '',
    versao: row.Versão || row.Versao || '',
    ano: parseInt(row['Ano Modelo']) || new Date().getFullYear(),
    ano_fabricacao: parseInt(row['Ano Fabricação']) || parseInt(row['Ano Modelo']) || new Date().getFullYear(),
    combustivel: row.Combustível || row.Combustivel || 'Flex',
    km: parseInt(row.KM) || 0,
    cor: row.Cor || 'Não informado',
    cambio: row.Câmbio || row.Cambio || 'Manual',
    portas: parseInt(row.Portas) || 4,
    preco: processPrice(row.Preço || row.Preco),
    placa: row.Placa || '',
    
    // Fotos
    photos: photosArray,
    imagens: photosArray,
    imagemPrincipal: imagemPrincipal,
    
    // Informações adicionais
    informacoes: row.Descrição || row.Descricao || '',
    ativo: true,
    mais_vendidos: false,
    equipamentos: processOptionals(),
    tipo_veiculo: determineVehicleType(row.Modelo || ''),
    
    // Metadados
    origem_importacao: 'smart_import',
    versao_sistema: '3.0'
  };
};

// Executar importação
const filename = process.argv[2] || './attached_assets/nova_planilha.xlsx';
smartImport(filename).catch(console.error);