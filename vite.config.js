/* eslint-disable no-undef */
import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';
import path from "path";
import purgeCss from 'vite-plugin-purgecss';

export default defineConfig({
  // Configurar variáveis de ambiente para Cloudinary
  define: {
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
    'import.meta.env.VITE_CLOUDINARY_API_KEY': JSON.stringify(process.env.CLOUDINARY_API_KEY),
    'import.meta.env.VITE_CLOUDINARY_API_SECRET': JSON.stringify(process.env.CLOUDINARY_API_SECRET)
  },
  
  // Configurar esbuild para processar JSX sem plugin React
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    // jsxInject removido pois os arquivos já importam React
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  
  plugins: [
    // react(), // Temporariamente desabilitado
    
    // PurgeCSS oficial com safelist ultra-específica baseada no uso real
    purgeCss({
      content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}'
      ],
      safelist: [
        // Bootstrap states essenciais
        'collapse', 'show', 'active', 'fade', 'in',
        
        // Slick carousel classes
        'slick-slider', 'slick-slide', 'slick-track', 'slick-current', 
        'slick-dots', 'slick-arrow', 'slick-prev', 'slick-next',
        'slick-active', 'slick-center', 'slick-initialized',
        
        // Backgrounds específicos realmente usados
        'bg-blue-600', 'bg-blue-700', 'bg-gray-100', 'bg-gray-200', 'bg-black', 
        'bg-gradient-to-r', 'bg-1', 'bg-2', 'bg-4-1', 'bg-7',
        
        // Text classes específicas realmente usadas
        'text-2xl', 'text-4xl', 'text-center', 'text-gray-300', 'text-gray-400',
        'text-dk', 'text-font', 'text-box',
        
        // Spacing apenas os essenciais (limitados)
        'mt-5', 'mb-4', 'p-4', 'px-4', 'py-3', 'm-2', 'm-4',
        
        // Bootstrap core apenas essencial
        'container', 'container-fluid', 'row', 'btn', 'card', 'modal', 'navbar',
        'w-full', 'h-16', 'd-block', 'd-flex', 'justify-content-center', 'align-items-center',
        
        // Font Awesome APENAS os 38 ícones realmente usados
        'fa', 'fas', 'fab', 'far', 'fa-solid', 'fa-brands',
        'fa-angle-down', 'fa-angle-left', 'fa-angle-right', 'fa-angle-up',
        'fa-bars', 'fa-building', 'fa-calendar', 'fa-car', 'fa-cart-shopping',
        'fa-check', 'fa-check-circle', 'fa-circle-check', 'fa-clock',
        'fa-credit-card', 'fa-dollar-sign', 'fa-envelope',
        'fa-facebook-f', 'fa-google', 'fa-home', 'fa-instagram', 'fa-linkedin-in',
        'fa-location-dot', 'fa-map-marker-alt', 'fa-newspaper', 'fa-phone', 'fa-play',
        'fa-search', 'fa-sign-in-alt', 'fa-sign-out-alt', 'fa-star', 'fa-tachometer',
        'fa-thumbs-down', 'fa-thumbs-up', 'fa-times', 'fa-twitter', 'fa-upload',
        'fa-user', 'fa-whatsapp',
        
        // Layout crítico
        'hero-section', 'header', 'footer', 'nav-link', 'img-fluid',
        'wrapper-invoice', 'about-inner-one', 'layout-radius', 'inventory-section',
        'boxcar-container', 'boxcar-title-three', 'breadcrumb', 'title'
      ]
    }),
    
    // Plugin personalizado para critical CSS integrado ao build
    {
      name: 'critical-css-vite-plugin',
      closeBundle() {
        // Executa após o build estar completo
        console.log('🎯 Build concluído - CSS crítico será processado via script separado');
        console.log('💡 Execute workflow "Build with Critical CSS" para build otimizado');
      }
    }
  ],
  
  // Resolve aliases para imports limpos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  
  // Configurações de servidor de desenvolvimento
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: [
      'all',
      '.replit.dev',
      '.replit.app',
      'd2266e1b-31d5-44a3-b657-a3c9069ad848-00-2sp7joi2ur5w6.riker.replit.dev'
    ],
    proxy: {
      '/openai': {
        target: 'http://localhost:80',
        changeOrigin: true
      },
      '/api/lead': {
        target: 'http://localhost:80',
        changeOrigin: true
      },
      '/api/webhook/credere': {
        target: 'http://localhost:80',
        changeOrigin: true
      }
    }
  },
  
  // Preview server configuration
  preview: {
    host: '0.0.0.0',
    port: 4173
  },
  
  // Configurações otimizadas para performance de build
  build: {
    // Habilita source maps para depuração
    sourcemap: true,
    // Preservar React para evitar erros de useLayoutEffect
    commonjsOptions: {
      transformMixedEsModules: true
    },
    // Code splitting conservador para evitar problemas com React
    rollupOptions: {
      // Tree shaking limitado para evitar problemas
      treeshake: false,
      output: {
        // Separação otimizada de vendors - LAZY LOADING STRATEGY
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React ecosystem (CRÍTICO - sempre carregado)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // 🔥 LAZY VENDORS - Removidos do bundle inicial
            // Firebase - APENAS para lazy components (Admin, etc)
            if (id.includes('firebase')) {
              return 'lazy-firebase';
            }
            // Charts - APENAS para calculadora/admin lazy
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'lazy-charts';
            }
            // XLSX - APENAS para admin lazy
            if (id.includes('xlsx')) {
              return 'lazy-xlsx';
            }
            
            // ✅ VENDORS NECESSÁRIOS (podem ficar em chunks menores)
            // Animações (usado em hero - manter)
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Bootstrap e Popper (usado globalmente)
            if (id.includes('bootstrap') || id.includes('@popperjs/core')) {
              return 'vendor-bootstrap';
            }
            // Slick carousel (usado em componentes lazy)
            if (id.includes('react-slick') || id.includes('slick-carousel')) {
              return 'vendor-slick';
            }
            // PhotoSwipe gallery (usado em lazy components)
            if (id.includes('photoswipe') || id.includes('react-photoswipe')) {
              return 'vendor-gallery';
            }
            // Ícones (usado em header)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Modal e vídeo (lazy)
            if (id.includes('react-modal-video')) {
              return 'vendor-modal';
            }
            // Outros vendors menores
            return 'vendor-misc';
          }
        },
        // Assets naming para cache busting otimizado
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        }
      }
    },
    
    // CSS code splitting para critical CSS strategy
    cssCodeSplit: true,
    
    // Minificação otimizada e agressiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        dead_code: true,
        unused: true,
        reduce_vars: true,
        collapse_vars: true
      },
      mangle: {
        safari10: true
      }
    },
    
    // Chunk size optimization
    chunkSizeWarningLimit: 1000,
    
    // Target browsers modernos para melhor performance
    target: ['es2020', 'chrome80', 'firefox78', 'safari14']
  },
  
  // Configurações de CSS otimizadas
  css: {
    devSourcemap: false, // Desabilita sourcemaps CSS em prod
    postcss: {
      plugins: [
        // AutoPrefixer já incluído via dependencies
      ]
    }
  }
});