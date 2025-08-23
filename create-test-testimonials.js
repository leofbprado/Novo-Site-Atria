import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBnqacfRo14T3d8T-2_NtKXzpNFAhGLNXU",
  authDomain: "atria-veiculos.firebaseapp.com",
  projectId: "atria-veiculos",
  storageBucket: "atria-veiculos.appspot.com",
  messagingSenderId: "334288687115",
  appId: "1:334288687115:web:8aa91189a4274b5a8c9b7b",
  measurementId: "G-TB6E1TMLCR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testimonials = [
  {
    nome: "Maria Silva",
    profissao: "Professora",
    depoimento: "Excelente atendimento! Comprei meu primeiro carro na Átria e foi uma experiência incrível. A equipe me ajudou a encontrar exatamente o que eu precisava dentro do meu orçamento. Super recomendo!",
    avaliacao: 5,
    foto_url: "https://images.unsplash.com/photo-1494790108755-2616b612b167?w=448&h=470&fit=crop&crop=face"
  },
  {
    nome: "João Santos",
    profissao: "Engenheiro",
    depoimento: "Processo de financiamento muito tranquilo e transparente. Consegui trocar meu carro usado por um seminovo em ótimas condições. A documentação foi resolvida rapidamente.",
    avaliacao: 5,
    foto_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=448&h=470&fit=crop&crop=face"
  },
  {
    nome: "Ana Costa",
    profissao: "Administradora",
    depoimento: "Melhor concessionária da região! Comprei meu SUV aqui e não poderia estar mais satisfeita. Preço justo, qualidade garantida e pós-venda excelente. Já indiquei para vários amigos.",
    avaliacao: 5,
    foto_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=448&h=470&fit=crop&crop=face"
  }
];

async function createTestimonials() {
  try {
    console.log('Criando depoimentos de teste...');
    
    for (const testimonial of testimonials) {
      await addDoc(collection(db, 'depoimentos'), {
        ...testimonial,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      console.log(`✅ Depoimento de ${testimonial.nome} criado com sucesso`);
    }
    
    console.log('🎉 Todos os depoimentos foram criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar depoimentos:', error);
  }
}

createTestimonials();