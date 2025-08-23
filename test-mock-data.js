// Criar dados de teste temporários para verificar o sistema
const mockVehicles = [
  {
    id: "TEST_001",
    vehicle_uuid: "TEST_001",
    marca: "Honda",
    modelo: "Civic",
    versao: "EXL 2.0",
    ano: 2022,
    km: 25000,
    combustivel: "Flex",
    cambio: "Automático",
    preco: 135000,
    ativo: true,
    photos: [
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752792/foto1.jpg",
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752792/foto2.jpg",
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752792/foto3.jpg"
    ],
    imagens: [
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752792/foto1.jpg",
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752792/foto2.jpg",
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752792/foto3.jpg"
    ]
  },
  {
    id: "TEST_002",
    vehicle_uuid: "TEST_002", 
    marca: "Toyota",
    modelo: "Corolla",
    versao: "GLi 2.0",
    ano: 2023,
    km: 12000,
    combustivel: "Flex",
    cambio: "Automático",
    preco: 145000,
    ativo: true,
    photos: [
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752793/foto1.jpg",
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752793/foto2.jpg"
    ],
    imagens: [
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752793/foto1.jpg",
      "https://resized-images.autoconf.com.br/1024x0/veiculos/fotos/752793/foto2.jpg"
    ]
  }
];

console.log("🔍 Dados de teste criados:");
console.log(JSON.stringify(mockVehicles, null, 2));
console.log("\n📌 Estrutura esperada:");
console.log("- Campo 'photos': array de URLs das fotos");
console.log("- Campo 'imagens': array de compatibilidade");
console.log("- Todas as URLs já estão hospedadas na Autoconf");