#!/usr/bin/env node

/**
 * SCRIPT DE MIGRAÇÃO DEFINITIVA DO SISTEMA DE TAGS
 * Átria Veículos - Padronização de Tags Personalizadas
 * 
 * Este script executa a migração completa e definitiva do sistema de tags:
 * 1. Converte custom_tag strings para objetos tag estruturados
 * 2. Remove campos legados (custom_tag, tag_destaque)
 * 3. Padroniza o sistema para usar apenas 'tag' com estrutura {nome, cor, icone}
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteField,
  writeBatch 
} from 'firebase/firestore';

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDjjkm9GUGdXyky-8JH5vJu65_5T4KAHzs",
  authDomain: "veiculos-database.firebaseapp.com",
  projectId: "veiculos-database",
  storageBucket: "veiculos-database.firebasestorage.app",
  messagingSenderId: "678495823112",
  appId: "1:678495823112:web:05a64e34ba19b6ce96a7a4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mapeamento de tags legadas para tags personalizadas padrão
const TAG_MAPPING = {
  'destaque': { nome: 'Destaque', cor: '#FFD700', icone: 'Star' },
  'promocao': { nome: 'Promoção', cor: '#FF4444', icone: 'Tag' },
  'oferta_especial': { nome: 'Oferta Especial', cor: '#FF6B35', icone: 'Percent' },
  'seminovo': { nome: 'Seminovo', cor: '#4CAF50', icone: 'CheckCircle' },
  'km_baixa': { nome: 'Km Baixa', cor: '#2196F3', icone: 'Gauge' },
  'financiamento_facilitado': { nome: 'Financiamento Facilitado', cor: '#9C27B0', icone: 'CreditCard' }
};

async function migrateTagsSystem() {
  console.log('🚀 INICIANDO LIMPEZA E VALIDAÇÃO RIGOROSA DO SISTEMA DE TAGS');
  console.log('=======================================================\n');

  try {
    // 1. Carregar tags personalizadas autorizadas
    console.log('📋 Carregando tags personalizadas autorizadas...');
    const tagsCollection = collection(db, 'tags_customizadas');
    const tagsSnapshot = await getDocs(tagsCollection);
    const authorizedTags = tagsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ ${authorizedTags.length} tags personalizadas autorizadas encontradas`);
    authorizedTags.forEach(tag => {
      console.log(`   • ${tag.nome} (${tag.cor}) - ${tag.icone}`);
    });
    console.log('');

    // 2. Carregar todos os veículos
    console.log('📋 Carregando veículos do Firestore...');
    const vehiclesCollection = collection(db, 'veiculos');
    const vehiclesSnapshot = await getDocs(vehiclesCollection);
    const vehicles = vehiclesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ ${vehicles.length} veículos carregados\n`);

    // 3. Analisar estado atual e detectar tags inválidas
    let statsLegacy = 0;
    let statsValid = 0;
    let statsInvalid = 0;
    let statsClean = 0;
    const invalidTags = [];

    vehicles.forEach(vehicle => {
      const currentTag = vehicle.tag || vehicle.custom_tag;
      
      if (!currentTag) {
        statsClean++;
        return;
      }
      
      if (vehicle.custom_tag && !vehicle.tag) {
        statsLegacy++;
      }
      
      // Verificar se tag é válida
      let isValid = false;
      if (typeof currentTag === 'object' && currentTag.nome) {
        isValid = authorizedTags.some(tag => tag.nome === currentTag.nome);
      } else if (typeof currentTag === 'string') {
        isValid = authorizedTags.some(tag => tag.nome === currentTag);
      }
      
      if (isValid) {
        statsValid++;
      } else {
        statsInvalid++;
        invalidTags.push({
          vehicleId: vehicle.id,
          tag: currentTag,
          placa: vehicle.placa
        });
      }
    });

    console.log('📊 ANÁLISE ATUAL DO SISTEMA:');
    console.log(`   • Veículos com tags válidas: ${statsValid}`);
    console.log(`   • Veículos com tags INVÁLIDAS: ${statsInvalid}`);
    console.log(`   • Veículos com custom_tag (legado): ${statsLegacy}`);
    console.log(`   • Veículos sem tags: ${statsClean}\n`);
    
    if (invalidTags.length > 0) {
      console.log('❌ TAGS INVÁLIDAS DETECTADAS:');
      invalidTags.forEach(item => {
        console.log(`   • ${item.placa}: "${JSON.stringify(item.tag)}"`);
      });
      console.log('');
    }

    // 4. Processar limpeza rigorosa em lotes
    console.log('🧹 Executando limpeza rigorosa...');
    const batch = writeBatch(db);
    let batchCount = 0;
    let cleanedCount = 0;
    let removedInvalidCount = 0;

    for (const vehicle of vehicles) {
      const vehicleRef = doc(db, 'veiculos', vehicle.id);
      let needsUpdate = false;
      const updates = {};
      
      const currentTag = vehicle.tag || vehicle.custom_tag;

      // Validar e processar tag atual
      if (currentTag) {
        let isValidTag = false;
        let validTagObject = null;
        
        // Verificar se tag é válida
        if (typeof currentTag === 'object' && currentTag.nome) {
          const authorizedTag = authorizedTags.find(tag => tag.nome === currentTag.nome);
          if (authorizedTag) {
            isValidTag = true;
            validTagObject = authorizedTag;
          }
        } else if (typeof currentTag === 'string') {
          const authorizedTag = authorizedTags.find(tag => tag.nome === currentTag);
          if (authorizedTag) {
            isValidTag = true;
            validTagObject = authorizedTag;
          }
        }
        
        if (isValidTag && validTagObject) {
          // Padronizar tag válida no formato correto
          updates.tag = {
            nome: validTagObject.nome,
            cor: validTagObject.cor,
            icone: validTagObject.icone
          };
          needsUpdate = true;
          console.log(`   ✅ ${vehicle.placa}: Tag "${validTagObject.nome}" padronizada`);
        } else {
          // Remover tag inválida
          updates.tag = deleteField();
          removedInvalidCount++;
          needsUpdate = true;
          console.log(`   ❌ ${vehicle.placa}: Tag inválida "${JSON.stringify(currentTag)}" removida`);
        }
      }

      // Remover todos os campos legados
      if (vehicle.custom_tag) {
        updates.custom_tag = deleteField();
        cleanedCount++;
        needsUpdate = true;
      }

      if (vehicle.tag_destaque) {
        updates.tag_destaque = deleteField();
        needsUpdate = true;
      }

      // Aplicar atualizações
      if (needsUpdate) {
        batch.update(vehicleRef, updates);
        batchCount++;

        // Executar lote a cada 500 operações
        if (batchCount >= 500) {
          await batch.commit();
          console.log(`   ✅ Lote de ${batchCount} atualizações aplicado`);
          batchCount = 0;
        }
      }
    }

    // Executar último lote se necessário
    if (batchCount > 0) {
      await batch.commit();
      console.log(`   ✅ Último lote de ${batchCount} atualizações aplicado`);
    }

    // 5. Relatório final
    console.log('\n🎉 LIMPEZA RIGOROSA CONCLUÍDA COM SUCESSO!');
    console.log('==========================================');
    console.log(`✅ Tags válidas padronizadas: ${vehicles.length - removedInvalidCount - statsClean}`);
    console.log(`❌ Tags inválidas removidas: ${removedInvalidCount}`);
    console.log(`🧹 Campos legados removidos: ${cleanedCount}`);
    console.log('\n📋 SISTEMA RIGOROSAMENTE VALIDADO:');
    console.log('   • Campo único: tag');
    console.log('   • Estrutura: { nome, cor, icone }');
    console.log('   • Fonte EXCLUSIVA: Tags Personalizadas (admin)');
    console.log('   • Validação rigorosa: SIM');
    console.log('   • Fallbacks para tags inválidas: REMOVIDOS');
    console.log('\n🔒 Sistema 100% seguro contra tags não autorizadas!');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar migração
migrateTagsSystem()
  .then(() => {
    console.log('\n🚀 Migração finalizada. Sistema pronto para uso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na migração:', error);
    process.exit(1);
  });