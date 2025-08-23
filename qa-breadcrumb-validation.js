/**
 * QA Validation Script for Breadcrumb Implementation
 * Run this in browser console on different pages to validate
 */

// QA Test function
function validateBreadcrumb() {
  console.log('🔍 BREADCRUMB QA VALIDATION STARTING...\n');
  
  // Step 1: Count breadcrumbs
  const breadcrumbs = [...document.querySelectorAll('nav[aria-label="breadcrumb"]')];
  console.log(`📊 Total breadcrumbs found: ${breadcrumbs.length}`);
  
  if (breadcrumbs.length === 0) {
    console.error('❌ NO BREADCRUMBS FOUND');
    return false;
  }
  
  if (breadcrumbs.length > 1) {
    console.error('❌ MULTIPLE BREADCRUMBS FOUND:', breadcrumbs.length);
    breadcrumbs.forEach((bc, i) => {
      console.log(`  Breadcrumb ${i+1}:`, {
        inHeader: !!bc.closest('header, .boxcar-header'),
        text: bc.innerText.trim().replace(/\s+/g, ' ')
      });
    });
    return false;
  }
  
  // Step 2: Check location (should NOT be in header)
  const breadcrumb = breadcrumbs[0];
  const inHeader = !!breadcrumb.closest('header, .boxcar-header');
  const inMain = !!breadcrumb.closest('main, #page');
  
  if (inHeader) {
    console.error('❌ BREADCRUMB IN HEADER - Should be in main');
    return false;
  }
  
  if (!inMain) {
    console.warn('⚠️ BREADCRUMB NOT IN MAIN ELEMENT');
  }
  
  // Step 3: Check for empty bars / duplicate separators
  const breadcrumbText = breadcrumb.innerText.trim();
  if (breadcrumbText.includes('  /  ') || breadcrumbText.includes('//')) {
    console.error('❌ EMPTY SEPARATORS FOUND:', breadcrumbText);
    return false;
  }
  
  // Step 4: Check for empty list items
  const emptyItems = breadcrumb.querySelectorAll('li:empty');
  if (emptyItems.length > 0) {
    console.error('❌ EMPTY LIST ITEMS FOUND:', emptyItems.length);
    return false;
  }
  
  // Step 5: Check JSON-LD
  const jsonLdScript = document.querySelector('script#jsonld-breadcrumb[type="application/ld+json"]');
  if (jsonLdScript) {
    try {
      const jsonLd = JSON.parse(jsonLdScript.textContent);
      console.log('✅ JSON-LD BreadcrumbList found:', jsonLd.itemListElement.length, 'items');
    } catch (e) {
      console.error('❌ Invalid JSON-LD:', e);
    }
  } else {
    console.warn('⚠️ No JSON-LD BreadcrumbList found');
  }
  
  // Success report
  console.log('\n✅ BREADCRUMB VALIDATION PASSED');
  console.log('📍 Location:', inMain ? 'Main Content' : 'Unknown');
  console.log('📝 Text:', breadcrumbText);
  console.log('🔗 Path:', breadcrumb.querySelectorAll('li').length, 'items');
  
  return true;
}

// Auto-run validation
validateBreadcrumb();

// Test URLs to validate
console.log('\n📋 Pages to test:');
console.log('- /estoque');
console.log('- /carros/[marca]/[modelo]/[ano]-[id]');
console.log('- /blog');
console.log('- /sobre');
console.log('- /financiamento');