// Script para criar três depoimentos iniciais no Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

// Três depoimentos fictícios para a Átria Veículos
const testimonials = [
  {
    nome: "Maria Silva",
    foto_url: "https://randomuser.me/api/portraits/women/32.jpg",
    profissao: "Advogada",
    cidade: "Campinas/SP",
    avaliacao: 5,
    depoimento: "Excelente atendimento da equipe da Átria Veículos! Comprei meu Honda Civic seminovo e foi uma experiência incrível. O processo foi transparente, sem surpresas, e o carro veio exatamente como prometido. A equipe me ajudou em todo o financiamento e ainda conseguiram uma condição muito boa. Recomendo para todos que buscam qualidade e confiança na compra do carro!",
    created_at: new Date().toISOString()
  },
  {
    nome: "João Santos",
    foto_url: "https://randomuser.me/api/portraits/men/45.jpg", 
    profissao: "Engenheiro",
    cidade: "São Paulo/SP",
    avaliacao: 5,
    depoimento: "Estava procurando um SUV para a família e encontrei o Compass perfeito na Átria Veículos. Desde o primeiro contato até a entrega, tudo foi muito profissional. A documentação saiu rapidinho e o preço foi justo. O carro estava impecável, bem conservado. Já indiquei para vários amigos e todos ficaram satisfeitos. Parabéns pela seriedade!",
    created_at: new Date().toISOString()
  },
  {
    nome: "Ana Carolina",
    foto_url: "https://randomuser.me/api/portraits/women/67.jpg",
    profissao: "Professora", 
    cidade: "Piracicaba/SP",
    avaliacao: 5,
    depoimento: "Minha experiência na Átria Veículos foi fantástica! Comprei meu primeiro carro, um Kwid, e a equipe teve toda paciência do mundo para me explicar tudo. O financiamento foi aprovado rapidamente e o valor da entrada cabeu no meu orçamento. O carro chegou limpinho e com todos os acessórios prometidos. Estou muito feliz com minha compra e já virei cliente fiel!",
    created_at: new Date().toISOString()
  }
];

async function createTestimonials() {
  try {
    console.log('Iniciando criação dos depoimentos...');
    
    for (const testimonial of testimonials) {
      const docRef = await addDoc(collection(db, 'depoimentos'), testimonial);
      console.log(`✅ Depoimento de ${testimonial.nome} criado com ID: ${docRef.id}`);
    }
    
    console.log('🎉 Todos os depoimentos foram criados com sucesso!');
    console.log('📋 Total de depoimentos criados:', testimonials.length);
    
  } catch (error) {
    console.error('❌ Erro ao criar depoimentos:', error);
  }
}

// Executar a criação
createTestimonials();