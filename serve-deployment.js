#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';

console.log('🚀 Replit Deployment Server Starting...');

// 1. Verificar se o build existe
if (!fs.existsSync('./dist')) {
  console.log('📦 Build não encontrado, executando build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// 2. Configurar servidor com flags corretas para Replit
console.log('🌐 Starting server on 0.0.0.0:5000...');
console.log('📡 Replit Autoscale Deployment Mode');

// Spawn serve com configuração específica para Replit
const server = spawn('npx', [
  'serve', 
  'dist', 
  '-l', '0.0.0.0:5000',
  '--single'  // SPA routing
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    HOST: '0.0.0.0',
    PORT: '5000'
  }
});

// Capturar eventos do processo
server.on('spawn', () => {
  console.log('✅ Server process spawned successfully');
  console.log('🎯 Listening on 0.0.0.0:5000');
  console.log('📦 Serving ./dist directory');
  console.log('🔄 SPA mode enabled');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🛑 Server process exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});