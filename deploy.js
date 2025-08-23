#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Preparando deployment para Replit...');

// 1. Verificar se o build existe
if (!fs.existsSync('./dist')) {
  console.log('📦 Executando build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build concluído!');
}

// 2. Iniciar servidor na porta 5000 usando serve
console.log('🌐 Iniciando servidor na porta 5000...');
console.log('📡 Aguardando deployment no Replit Autoscale...');

try {
  execSync('npx serve dist --single --listen 5000', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
} catch (error) {
  console.error('❌ Erro no servidor:', error.message);
  process.exit(1);
}