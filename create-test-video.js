// Script para criar vídeo de teste - Execute via admin page
console.log("Para testar o vídeo da semana:");
console.log("1. Acesse /admin");
console.log("2. Vá na aba 'Vídeo da Semana'");
console.log("3. Cole este link de teste: https://www.youtube.com/watch?v=dQw4w9WgXcQ");
console.log("4. Salve e volte para a homepage");

// Dados de teste que devem ser inseridos
const testVideoData = {
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  titulo: 'Ofertas da Semana - Átria Veículos',
  descricao: 'Confira as melhores ofertas desta semana!',
  data_cadastro: new Date().toISOString(),
  ativo: true
};

console.log("Dados de teste:", JSON.stringify(testVideoData, null, 2));