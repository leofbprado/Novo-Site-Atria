import xlsx from 'xlsx';
import fs from 'fs';

const filePath = 'attached_assets/estoque_atria_com_opcionais_1753662813056.xlsx';

// Ler arquivo Excel
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(worksheet);

console.log('📊 ANÁLISE DE FOTOS NA PLANILHA EXCEL');
console.log('=======================================\n');

console.log(`Total de veículos: ${jsonData.length}\n`);

// Analisar primeiros 5 veículos
for (let i = 0; i < Math.min(5, jsonData.length); i++) {
  const row = jsonData[i];
  console.log(`📋 VEÍCULO ${i + 1}: ${row.Marca} ${row.Modelo}`);
  console.log(`   Placa: ${row.Placa || 'N/A'}`);
  
  // Analisar campo "Imagem Principal"
  if (row['Imagem Principal']) {
    console.log(`   ✅ Imagem Principal: ${row['Imagem Principal'].substring(0, 80)}...`);
  } else {
    console.log(`   ❌ Imagem Principal: NÃO ENCONTRADA`);
  }
  
  // Analisar campo "Fotos"
  if (row.Fotos) {
    const fotosArray = row.Fotos.split(';').filter(url => url.trim());
    console.log(`   ✅ Fotos: ${fotosArray.length} URLs encontradas`);
    if (fotosArray.length > 0) {
      console.log(`      Primeira foto: ${fotosArray[0].substring(0, 70)}...`);
    }
  } else {
    console.log(`   ❌ Fotos: CAMPO VAZIO`);
  }
  
  console.log('');
}

// Estatísticas gerais
let comImagemPrincipal = 0;
let comFotos = 0;
let totalFotos = 0;

jsonData.forEach(row => {
  if (row['Imagem Principal']) comImagemPrincipal++;
  if (row.Fotos) {
    comFotos++;
    const fotosArray = row.Fotos.split(';').filter(url => url.trim());
    totalFotos += fotosArray.length;
  }
});

console.log('\n📊 ESTATÍSTICAS GERAIS:');
console.log(`   Veículos com Imagem Principal: ${comImagemPrincipal}/${jsonData.length}`);
console.log(`   Veículos com campo Fotos: ${comFotos}/${jsonData.length}`);
console.log(`   Total de fotos na planilha: ${totalFotos}`);
console.log(`   Média de fotos por veículo: ${(totalFotos / jsonData.length).toFixed(1)}`);