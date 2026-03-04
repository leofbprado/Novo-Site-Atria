// Breadcrumb testing script for console
// Run this on /estoque page to verify breadcrumb display

// 1) Check if ID exists
const hasId = document.querySelector('#bc-estoque')?.tagName || 'SEM_ID';
console.log('Step 1 - ID check:', hasId);

// 2) Inject hotfix CSS (temporary)
(() => {
  const s = document.getElementById('bc-test') || document.createElement('style');
  s.id = 'bc-test';
  s.textContent = `
#bc-estoque>ol,#bc-estoque>ul{
  display:flex!important; flex-wrap:nowrap!important; align-items:center!important;
  margin:0!important; padding:0!important; list-style:none!important; padding-inline-start:0!important;
}
#bc-estoque>ol>li,#bc-estoque>ul>li{ display:inline-flex!important; align-items:center!important; width:auto!important; max-width:none!important; }
#bc-estoque>ol>li:not(:last-child)::after,#bc-estoque>ul>li:not(:last-child)::after{
  content:"/"!important; display:inline-block!important; margin:0 6px!important; color:#94a3b8!important;
}
#bc-estoque .divider,#bc-estoque .sep{ display:none!important; }
`;
  document.head.appendChild(s);
  console.log('Step 2 - Hotfix CSS injected');
})();

// 3) Re-test layout
(() => {
  const ol = document.querySelector('#bc-estoque > ol, #bc-estoque > ul');
  const li = [...document.querySelectorAll('#bc-estoque > ol > li, #bc-estoque > ul > li')];
  
  if (!ol || li.length === 0) {
    console.log('Step 3 - ERROR: No breadcrumb elements found');
    return;
  }
  
  const result = {
    ol_display: getComputedStyle(ol).display,
    li0_display: li[0] ? getComputedStyle(li[0]).display : 'N/A',
    li1_display: li[1] ? getComputedStyle(li[1]).display : 'N/A',
    after_display: li[0] ? getComputedStyle(li[0], '::after').display : 'N/A',
    text: document.querySelector('#bc-estoque').innerText.replace(/\s+/g, ' ')
  };
  
  console.log('Step 3 - Test results:', result);
  console.log('Expected: ol_display:"flex", li*_display:"inline-flex", after_display:"inline-block"');
  console.log('Text should be: "Início / Estoque de Veículos" on same line');
  
  return result;
})();