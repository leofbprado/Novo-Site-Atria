import puppeteer from 'puppeteer';
import fs from 'fs';

async function analyzePerformance() {
  console.log('🚀 Iniciando análise de performance...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Configurar viewport mobile
  await page.setViewport({ width: 375, height: 812 });
  
  // Habilitar coleta de métricas
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = {
      startTime: Date.now(),
      resources: [],
      paints: []
    };
    
    // Observar recursos
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          window.performanceMetrics.resources.push({
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize || 0
          });
        } else if (entry.entryType === 'paint') {
          window.performanceMetrics.paints.push({
            name: entry.name,
            startTime: entry.startTime
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource', 'paint'] });
  });
  
  console.log('📱 Testando performance mobile...');
  
  try {
    // Navegar para a página
    await page.goto('http://localhost:5000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Aguardar um pouco para garantir que tudo carregou
    await page.waitForTimeout(3000);
    
    // Coletar métricas de performance
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paints = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');
      
      // Calcular métricas
      const fcp = paints.find(p => p.name === 'first-contentful-paint');
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
      
      // Recursos por tipo
      const resourcesByType = {};
      resources.forEach(r => {
        if (!resourcesByType[r.initiatorType]) {
          resourcesByType[r.initiatorType] = {
            count: 0,
            totalSize: 0,
            totalDuration: 0
          };
        }
        resourcesByType[r.initiatorType].count++;
        resourcesByType[r.initiatorType].totalSize += r.transferSize || 0;
        resourcesByType[r.initiatorType].totalDuration += r.duration;
      });
      
      // Identificar recursos bloqueantes
      const blockingResources = resources.filter(r => 
        (r.initiatorType === 'script' || r.initiatorType === 'link') &&
        r.startTime < (fcp?.startTime || 1000)
      ).map(r => ({
        url: r.name.split('/').pop(),
        type: r.initiatorType,
        duration: Math.round(r.duration),
        size: Math.round((r.transferSize || 0) / 1024)
      }));
      
      return {
        // Timing metrics
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
        loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
        
        // Core Web Vitals
        fcp: fcp ? Math.round(fcp.startTime) : null,
        lcp: lcp ? Math.round(lcp.startTime) : null,
        
        // Resource metrics
        totalResources: resources.length,
        resourcesByType,
        blockingResources: blockingResources.slice(0, 10), // Top 10 blocking
        
        // CSS específico
        cssResources: resources.filter(r => r.name.includes('.css')).map(r => ({
          url: r.name.split('/').pop(),
          duration: Math.round(r.duration),
          size: Math.round((r.transferSize || 0) / 1024)
        })),
        
        // JS específico
        jsResources: resources.filter(r => r.name.includes('.js')).map(r => ({
          url: r.name.split('/').pop(),
          duration: Math.round(r.duration),
          size: Math.round((r.transferSize || 0) / 1024)
        })).sort((a, b) => b.size - a.size).slice(0, 10) // Top 10 maiores
      };
    });
    
    // Verificar critical CSS
    const criticalCSSInfo = await page.evaluate(() => {
      const inlineStyles = document.querySelectorAll('style');
      let totalInlineSize = 0;
      let criticalFound = false;
      
      inlineStyles.forEach(style => {
        const content = style.textContent;
        totalInlineSize += content.length;
        if (content.includes('critical') || content.includes('above-the-fold')) {
          criticalFound = true;
        }
      });
      
      const asyncCSS = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => 
        link.media === 'print' || link.onload !== null
      );
      
      return {
        inlineStylesCount: inlineStyles.length,
        totalInlineSize: Math.round(totalInlineSize / 1024 * 10) / 10,
        criticalFound,
        asyncCSSCount: asyncCSS.length
      };
    });
    
    // Gerar relatório
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE PERFORMANCE');
    console.log('='.repeat(60));
    
    console.log('\n⚡ Core Web Vitals:');
    console.log(`  FCP (First Contentful Paint): ${metrics.fcp}ms ${metrics.fcp < 1800 ? '✅' : '⚠️'}`);
    console.log(`  LCP (Largest Contentful Paint): ${metrics.lcp}ms ${metrics.lcp < 2500 ? '✅' : '⚠️'}`);
    
    console.log('\n📦 Recursos:');
    console.log(`  Total de recursos: ${metrics.totalResources}`);
    Object.entries(metrics.resourcesByType).forEach(([type, data]) => {
      console.log(`  ${type}: ${data.count} arquivos, ${Math.round(data.totalSize / 1024)}KB`);
    });
    
    console.log('\n🚫 Recursos Bloqueantes (antes do FCP):');
    if (metrics.blockingResources.length === 0) {
      console.log('  Nenhum recurso bloqueante significativo! ✅');
    } else {
      metrics.blockingResources.forEach(r => {
        console.log(`  ${r.url} (${r.type}, ${r.size}KB, ${r.duration}ms)`);
      });
    }
    
    console.log('\n💅 Critical CSS:');
    console.log(`  Styles inline: ${criticalCSSInfo.inlineStylesCount}`);
    console.log(`  Tamanho inline total: ${criticalCSSInfo.totalInlineSize}KB`);
    console.log(`  CSS assíncrono: ${criticalCSSInfo.asyncCSSCount} arquivos`);
    console.log(`  Critical CSS detectado: ${criticalCSSInfo.criticalFound ? '✅' : '❌'}`);
    
    console.log('\n📈 Top 5 JavaScript (por tamanho):');
    metrics.jsResources.slice(0, 5).forEach(js => {
      console.log(`  ${js.url}: ${js.size}KB (${js.duration}ms)`);
    });
    
    console.log('\n🎯 Recomendações:');
    const recommendations = [];
    
    if (metrics.fcp > 1800) {
      recommendations.push('⚠️ FCP acima de 1.8s - reduzir JavaScript inicial');
    }
    if (metrics.lcp > 2500) {
      recommendations.push('⚠️ LCP acima de 2.5s - otimizar imagem principal');
    }
    if (criticalCSSInfo.totalInlineSize > 10) {
      recommendations.push('⚠️ CSS inline muito grande - reduzir critical CSS');
    }
    if (metrics.blockingResources.length > 5) {
      recommendations.push('⚠️ Muitos recursos bloqueantes - adicionar defer/async');
    }
    
    if (recommendations.length === 0) {
      console.log('  ✅ Performance está otimizada!');
    } else {
      recommendations.forEach(r => console.log(`  ${r}`));
    }
    
    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      criticalCSS: criticalCSSInfo,
      recommendations
    };
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Relatório completo salvo em: performance-report.json');
    
  } catch (error) {
    console.error('❌ Erro na análise:', error.message);
  } finally {
    await browser.close();
  }
}

analyzePerformance().catch(console.error);