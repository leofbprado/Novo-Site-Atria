// Script para importar posts do blog para o Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCSWGGcjZE9NsXsqxOQhLu0uH3SfAC8rnU",
  authDomain: "atria-veiculos.firebaseapp.com",
  projectId: "atria-veiculos",
  storageBucket: "atria-veiculos.appspot.com",
  messagingSenderId: "166148489994",
  appId: "1:166148489994:web:b7c94833fd5be3b9da1841",
  measurementId: "G-46BZ3FB7DY"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para limpar HTML e extrair texto limpo
function cleanHtmlContent(htmlContent) {
  if (!htmlContent || htmlContent.trim() === '') {
    return '<p>Conteúdo em desenvolvimento...</p>';
  }
  
  // Remove divs de cabeçalho e navegação
  let cleanContent = htmlContent
    .replace(/<div class="site_content">.*?<\/div>/gs, '')
    .replace(/<div.*?hamburger-header.*?<\/div>/gs, '')
    .replace(/<div.*?u_\d+.*?<\/div>/gs, '')
    .replace(/<div.*?dmResp.*?<\/div>/gs, '')
    .trim();
  
  // Se ainda está vazio, usar conteúdo padrão
  if (!cleanContent || cleanContent.length < 50) {
    return '<p>Conteúdo em desenvolvimento...</p>';
  }
  
  return cleanContent;
}

async function importBlogPosts() {
  try {
    console.log('📚 Iniciando importação dos posts do blog...');
    
    // Ler o arquivo JSON
    const blogData = JSON.parse(fs.readFileSync('./attached_assets/blog_posts_final_1753729178894.json', 'utf8'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const post of blogData) {
      try {
        // Limpar conteúdo HTML
        const cleanContent = cleanHtmlContent(post.content);
        
        // Preparar dados do post
        const postData = {
          title: post.title,
          slug: post.slug,
          coverImage: post.coverImage,
          publishedAt: post.publishedAt,
          content: cleanContent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'published'
        };
        
        // Adicionar ao Firestore
        const docRef = await addDoc(collection(db, 'blog_posts'), postData);
        console.log(`✅ Post "${post.title}" importado com ID: ${docRef.id}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ Erro ao importar post "${post.title}":`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Importação concluída!');
    console.log(`✅ Posts importados com sucesso: ${successCount}`);
    console.log(`❌ Posts com erro: ${errorCount}`);
    console.log(`📊 Total de posts processados: ${blogData.length}`);
    
  } catch (error) {
    console.error('❌ Erro geral na importação:', error);
  }
}

// Executar a importação
importBlogPosts();