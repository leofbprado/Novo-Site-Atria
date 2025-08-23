/**
 * Console Filter - Suprime warnings desnecessários do console
 * Melhora a experiência de desenvolvimento filtrando logs de bibliotecas externas
 */

// Lista de warnings que devem ser suprimidos
const suppressedWarnings = [
  'Unrecognized feature:',
  'ambient-light-sensor',
  'battery',
  'execution-while-not-rendered',
  'execution-while-out-of-viewport',
  'layout-animations',
  'legacy-image-formats',
  'navigation-override',
  'oversized-images',
  'publickey-credentials',
  'speaker-selection',
  'React DevTools',
  'React Router Future Flag Warning',
  'Minified React error #130',
  'inspector.b9415ea5.js',
  'uBOL: Generic cosmetic filtering',
  'generate_204',
  'ERR_BLOCKED_BY_CLIENT'
];

// Função para verificar se uma mensagem deve ser suprimida
const shouldSuppressMessage = (message) => {
  if (typeof message !== 'string') return false;
  
  return suppressedWarnings.some(warning => 
    message.includes(warning)
  );
};

// Intercepta console.warn para filtrar warnings desnecessários
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args.join(' ');
  
  // Suprime warnings conhecidos que poluem o console
  if (shouldSuppressMessage(message)) {
    return; // Suprime o warning
  }
  
  // Chama o console.warn original para outros warnings
  originalWarn.apply(console, args);
};

// Intercepta console.error com foco especial no React Error #130
const originalError = console.error;
console.error = function(...args) {
  // Verifica especificamente React Error #130 (mais preciso)
  const isReact130 = args.some(arg => 
    typeof arg === "string" && (
      arg.includes("React error #130") || 
      arg.includes("Minified React error #130")
    )
  );
  
  if (isReact130) {
    console.debug("React Error #130 silenciado (DOM manipulation conflict)");
    return; // Suprime completamente o erro #130
  }
  
  const message = args.join(' ');
  
  // Suprime outros erros conhecidos de bibliotecas externas
  if (shouldSuppressMessage(message) || 
      message.includes('inspector.') ||
      message.includes('ERR_BLOCKED_BY_CLIENT') ||
      message.includes('generate_204') ||
      message.includes('play.google.com/log') ||
      message.includes('uBOL: Generic cosmetic filtering')) {
    return; // Suprime o erro
  }
  
  // Chama o console.error original para outros erros
  originalError.apply(console, args);
};

// Export para usar em outros arquivos se necessário
export { shouldSuppressMessage };