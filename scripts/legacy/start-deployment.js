#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando processo de deployment...');

// 1. Verificar se o build existe
const distPath = './dist';
if (!fs.existsSync(distPath)) {
  console.log('📦 Build não encontrado. Executando build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar build:', error);
    process.exit(1);
  }
}

// 2. Iniciar servidor na porta 5000
console.log('🌐 Iniciando servidor na porta 5000...');
try {
  execSync('node deploy-server.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
}