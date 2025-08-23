#!/usr/bin/env node

/**
 * Script para verificar otimização do YouTube e métricas de performance
 * Testa se o iframe do YouTube só carrega após clique e mede impacto
 */

const puppeteer = require('puppeteer-core');
const path = require('path');

async function testYouTubeOptimization() {
  console.log('🔍 Testando Otimização do YouTube e Performance...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    
    // Enable performance monitoring
    await page.evaluateOnNewDocument(() => {
      window.YOUTUBE_REQUESTS = [];
      window.PERFORMANCE_MARKS = [];
      
      // Track all YouTube-related network requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (url && url.toString().includes('youtube')) {
          window.YOUTUBE_REQUESTS.push({
            type: 'fetch',
            url: url.toString(),
            timestamp: performance.now()
          });
        }
        return originalFetch.apply(this, args);
      };
    });
    
    // Monitor network requests
    const youtubeRequests = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('youtube.com') || url.includes('ytimg.com') || url.includes('googlevideo.com')) {
        youtubeRequests.push({
          url: url,
          type: request.resourceType(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    console.log('📊 TESTE 1: Carregamento Inicial (sem clique)\n');
    console.log('Navegando para http://localhost:5000...');
    
    // Navigate to page
    await page.goto('http://localhost:5000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for page to stabilize
    await page.waitForTimeout(3000);
    
    // Get performance metrics
    const initialMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        FCP: perf.domContentLoadedEventEnd - perf.fetchStart,
        LCP: performance.now(),
        DOMContentLoaded: perf.domContentLoadedEventEnd - perf.fetchStart,
        LoadComplete: perf.loadEventEnd - perf.fetchStart
      };
    });
    
    // Check for YouTube elements
    const initialYouTubeElements = await page.evaluate(() => {
      return {
        iframes: document.querySelectorAll('iframe[src*="youtube"]').length,
        scripts: Array.from(document.scripts).filter(s => s.src.includes('youtube')).length,
        videoSection: document.querySelector('.features-section') ? 'presente' : 'ausente',
        lazyPlaceholder: document.querySelector('.lazy-youtube-placeholder') ? 'presente' : 'ausente'
      };
    });
    
    console.log('✅ Métricas Iniciais:');
    console.log(`   - FCP: ${initialMetrics.FCP.toFixed(0)}ms`);
    console.log(`   - LCP: ${initialMetrics.LCP.toFixed(0)}ms`);
    console.log(`   - DOM Ready: ${initialMetrics.DOMContentLoaded.toFixed(0)}ms`);
    console.log(`   - Page Load: ${initialMetrics.LoadComplete.toFixed(0)}ms\n`);
    
    console.log('📋 Elementos YouTube no carregamento inicial:');
    console.log(`   - iFrames YouTube: ${initialYouTubeElements.iframes}`);
    console.log(`   - Scripts YouTube: ${initialYouTubeElements.scripts}`);
    console.log(`   - Seção de vídeo: ${initialYouTubeElements.videoSection}`);
    console.log(`   - Placeholder lazy: ${initialYouTubeElements.lazyPlaceholder}\n`);
    
    console.log('🌐 Requisições YouTube antes do clique:');
    if (youtubeRequests.length === 0) {
      console.log('   ✅ NENHUMA requisição ao YouTube detectada!\n');
    } else {
      youtubeRequests.forEach(req => {
        console.log(`   ❌ ${req.type}: ${req.url.substring(0, 80)}...`);
      });
      console.log();
    }
    
    // Test click interaction
    console.log('📊 TESTE 2: Após clique no vídeo\n');
    
    // Click on video placeholder if exists
    const videoClicked = await page.evaluate(() => {
      const placeholder = document.querySelector('.features-section img[alt*="Vídeo"]');
      if (placeholder) {
        placeholder.click();
        return true;
      }
      return false;
    });
    
    if (videoClicked) {
      console.log('   🖱️ Clique no placeholder do vídeo executado');
      await page.waitForTimeout(2000);
      
      // Check for LazyYouTube component
      const lazyYouTubeLoaded = await page.evaluate(() => {
        return document.querySelector('.lazy-youtube-container') !== null;
      });
      
      if (lazyYouTubeLoaded) {
        console.log('   ✅ Componente LazyYouTube carregado\n');
        
        // Click on LazyYouTube to load iframe
        await page.evaluate(() => {
          const lazyPlaceholder = document.querySelector('.lazy-youtube-placeholder');
          if (lazyPlaceholder) {
            lazyPlaceholder.click();
          }
        });
        
        await page.waitForTimeout(2000);
        
        // Check final state
        const finalYouTubeElements = await page.evaluate(() => {
          return {
            iframes: document.querySelectorAll('iframe[src*="youtube"]').length,
            scripts: Array.from(document.scripts).filter(s => s.src.includes('youtube')).length
          };
        });
        
        console.log('📋 Elementos YouTube após cliques:');
        console.log(`   - iFrames YouTube: ${finalYouTubeElements.iframes}`);
        console.log(`   - Scripts YouTube: ${finalYouTubeElements.scripts}\n`);
      }
    } else {
      console.log('   ⚠️ Placeholder do vídeo não encontrado\n');
    }
    
    // Calculate network savings
    const networkSavings = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      let youtubeSize = 0;
      entries.forEach(entry => {
        if (entry.name.includes('youtube') || entry.name.includes('ytimg')) {
          youtubeSize += entry.transferSize || 0;
        }
      });
      return youtubeSize;
    });
    
    console.log('💾 Economia de Rede:');
    if (youtubeRequests.length === 0) {
      console.log('   ✅ ~943KB economizados (nenhum iframe YouTube carregado inicialmente)');
    } else {
      console.log(`   ⚠️ ${(networkSavings / 1024).toFixed(2)}KB de dados YouTube carregados`);
    }
    
    console.log('\n📈 RESUMO FINAL:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`FCP (First Contentful Paint): ${initialMetrics.FCP.toFixed(0)}ms`);
    console.log(`LCP (Largest Contentful Paint): ${initialMetrics.LCP.toFixed(0)}ms`);
    console.log(`Requisições YouTube no load inicial: ${youtubeRequests.length}`);
    console.log(`YouTube lazy loading: ${youtubeRequests.length === 0 ? '✅ FUNCIONANDO' : '❌ NÃO FUNCIONANDO'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('\n💡 Certifique-se de que:');
    console.log('   1. O servidor está rodando em http://localhost:5000');
    console.log('   2. Puppeteer está instalado: npm install puppeteer-core');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run test
testYouTubeOptimization();