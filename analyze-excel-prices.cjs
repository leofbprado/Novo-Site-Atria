const XLSX = require('xlsx');

function analyzeExcelPrices() {
  try {
    console.log('📊 Analisando planilha de preços...');
    
    // Ler a planilha Excel
    const workbook = XLSX.readFile('./attached_assets/estoque_atria_com_opcionais_1753793366979.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ ${data.length} veículos encontrados na planilha`);
    
    // Analisar primeiros 5 veículos para verificar formato dos preços
    console.log('\n🔍 Análise dos primeiros 5 veículos:');
    
    data.slice(0, 5).forEach((row, index) => {
      console.log(`\n--- Veículo ${index + 1} ---`);
      console.log('Marca:', row.Marca);
      console.log('Modelo:', row.Modelo);
      
      // Mostrar o valor do preço
      console.log('Preço:', row['Preço'], `(tipo: ${typeof row['Preço']})`);
      
      if (row['Preço']) {
        const precoStr = String(row['Preço']);
        console.log('Preço como string:', precoStr);
        console.log('Tem R$:', precoStr.includes('R$'));
        console.log('Tem ponto:', precoStr.includes('.'));
        console.log('Tem vírgula:', precoStr.includes(','));
      }
      
      // Mostrar todos os campos disponíveis
      console.log('Campos disponíveis:', Object.keys(row));
    });
    
    // Verificar padrões de preço
    console.log('\n💰 Análise de padrões de preço:');
    
    const priceField = Object.keys(data[0]).find(key => 
      key.toLowerCase().includes('prec') || 
      key.toLowerCase().includes('valor') ||
      key.toLowerCase().includes('price')
    );
    
    if (priceField) {
      console.log(`Campo de preço identificado: ${priceField}`);
      
      const priceValues = data.slice(0, 10).map(row => ({
        marca: row.Marca,
        modelo: row.Modelo,
        valorOriginal: row[priceField],
        tipo: typeof row[priceField],
        comRCifrao: String(row[priceField]).includes('R$'),
        comPonto: String(row[priceField]).includes('.'),
        comVirgula: String(row[priceField]).includes(','),
        parseFloat: parseFloat(String(row[priceField]).replace(/[R$\.\s]/g, '').replace(',', '.')),
        parseInt: parseInt(String(row[priceField]).replace(/[^\d]/g, ''))
      }));
      
      priceValues.forEach((price, index) => {
        console.log(`${index + 1}. ${price.marca} ${price.modelo}:`);
        console.log(`   Original: ${price.valorOriginal} (${price.tipo})`);
        console.log(`   R$: ${price.comRCifrao}, Ponto: ${price.comPonto}, Vírgula: ${price.comVirgula}`);
        console.log(`   parseFloat: ${price.parseFloat}`);
        console.log(`   parseInt: ${price.parseInt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao analisar planilha:', error);
  }
}

analyzeExcelPrices();