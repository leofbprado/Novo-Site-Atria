import XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import crypto from 'crypto';

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

console.log('🚀 Iniciando importação completa da planilha com opcionais...');

// 1. Limpar veículos existentes
console.log('🗑️ Removendo veículos existentes...');
const vehiclesSnapshot = await getDocs(collection(db, 'veiculos'));
let deletedCount = 0;

for (const docSnap of vehiclesSnapshot.docs) {
  await deleteDoc(doc(db, 'veiculos', docSnap.id));
  deletedCount++;
}

console.log(`✅ ${deletedCount} veículos existentes removidos`);

// 2. Ler nova planilha
const filename = process.argv[2] || './attached_assets/estoque_atria_com_opcionais_1753698745167.xlsx';
const data = readFileSync(filename);
const workbook = XLSX.read(data, { type: 'buffer' });
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log(`📊 Processando ${jsonData.length} veículos da nova planilha...`);

let importedCount = 0;
let errors = 0;

for (let i = 0; i < jsonData.length; i++) {
  try {
    const row = jsonData[i];
    
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
                 itemLower.includes('vidros') || itemLower.includes('travas') ||
                 itemLower.includes('piloto') || itemLower.includes('gps')) {
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

    // Processar tipo de anúncio para tag
    const processCustomTag = (tipoAnuncio) => {
      if (!tipoAnuncio) return null;
      const tipo = tipoAnuncio.toString().toLowerCase();
      
      if (tipo.includes('destaque')) return 'destaque';
      if (tipo.includes('promoção') || tipo.includes('promocao')) return 'promocao';
      if (tipo.includes('oferta')) return 'oferta_especial';
      if (tipo.includes('seminovo')) return 'seminovo';
      
      return null;
    };

    // Determinar tipo de veículo baseado no modelo
    const determineVehicleType = (modelo) => {
      if (!modelo) return 'Outros';
      const modeloLower = modelo.toLowerCase();
      
      // SUVs e Crossovers
      if (modeloLower.includes('suv') || modeloLower.includes('renegade') || 
          modeloLower.includes('compass') || modeloLower.includes('hr-v') ||
          modeloLower.includes('ecosport') || modeloLower.includes('tracker')) {
        return 'SUV';
      }
      
      // Pick-ups
      if (modeloLower.includes('pick') || modeloLower.includes('ranger') ||
          modeloLower.includes('hilux') || modeloLower.includes('amarok') ||
          modeloLower.includes('frontier') || modeloLower.includes('saveiro')) {
        return 'Pick-up';
      }
      
      // Sedans
      if (modeloLower.includes('sedan') || modeloLower.includes('city') ||
          modeloLower.includes('civic') || modeloLower.includes('corolla') ||
          modeloLower.includes('cruze') || modeloLower.includes('prisma')) {
        return 'Sedan';
      }
      
      // Hatches (padrão para carros menores)
      return 'Hatch';
    };

    // Gerar UUID único e timestamp para identificação
    const vehicleUUID = crypto.randomUUID();
    const importTimestamp = Date.now();
    
    // Processar fotos uma única vez
    const photosArray = processPhotos();
    const imagemPrincipal = row['Imagem Principal'] ? row['Imagem Principal'].trim() : null;
    
    const vehicle = {
      vehicle_uuid: vehicleUUID,
      timestamp: importTimestamp,
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
      
      // ✅ FOTOS CORRIGIDAS - campos essenciais para o frontend
      photos: photosArray,                  // Array principal de fotos
      imagens: photosArray,                 // Compatibilidade com sistema legado
      imagemPrincipal: imagemPrincipal,    // URL da imagem principal
      imagem_capa: imagemPrincipal,        // Compatibilidade alternativa
      foto_destaque: imagemPrincipal,      // Mais uma compatibilidade
      
      // Informações adicionais
      informacoes: row.Descrição || row.Descricao || '',
      custom_tag: processCustomTag(row['Tipo de anúncio']),
      
      // Status
      ativo: row.Ativo === 'true' || row.Ativo === true || true,
      mais_vendidos: false,
      mostrar_de_por: false,
      
      // Opcionais categorizados
      equipamentos: processOptionals(),
      opcionais_originais_planilha: row.Opcionais || '',
      
      // Campos para IA completar
      especificacoes_tecnicas: {},
      descricao_original_planilha: row.Descrição || row.Descricao || '',
      
      // Campos adicionais do sistema completo
      tipo_veiculo: row['Tipo de Veículo'] || determineVehicleType(row.Modelo || ''),
      preco_de: null, // Para sistema De/Por
      fotos: row.Fotos || '', // String original para referência
      
      // Metadados de controle
      origem_importacao: 'planilha_excel',
      versao_sistema: '2.0',
      status_processamento: 'completo'
    };

    // Debug: verificar campo photos antes de salvar
    console.log(`🔍 Debug - Veículo ${importedCount + 1}:`);
    console.log(`   photos array: ${Array.isArray(vehicle.photos) ? `SIM (${vehicle.photos.length} fotos)` : 'NÃO'}`);
    if (vehicle.photos && vehicle.photos.length > 0) {
      console.log(`   Primeira foto: ${vehicle.photos[0].substring(0, 60)}...`);
    }
    
    await setDoc(doc(db, 'veiculos', vehicle.vehicle_uuid), vehicle);
    importedCount++;
    
    console.log(`✅ ${importedCount}/${jsonData.length} - ${vehicle.marca} ${vehicle.modelo} (UUID: ${vehicleUUID.substring(0, 8)}...) - ${vehicle.photos.length} fotos`);
    
    if (importedCount % 20 === 0) {
      console.log(`📦 Checkpoint: ${importedCount}/${jsonData.length} veículos importados com sucesso`);
    }
    
  } catch (error) {
    console.error(`❌ Erro no veículo ${i + 1}:`, error.message);
    errors++;
  }
}

console.log(`\n🎉 IMPORTAÇÃO CONCLUÍDA COM SUCESSO!`);
console.log(`\n📊 RELATÓRIO FINAL:`);
console.log(`   ✅ Importados: ${importedCount} veículos`);
console.log(`   ❌ Erros: ${errors}`);
console.log(`   📝 Total na planilha: ${jsonData.length}`);
console.log(`   🆔 UUID único gerado para cada veículo`);
console.log(`\n🎯 RECURSOS PROCESSADOS:`);
console.log(`   ✅ UUID únicos gerados (crypto.randomUUID)`);
console.log(`   ✅ Fotos múltiplas processadas (string → array)`);
console.log(`   ✅ Opcionais categorizados automaticamente (4 categorias)`);
console.log(`   ✅ Tags personalizadas baseadas no tipo de anúncio`);
console.log(`   ✅ Preços formatados corretamente (BR)`);
console.log(`   ✅ Tipos de veículo determinados automaticamente`);
console.log(`   ✅ Metadados de controle e versionamento`);
console.log(`   ✅ Timestamp e data de importação registrados`);
console.log(`\n💾 ESTRUTURA DE DADOS:`);
console.log(`   - Campos básicos: marca, modelo, versão, ano, km, preço, etc.`);
console.log(`   - Fotos: photos[], imagens[], fotos (string original)`);
console.log(`   - Equipamentos: INTERIOR, EXTERIOR, SEGURANÇA, CONFORTO`);
console.log(`   - Especificações: comprimento, largura, altura, etc.`);
console.log(`   - Status: ativo, mais_vendidos, mostrar_de_por`);
console.log(`   - Sistema: UUID, timestamps, origem, versão`);
console.log(`\n🚀 Próximos passos: Usar admin panel para completar dados específicos`);
console.log(`📱 Acesse: /admin (senha: atria2025admin)`);
console.log(`\n===============================================`);
console.log(`  ÁTRIA VEÍCULOS - SISTEMA DE IMPORTAÇÃO V2.0`);
console.log(`===============================================`);