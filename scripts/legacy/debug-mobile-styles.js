// SCRIPT DE DIAGNÓSTICO CSS MOBILE - STACKING CONTEXT
// Execute este script no DevTools Mobile (F12) para analisar o problema de z-index

console.log('🔍 INICIANDO DIAGNÓSTICO CSS MOBILE...');
console.log('');

// 1. IDENTIFICAR ELEMENTOS
const video = document.querySelector('.boxcar-banner-section-v1 video') || document.querySelector('video');
const content = document.querySelector('.boxcar-banner-section-v1 .banner-content');
const section = document.querySelector('.boxcar-banner-section-v1');

// 2. VERIFICAR EXISTÊNCIA DOS ELEMENTOS
console.log('🔍 ELEMENTOS ENCONTRADOS:');
console.log('Video:', !!video, video);
console.log('Content:', !!content, content);
console.log('Section:', !!section, section);
console.log('');

// 3. ANÁLISE COMPUTED STYLES
if (video) {
  const vStyle = getComputedStyle(video);
  console.log('📹 VIDEO COMPUTED STYLES:');
  console.log({
    position: vStyle.position,
    zIndex: vStyle.zIndex,
    transform: vStyle.transform,
    top: vStyle.top,
    left: vStyle.left,
    width: vStyle.width,
    height: vStyle.height
  });
  console.log('');
}

if (content) {
  const cStyle = getComputedStyle(content);
  console.log('📝 CONTENT COMPUTED STYLES:');
  console.log({
    position: cStyle.position,
    zIndex: cStyle.zIndex,
    transform: cStyle.transform,
    top: cStyle.top,
    left: cStyle.left,
    width: cStyle.width,
    height: cStyle.height
  });
  console.log('');
}

if (section) {
  const sStyle = getComputedStyle(section);
  console.log('📦 SECTION COMPUTED STYLES:');
  console.log({
    position: sStyle.position,
    zIndex: sStyle.zIndex,
    transform: sStyle.transform,
    overflow: sStyle.overflow,
    height: sStyle.height
  });
  console.log('');
}

// 4. ANÁLISE DE STACKING CONTEXT
console.log('🔍 ANÁLISE DE STACKING CONTEXT:');
console.log('');

// Verifica se há transform criando novo stacking context
if (section) {
  const sTransform = getComputedStyle(section).transform;
  console.log('Section transform creates stacking context:', sTransform !== 'none');
}

if (content) {
  const cTransform = getComputedStyle(content).transform;
  console.log('Content transform creates stacking context:', cTransform !== 'none');
}

// 5. VERIFICAR REGRAS CSS APLICADAS
console.log('');
console.log('🔍 VERIFICAR OVERRIDE CSS:');
if (content) {
  console.log('Content z-index should be 30:', getComputedStyle(content).zIndex);
  console.log('Content position should be relative:', getComputedStyle(content).position);
}

console.log('');
console.log('✅ DIAGNÓSTICO COMPLETO - Cole os resultados para análise');