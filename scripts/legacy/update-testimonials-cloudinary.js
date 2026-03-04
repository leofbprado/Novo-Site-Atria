#!/usr/bin/env node
// Script para atualizar URLs dos testimonials no Firestore para usar Cloudinary

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgKAKp0n5vUZG1WDQ5_X3VY6XMVKZL-dw",
  authDomain: "novo-site-atria-2764e9169a7a.firebaseapp.com",
  projectId: "novo-site-atria-2764e9169a7a",
  storageBucket: "novo-site-atria-2764e9169a7a.appspot.com",
  messagingSenderId: "317750286423",
  appId: "1:317750286423:web:8d8b5bc4a2a1234567890"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔄 Atualizando URLs dos depoimentos para Cloudinary...\n');

// Mapeamento das URLs i.postimg.cc para Cloudinary
const testimonialUrlMappings = {
  'https://i.postimg.cc/xdDfX2CY/freepik-the-style-is-candid-image-photography-with-natural-20064.jpg': 
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
  
  'https://i.postimg.cc/cL811HdX/freepik-the-style-is-candid-image-photography-with-natural-20062.jpg': 
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9',
  
  'https://i.postimg.cc/FKy9cBdS/freepik-the-style-is-candid-image-photography-with-natural-20063.jpg': 
    'https://res.cloudinary.com/dyngqkiyl/image/upload/f_auto,q_auto/v1/atria-veiculos/images/misc/freepik__the-style-is-candid-image-photography-with-natural__47739_g8kdq9'
};

async function updateTestimonials() {
  try {
    console.log('📋 Buscando depoimentos no Firestore...');
    
    const testimonialsRef = collection(db, 'testimonials');
    const querySnapshot = await getDocs(testimonialsRef);
    
    if (querySnapshot.empty) {
      console.log('⚠️  Nenhum depoimento encontrado no Firestore');
      return;
    }
    
    console.log(`✅ ${querySnapshot.size} depoimentos encontrados\n`);
    
    let updatedCount = 0;
    let alreadyUpdated = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const docId = docSnapshot.id;
      
      console.log(`🔍 Verificando depoimento: ${data.name || 'Sem nome'}`);
      console.log(`   URL atual: ${data.imgSrc}`);
      
      if (data.imgSrc && testimonialUrlMappings[data.imgSrc]) {
        const newUrl = testimonialUrlMappings[data.imgSrc];
        
        console.log(`   🔄 Atualizando para: ${newUrl}`);
        
        try {
          await updateDoc(doc(db, 'testimonials', docId), {
            imgSrc: newUrl,
            updated_at: new Date()
          });
          
          updatedCount++;
          console.log(`   ✅ Atualizado com sucesso!\n`);
          
        } catch (error) {
          console.error(`   ❌ Erro ao atualizar: ${error.message}\n`);
        }
      } else if (data.imgSrc && data.imgSrc.includes('cloudinary.com')) {
        console.log(`   ✅ Já usa Cloudinary - mantido\n`);
        alreadyUpdated++;
      } else {
        console.log(`   ⚠️  URL não mapeada - mantida\n`);
      }
    }
    
    console.log('='.repeat(50));
    console.log('📊 RESUMO DA ATUALIZAÇÃO:');
    console.log('='.repeat(50));
    console.log(`📦 Total de depoimentos: ${querySnapshot.size}`);
    console.log(`🔄 Atualizados: ${updatedCount}`);
    console.log(`✅ Já Cloudinary: ${alreadyUpdated}`);
    console.log(`⚠️  Não modificados: ${querySnapshot.size - updatedCount - alreadyUpdated}`);
    
    if (updatedCount > 0) {
      console.log('\n✨ Atualização concluída!');
      console.log('🔄 Recarregue a página para ver as mudanças');
    } else {
      console.log('\n🎉 Todos os depoimentos já estavam atualizados!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao Firestore:', error.message);
  }
}

updateTestimonials();