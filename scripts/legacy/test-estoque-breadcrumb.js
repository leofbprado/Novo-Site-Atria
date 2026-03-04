// Test script for Estoque breadcrumb implementation
// Run this in browser console on /estoque page

// 1. Limpar qualquer "/" legado (rodar uma vez se necessário)
document.querySelectorAll('nav[aria-label="breadcrumb"] li')
  .forEach(li => { if (li.textContent.trim() === "/") li.remove(); });

// 2. Checagem completa
const result = [...document.querySelectorAll('nav[aria-label="breadcrumb"]')]
  .map(n => ({
    inHeader: !!n.closest('header,.boxcar-header'),
    html: n.innerHTML,
    text: n.innerText
  }));

console.log('Breadcrumb test result:', result);
console.log('Expected: 1 breadcrumb, inHeader: false, text: "Início Estoque de Veículos"');

// 3. Verificações adicionais
const breadcrumb = document.querySelector('nav[aria-label="breadcrumb"]');
const inCard = !!breadcrumb?.closest('.boxcar-title-three, .inventory-section');
console.log('Breadcrumb in card:', inCard);

// 4. Check if breadcrumb is above h2
const h2 = document.querySelector('h2.title');
if (breadcrumb && h2) {
  const breadcrumbY = breadcrumb.getBoundingClientRect().top;
  const h2Y = h2.getBoundingClientRect().top;
  console.log('Breadcrumb above H2:', breadcrumbY < h2Y);
}

// 5. Contar <li> elements
const liCount = breadcrumb ? breadcrumb.querySelectorAll('li').length : 0;
console.log('Number of <li> elements:', liCount, '(should be 2)');

// 6. Teste separador não quebra linha
const liTexts = [...document.querySelectorAll('nav[aria-label="breadcrumb"] li')].map(li => li.innerText);
console.log('Li texts:', liTexts, '(should be ["Início", "Estoque de Veículos"])');

// 7. Teste CSS inline-flex
const olDirection = getComputedStyle(document.querySelector('.breadcrumb ol')).flexDirection;
const liDisplays = [...document.querySelectorAll('.breadcrumb li')].map(li => getComputedStyle(li).display);
console.log('OL flex-direction:', olDirection, '(should be "row")');
console.log('LI displays:', liDisplays, '(should all be "inline-flex")');