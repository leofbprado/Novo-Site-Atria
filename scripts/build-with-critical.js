/**
 * Build Script com Critical CSS - Átria Veículos
 * 
 * Script que executa:
 * 1. Build do Vite
 * 2. Extração e inlineamento do CSS crítico
 * 3. Otimização para performance
 */

import { spawn } from 'child_process';
import CriticalCSSExtractor from './critical-css-extractor.js';

class BuildWithCritical {
  constructor() {
    this.steps = [
      { name: 'Build Vite', command: 'npm', args: ['run', 'build'] },
      { name: 'Extract Critical CSS', fn: this.extractCriticalCSS.bind(this) }
    ];
  }

  /**
   * Executa comando npm/node
   */
  runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      console.log(`🔄 Executando: ${command} ${args.join(' ')}`);
      
      const process = spawn(command, args, { 
        stdio: 'inherit',
        shell: true 
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${command} concluído com sucesso`);
          resolve();
        } else {
          console.error(`❌ ${command} falhou com código ${code}`);
          reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
        }
      });

      process.on('error', (error) => {
        console.error(`❌ Erro ao executar ${command}:`, error.message);
        reject(error);
      });
    });
  }

  /**
   * Extrai CSS crítico
   */
  async extractCriticalCSS() {
    console.log('🎯 Extraindo CSS crítico...');
    const extractor = new CriticalCSSExtractor();
    const success = await extractor.generateCriticalHTML();
    
    if (!success) {
      throw new Error('Falha na extração do CSS crítico');
    }
    
    console.log('✅ CSS crítico extraído e inlinado');
  }

  /**
   * Executa todo o pipeline de build
   */
  async buildWithCritical() {
    console.log('🚀 Iniciando build com Critical CSS Strategy...\n');
    
    try {
      for (const step of this.steps) {
        console.log(`📋 Executando: ${step.name}`);
        
        if (step.fn) {
          await step.fn();
        } else {
          await this.runCommand(step.command, step.args);
        }
        
        console.log(`✅ ${step.name} concluído\n`);
      }

      console.log('🎉 Build com Critical CSS concluído com sucesso!');
      console.log('📊 Próximos passos:');
      console.log('   • Teste no Lighthouse para verificar FCP');
      console.log('   • Valide que não há FOUC (Flash of Unstyled Content)');
      console.log('   • Verifique se o CSS completo carrega corretamente');

    } catch (error) {
      console.error('❌ Build falhou:', error.message);
      process.exit(1);
    }
  }
}

// Executa quando chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new BuildWithCritical();
  builder.buildWithCritical();
}

export default BuildWithCritical;