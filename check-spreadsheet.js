import XLSX from 'xlsx';
import { readFileSync } from 'fs';

try {
  console.log('📊 Lendo planilha Excel...');
  
  // Ler arquivo Excel
  const data = readFileSync('./attached_assets/estoque_atria_completo_1753391673589.xlsx');
  const workbook = XLSX.read(data, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Converter para JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`📋 Total de linhas: ${jsonData.length}`);
  
  if (jsonData.length > 0) {
    console.log('\n🔍 Estrutura da primeira linha (colunas disponíveis):');
    const firstRow = jsonData[0];
    Object.keys(firstRow).forEach(key => {
      console.log(`  - ${key}: ${firstRow[key]}`);
    });
    
    console.log('\n📸 Verificando coluna de fotos...');
    const photosColumn = Object.keys(firstRow).find(key => 
      key.toLowerCase().includes('foto') || 
      key.toLowerCase().includes('imagem') || 
      key.toLowerCase().includes('photo') ||
      key.toLowerCase().includes('image')
    );
    
    if (photosColumn) {
      console.log(`✅ Coluna de fotos encontrada: "${photosColumn}"`);
      console.log(`📷 Exemplo de dados: ${firstRow[photosColumn]}`);
      
      // Mostrar mais alguns exemplos
      for (let i = 0; i < Math.min(5, jsonData.length); i++) {
        if (jsonData[i][photosColumn]) {
          console.log(`   Linha ${i + 1}: ${jsonData[i][photosColumn]}`);
        }
      }
    } else {
      console.log('❌ Nenhuma coluna de fotos encontrada');
      console.log('📋 Colunas disponíveis:', Object.keys(firstRow));
    }
  }
  
} catch (error) {
  console.error('❌ Erro ao ler planilha:', error.message);
}