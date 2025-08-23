/**
 * Bundle Analyzer - Átria Veículos
 * Analisa e otimiza os bundles gerados para identificar oportunidades de melhoria
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BundleAnalyzer {
  constructor() {
    this.distPath = path.resolve(__dirname, '../dist');
    this.assetsPath = path.join(this.distPath, 'assets');
  }

  analyze() {
    console.log('📊 Analisando bundles de produção...\n');

    if (!fs.existsSync(this.assetsPath)) {
      console.error('❌ Pasta dist/assets não encontrada. Execute npm run build primeiro.');
      return;
    }

    const files = fs.readdirSync(this.assetsPath, { withFileTypes: true });
    const assets = {
      js: [],
      css: [],
      images: [],
      fonts: [],
      other: []
    };

    // Catalogar todos os assets
    files.forEach(file => {
      if (file.isFile()) {
        const fullPath = path.join(this.assetsPath, file.name);
        const stats = fs.statSync(fullPath);
        const asset = {
          name: file.name,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2)
        };

        if (file.name.endsWith('.js')) {
          assets.js.push(asset);
        } else if (file.name.endsWith('.css')) {
          assets.css.push(asset);
        } else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file.name)) {
          assets.images.push(asset);
        } else if (/\.(woff|woff2|ttf|eot)$/i.test(file.name)) {
          assets.fonts.push(asset);
        } else {
          assets.other.push(asset);
        }
      }
    });

    // Análise de JS bundles
    console.log('🔍 ANÁLISE DE JAVASCRIPT BUNDLES:');
    console.log('=' .repeat(50));
    
    assets.js.sort((a, b) => b.size - a.size);
    let totalJS = 0;
    
    assets.js.forEach(asset => {
      totalJS += asset.size;
      const status = asset.size > 500000 ? '🔴 GRANDE' : asset.size > 100000 ? '🟡 MÉDIO' : '🟢 OK';
      console.log(`${status} ${asset.name.padEnd(40)} ${asset.sizeKB.padStart(8)} KB`);
    });
    
    console.log('\n📈 Total JS: ' + (totalJS / 1024).toFixed(2) + ' KB');

    // Análise de CSS
    console.log('\n🎨 ANÁLISE DE CSS:');
    console.log('=' .repeat(50));
    
    assets.css.sort((a, b) => b.size - a.size);
    let totalCSS = 0;
    
    assets.css.forEach(asset => {
      totalCSS += asset.size;
      const status = asset.size > 100000 ? '🔴 PESADO' : asset.size > 20000 ? '🟡 MÉDIO' : '🟢 OK';
      console.log(`${status} ${asset.name.padEnd(40)} ${asset.sizeKB.padStart(8)} KB`);
    });
    
    console.log('\n📈 Total CSS: ' + (totalCSS / 1024).toFixed(2) + ' KB');

    // Recomendações baseadas na análise
    console.log('\n💡 RECOMENDAÇÕES DE OTIMIZAÇÃO:');
    console.log('=' .repeat(50));

    // JS recommendations
    const largeJSBundles = assets.js.filter(asset => asset.size > 500000);
    if (largeJSBundles.length > 0) {
      console.log('🔴 CRÍTICO - Bundles JS muito grandes:');
      largeJSBundles.forEach(bundle => {
        console.log(`   • ${bundle.name} (${bundle.sizeKB} KB) - Considere code splitting`);
      });
    }

    // CSS recommendations
    const heavyCSS = assets.css.filter(asset => asset.size > 100000);
    if (heavyCSS.length > 0) {
      console.log('🔴 CRÍTICO - CSS muito pesado:');
      heavyCSS.forEach(css => {
        console.log(`   • ${css.name} (${css.sizeKB} KB) - Implemente critical CSS`);
      });
    }

    // Performance score estimation
    const perfScore = this.calculatePerformanceScore(totalJS, totalCSS);
    console.log('\n🎯 ESTIMATIVA DE PERFORMANCE:');
    console.log('=' .repeat(50));
    console.log(`Score estimado: ${perfScore}/100`);
    
    if (perfScore < 50) {
      console.log('🔴 PERFORMANCE CRÍTICA - Otimização urgente necessária');
    } else if (perfScore < 80) {
      console.log('🟡 PERFORMANCE MODERADA - Melhorias recomendadas');
    } else {
      console.log('🟢 BOA PERFORMANCE - Otimizações menores podem ajudar');
    }

    // Gerar relatório detalhado
    this.generateDetailedReport(assets, totalJS, totalCSS, perfScore);
  }

  calculatePerformanceScore(totalJS, totalCSS) {
    // Algoritmo simplificado baseado nos pesos dos assets
    let score = 100;
    
    // Penalizar JS pesado (cada 100KB = -5 pontos)
    score -= Math.floor(totalJS / 1024 / 100) * 5;
    
    // Penalizar CSS pesado (cada 50KB = -3 pontos)
    score -= Math.floor(totalCSS / 1024 / 50) * 3;
    
    return Math.max(0, Math.min(100, score));
  }

  generateDetailedReport(assets, totalJS, totalCSS, perfScore) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalJS: (totalJS / 1024).toFixed(2) + ' KB',
        totalCSS: (totalCSS / 1024).toFixed(2) + ' KB',
        performanceScore: perfScore,
        totalAssets: assets.js.length + assets.css.length + assets.images.length
      },
      bundles: {
        javascript: assets.js,
        css: assets.css,
        images: assets.images.length,
        fonts: assets.fonts.length
      },
      recommendations: this.generateRecommendations(assets, totalJS, totalCSS)
    };

    fs.writeFileSync(
      path.join(this.distPath, 'bundle-analysis.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Relatório detalhado salvo em: dist/bundle-analysis.json');
  }

  generateRecommendations(assets, totalJS, totalCSS) {
    const recommendations = [];

    if (totalJS > 1000000) { // > 1MB
      recommendations.push({
        type: 'critical',
        category: 'javascript',
        message: 'Bundle JS total excede 1MB - implementar code splitting agressivo'
      });
    }

    if (totalCSS > 200000) { // > 200KB
      recommendations.push({
        type: 'critical',
        category: 'css',
        message: 'CSS total excede 200KB - implementar critical CSS strategy'
      });
    }

    const largeVendorBundles = assets.js.filter(asset => 
      asset.name.includes('vendor') && asset.size > 300000
    );

    if (largeVendorBundles.length > 0) {
      recommendations.push({
        type: 'high',
        category: 'vendor-optimization',
        message: 'Bundles vendor muito grandes - considere tree shaking e lazy loading'
      });
    }

    return recommendations;
  }
}

// Executar análise
const analyzer = new BundleAnalyzer();
analyzer.analyze();