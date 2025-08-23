/**
 * Performance Report Generator
 * Gera relatório detalhado das otimizações implementadas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceReporter {
  constructor() {
    this.distPath = path.resolve(__dirname, '../dist');
    this.results = {
      timestamp: new Date().toISOString(),
      optimizations: [],
      metrics: {},
      recommendations: []
    };
  }

  generateReport() {
    console.log('📊 Gerando relatório de performance...\n');

    this.analyzeCSS();
    this.analyzeJS();
    this.analyzeCompression();
    this.calculateScores();
    this.generateSummary();

    // Salvar relatório
    fs.writeFileSync(
      path.join(this.distPath, 'performance-report.json'),
      JSON.stringify(this.results, null, 2)
    );

    console.log('\n📄 Relatório salvo em: dist/performance-report.json');
  }

  analyzeCSS() {
    const indexPath = path.join(this.distPath, 'index.html');
    if (!fs.existsSync(indexPath)) return;

    const html = fs.readFileSync(indexPath, 'utf8');
    
    // Verificar CSS crítico inline
    const criticalCSS = html.match(/<style id="critical-css">(.*?)<\/style>/s);
    if (criticalCSS) {
      const cssSize = Buffer.byteLength(criticalCSS[1], 'utf8');
      this.results.metrics.criticalCSSSize = (cssSize / 1024).toFixed(2) + ' KB';
      
      this.results.optimizations.push({
        type: 'Critical CSS',
        status: 'Implementado',
        impact: 'Alto',
        description: `CSS crítico inline de ${(cssSize / 1024).toFixed(2)}KB para renderização imediata`
      });
    }

    // Verificar CSS assíncrono
    const asyncCSS = html.match(/rel="preload".*?as="style"/g);
    if (asyncCSS) {
      this.results.optimizations.push({
        type: 'Async CSS Loading', 
        status: 'Implementado',
        impact: 'Alto',
        description: `${asyncCSS.length} arquivos CSS carregados assincronamente`
      });
    }
  }

  analyzeJS() {
    const assetsPath = path.join(this.distPath, 'assets');
    if (!fs.existsSync(assetsPath)) return;

    const jsFiles = fs.readdirSync(assetsPath)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const stats = fs.statSync(path.join(assetsPath, file));
        return {
          name: file,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2)
        };
      })
      .sort((a, b) => b.size - a.size);

    this.results.metrics.jsFiles = jsFiles.length;
    this.results.metrics.totalJSSize = (jsFiles.reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(2) + ' KB';
    this.results.metrics.largestBundle = jsFiles[0] ? jsFiles[0].sizeKB + ' KB' : 'N/A';

    // Verificar code splitting
    const chunks = jsFiles.filter(file => 
      file.name.includes('vendor-') || file.name.includes('app-')
    );

    if (chunks.length > 3) {
      this.results.optimizations.push({
        type: 'Code Splitting',
        status: 'Implementado',
        impact: 'Alto',
        description: `${chunks.length} chunks separados para cache otimizado`
      });
    }
  }

  analyzeCompression() {
    const assetsPath = path.join(this.distPath, 'assets');
    if (!fs.existsSync(assetsPath)) return;

    const compressedFiles = fs.readdirSync(assetsPath, { recursive: true })
      .filter(file => file.toString().endsWith('.gz'));

    if (compressedFiles.length > 0) {
      this.results.optimizations.push({
        type: 'Gzip Compression',
        status: 'Implementado', 
        impact: 'Médio',
        description: `${compressedFiles.length} arquivos comprimidos com Gzip`
      });
    }

    // Verificar Service Worker
    const swPath = path.join(this.distPath, 'sw.js');
    if (fs.existsSync(swPath)) {
      this.results.optimizations.push({
        type: 'Service Worker',
        status: 'Implementado',
        impact: 'Alto',
        description: 'Cache estratégico e funcionalidade offline'
      });
    }
  }

  calculateScores() {
    let score = 100;
    
    // Penalizar por tamanho de JS
    const totalJS = parseFloat(this.results.metrics.totalJSSize);
    if (totalJS > 2000) score -= 30; // -30 para > 2MB
    else if (totalJS > 1000) score -= 15; // -15 para > 1MB
    else if (totalJS > 500) score -= 5; // -5 para > 500KB

    // Bonificar otimizações
    const optimizations = this.results.optimizations.length;
    score += Math.min(optimizations * 5, 25); // +5 por otimização, max +25

    this.results.metrics.estimatedScore = Math.max(0, Math.min(100, Math.round(score)));
  }

  generateSummary() {
    const score = this.results.metrics.estimatedScore;
    
    console.log('🎯 RESUMO DE PERFORMANCE');
    console.log('=' .repeat(50));
    console.log(`Score estimado: ${score}/100`);
    
    if (score >= 90) {
      console.log('🟢 EXCELENTE - Performance otimizada');
      this.results.metrics.status = 'Excelente';
    } else if (score >= 70) {
      console.log('🟡 BOA - Algumas melhorias possíveis');
      this.results.metrics.status = 'Boa';
    } else if (score >= 50) {
      console.log('🟠 MODERADA - Otimizações necessárias');
      this.results.metrics.status = 'Moderada';
    } else {
      console.log('🔴 CRÍTICA - Otimização urgente');
      this.results.metrics.status = 'Crítica';
    }

    console.log('\n📈 MÉTRICAS PRINCIPAIS:');
    console.log(`• CSS Crítico: ${this.results.metrics.criticalCSSSize || 'N/A'}`);
    console.log(`• Total JS: ${this.results.metrics.totalJSSize || 'N/A'}`);
    console.log(`• Maior Bundle: ${this.results.metrics.largestBundle || 'N/A'}`);
    console.log(`• Arquivos JS: ${this.results.metrics.jsFiles || 0}`);

    console.log('\n✅ OTIMIZAÇÕES IMPLEMENTADAS:');
    this.results.optimizations.forEach(opt => {
      console.log(`• ${opt.type}: ${opt.description}`);
    });

    // Gerar recomendações
    if (score < 80) {
      this.results.recommendations.push(
        'Considere implementar lazy loading para componentes não críticos'
      );
    }
    
    if (parseFloat(this.results.metrics.totalJSSize) > 1000) {
      this.results.recommendations.push(
        'Bundle JS ainda grande - implemente route-based code splitting'
      );
    }

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMENDAÇÕES ADICIONAIS:');
      this.results.recommendations.forEach(rec => {
        console.log(`• ${rec}`);
      });
    }
  }
}

const reporter = new PerformanceReporter();
reporter.generateReport();