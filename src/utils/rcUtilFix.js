// ✅ RC-UTIL FIX: Garantir que React esteja disponível para rc-util
import React from 'react';

// Garantir que React esteja globalmente disponível ANTES de qualquer coisa
if (typeof window !== 'undefined') {
  window.React = React;
  
  // Patch específico para rc-util useLayoutEffect
  if (!React.useLayoutEffect) {
    React.useLayoutEffect = React.useEffect;
  }
  
  // Garantir que o React esteja no global object também
  if (typeof global !== 'undefined') {
    global.React = React;
  }
}

// SSR compatibility fix
if (typeof window === "undefined") {
  React.useLayoutEffect = React.useEffect;
}

console.log('✅ RC-Util React Fix aplicado');