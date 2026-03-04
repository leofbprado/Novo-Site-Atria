// Testar conversão de preços brasileiros

const testPrices = [
  "R$ 91.990,00",
  "R$ 58.990,00", 
  "R$ 82.990,00",
  "R$ 54.990,00",
  "R$ 57.990,00"
];

function processPrice(priceStr) {
  if (!priceStr) return 0;
  const cleanPrice = priceStr.toString()
    .replace(/R\$\s*/, '')  // Remove R$
    .replace(/\./g, '')     // Remove pontos (milhares)
    .replace(',', '.')      // Substitui vírgula por ponto decimal
    .trim();
  return parseFloat(cleanPrice) || 0;
}

console.log('🔍 Testando conversão de preços brasileiros:');
console.log('');

testPrices.forEach((price, index) => {
  const converted = processPrice(price);
  console.log(`${index + 1}. "${price}" → ${converted}`);
});

console.log('');
console.log('✅ Se os valores convertidos estão corretos (números sem formatação), a função está funcionando.');
console.log('❌ Se aparecer 0 ou NaN, há problema na conversão.');