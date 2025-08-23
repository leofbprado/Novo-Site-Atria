/**
 * Asset Compression Script
 * Comprime assets adicionais para melhor performance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBrotliCompress, createGzip } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pipelineAsync = promisify(pipeline);

class AssetCompressor {
  constructor() {
    this.distPath = path.resolve(__dirname, '../dist');
  }

  async compressAssets() {
    console.log('🗜️ Comprimindo assets para melhor cache...');
    
    const files = await this.getAllFiles(this.distPath);
    const compressibleFiles = files.filter(file => 
      /\.(js|css|html|json|svg|xml)$/i.test(file) && !file.includes('compressed')
    );

    console.log(`📄 Encontrados ${compressibleFiles.length} arquivos para compressão`);

    for (const file of compressibleFiles) {
      try {
        await this.compressFile(file);
      } catch (error) {
        console.warn(`⚠️ Erro ao comprimir ${file}:`, error.message);
      }
    }

    console.log('✅ Compressão de assets concluída');
  }

  async getAllFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  async compressFile(filePath) {
    const originalSize = fs.statSync(filePath).size;
    
    // Skip arquivos muito pequenos (< 1KB)
    if (originalSize < 1024) return;

    // Compressão Gzip
    try {
      const gzipPath = filePath + '.gz';
      const source = fs.createReadStream(filePath);
      const destination = fs.createWriteStream(gzipPath);
      const gzip = createGzip({ level: 9 });
      
      await pipelineAsync(source, gzip, destination);
      
      const compressedSize = fs.statSync(gzipPath).size;
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      
      console.log(`✓ ${path.basename(filePath)} - ${savings}% menor (${(compressedSize/1024).toFixed(1)}KB)`);
    } catch (error) {
      console.warn(`Gzip failed for ${filePath}:`, error.message);
    }

    // Compressão Brotli (melhor que Gzip)
    try {
      const brotliPath = filePath + '.br';
      const source = fs.createReadStream(filePath);
      const destination = fs.createWriteStream(brotliPath);
      const brotli = createBrotliCompress({
        params: {
          [require('zlib').constants.BROTLI_PARAM_QUALITY]: 11,
          [require('zlib').constants.BROTLI_PARAM_SIZE_HINT]: originalSize
        }
      });
      
      await pipelineAsync(source, brotli, destination);
      
      const brotliSize = fs.statSync(brotliPath).size;
      const brotliSavings = ((originalSize - brotliSize) / originalSize * 100).toFixed(1);
      
      console.log(`✓ ${path.basename(filePath)} (Brotli) - ${brotliSavings}% menor (${(brotliSize/1024).toFixed(1)}KB)`);
    } catch (error) {
      console.warn(`Brotli failed for ${filePath}:`, error.message);
    }
  }
}

const compressor = new AssetCompressor();
compressor.compressAssets().catch(console.error);