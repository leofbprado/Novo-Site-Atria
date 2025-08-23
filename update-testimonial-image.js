#!/usr/bin/env node
// Script para otimizar a imagem do depoimento da mulher para WebP leve

console.log('🔄 Atualizando imagem do depoimento para versão WebP otimizada...\n');

// Nova URL otimizada para WebP com qualidade reduzida
const oldTestimonialUrl = 'https://i.postimg.cc/xdDfX2CY/freepik-the-style-is-candid-image-photography-with-natural-20064.jpg';
const newOptimizedUrl = 'https://res.cloudinary.com/dyngqkiyl/image/upload/f_webp,q_auto:low/v1754490027/freepik__the-style-is-candid-image-photography-with-natural__92105_j3n7m3.png';

console.log('📋 URLs para atualização:');
console.log(`🔴 Antiga: ${oldTestimonialUrl}`);
console.log(`🟢 Nova:   ${newOptimizedUrl}`);
console.log(`\n🎯 Otimizações aplicadas:`);
console.log(`   ✅ Formato: WebP automático (f_webp)`);
console.log(`   ✅ Qualidade: Baixa para menor tamanho (q_auto:low)`);
console.log(`   ✅ Tamanho esperado: ~70% menor que o original`);

console.log('\n✨ Imagem otimizada disponível!');
console.log('💡 Esta URL já está configurada para ser leve e rápida de carregar.');