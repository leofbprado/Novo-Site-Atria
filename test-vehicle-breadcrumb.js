/**
 * Test script for Vehicle Breadcrumb Implementation
 * Run this in the browser console on a vehicle detail page
 */

function testVehicleBreadcrumb() {
  console.log('🧪 TESTING VEHICLE BREADCRUMB IMPLEMENTATION\n');
  
  // Test 1: Check for visual breadcrumb
  const breadcrumb = document.querySelector('nav[aria-label="breadcrumb"]');
  if (!breadcrumb) {
    console.error('❌ No visual breadcrumb found');
    return false;
  }
  console.log('✅ Visual breadcrumb found');
  
  // Test 2: Check breadcrumb is in main
  const inMain = !!breadcrumb.closest('main, #page');
  if (!inMain) {
    console.error('❌ Breadcrumb not inside main element');
    return false;
  }
  console.log('✅ Breadcrumb correctly positioned in main');
  
  // Test 3: Check breadcrumb structure
  const breadcrumbItems = breadcrumb.querySelectorAll('ol > li');
  if (breadcrumbItems.length !== 3) {
    console.error('❌ Expected 3 breadcrumb items, found:', breadcrumbItems.length);
    return false;
  }
  console.log('✅ Breadcrumb has correct number of items (3)');
  
  // Test 4: Check breadcrumb content
  const expectedTexts = ['Início', 'Estoque de Veículos'];
  const actualTexts = Array.from(breadcrumbItems).map(li => li.textContent.trim());
  
  if (!actualTexts[0].includes('Início')) {
    console.error('❌ First breadcrumb should be "Início", found:', actualTexts[0]);
    return false;
  }
  if (!actualTexts[1].includes('Estoque de Veículos')) {
    console.error('❌ Second breadcrumb should be "Estoque de Veículos", found:', actualTexts[1]);
    return false;
  }
  console.log('✅ Breadcrumb text content correct');
  console.log('  - Item 1:', actualTexts[0]);
  console.log('  - Item 2:', actualTexts[1]);
  console.log('  - Item 3 (current):', actualTexts[2]);
  
  // Test 5: Check for JSON-LD
  const jsonLdScript = document.querySelector('script#jsonld-breadcrumb[type="application/ld+json"]');
  if (!jsonLdScript) {
    console.error('❌ No JSON-LD breadcrumb script found');
    return false;
  }
  console.log('✅ JSON-LD breadcrumb script found');
  
  // Test 6: Validate JSON-LD content
  try {
    const jsonLd = JSON.parse(jsonLdScript.textContent);
    if (jsonLd['@type'] !== 'BreadcrumbList') {
      console.error('❌ JSON-LD @type should be BreadcrumbList, found:', jsonLd['@type']);
      return false;
    }
    if (!jsonLd.itemListElement || jsonLd.itemListElement.length !== 3) {
      console.error('❌ JSON-LD should have 3 items, found:', jsonLd.itemListElement?.length);
      return false;
    }
    console.log('✅ JSON-LD structure valid');
    console.log('  - @context:', jsonLd['@context']);
    console.log('  - @type:', jsonLd['@type']);
    console.log('  - Items:', jsonLd.itemListElement.map(item => item.name).join(' > '));
  } catch (e) {
    console.error('❌ Failed to parse JSON-LD:', e);
    return false;
  }
  
  // Test 7: Check for duplicate JSON-LD scripts
  const allJsonLdScripts = document.querySelectorAll('script#jsonld-breadcrumb');
  if (allJsonLdScripts.length > 1) {
    console.error('❌ Multiple JSON-LD breadcrumb scripts found:', allJsonLdScripts.length);
    return false;
  }
  console.log('✅ No duplicate JSON-LD scripts');
  
  // Test 8: Check H1 positioning
  const h1 = document.querySelector('main h1, main h2.title');
  if (h1) {
    const breadcrumbY = breadcrumb.getBoundingClientRect().top;
    const h1Y = h1.getBoundingClientRect().top;
    if (breadcrumbY > h1Y) {
      console.warn('⚠️ Breadcrumb appears after H1 - should be above');
    } else {
      console.log('✅ Breadcrumb correctly positioned above H1');
    }
  }
  
  console.log('\n🎉 VEHICLE BREADCRUMB TESTS COMPLETE');
  return true;
}

// Run the test
testVehicleBreadcrumb();