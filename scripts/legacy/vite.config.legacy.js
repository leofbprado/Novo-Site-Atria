/* eslint-disable no-undef */
import { defineConfig } from 'vite';
import path from "path";
import purgeCss from 'vite-plugin-purgecss';

const CSP_DEV = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://static.hotjar.com https://script.hotjar.com https://static.cloudflareinsights.com https://js.stripe.com https://m.stripe.com https://cdn.launchdarkly.com https://browser.sentry-cdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://www.google-analytics.com https://px.ads.linkedin.com https://q.stripe.com https://*.fbcdn.net https://*.facebook.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' wss: https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://graph.facebook.com https://connect.facebook.net https://api.stripe.com https://m.stripe.com https://o4509669501698048.ingest.sentry.io https://events.launchdarkly.com https://stream.launchdarkly.com https://api.hotjar.com https://*.hotjar.com; frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://player.vimeo.com https://www.facebook.com; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; upgrade-insecure-requests;`;

export default defineConfig({
  define: {
    'import.meta.env.VITE_CLOUDINARY_CLOUD_NAME': JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
    'import.meta.env.VITE_CLOUDINARY_API_KEY': JSON.stringify(process.env.CLOUDINARY_API_KEY),
    'import.meta.env.VITE_CLOUDINARY_API_SECRET': JSON.stringify(process.env.CLOUDINARY_API_SECRET)
  },

  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },

  plugins: [
    purgeCss({
      content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
      safelist: [
        'collapse','show','active','fade','in',
        'slick-slider','slick-slide','slick-track','slick-current','slick-dots','slick-arrow','slick-prev','slick-next','slick-active','slick-center','slick-initialized',
        'bg-blue-600','bg-blue-700','bg-gray-100','bg-gray-200','bg-black','bg-gradient-to-r','bg-1','bg-2','bg-4-1','bg-7',
        'text-2xl','text-4xl','text-center','text-gray-300','text-gray-400','text-dk','text-font','text-box',
        'mt-5','mb-4','p-4','px-4','py-3','m-2','m-4',
        'container','container-fluid','row','btn','card','modal','navbar','w-full','h-16','d-block','d-flex','justify-content-center','align-items-center',
        'fa','fas','fab','far','fa-solid','fa-brands',
        'fa-angle-down','fa-angle-left','fa-angle-right','fa-angle-up','fa-bars','fa-building','fa-calendar','fa-car','fa-cart-shopping','fa-check','fa-check-circle','fa-circle-check','fa-clock','fa-credit-card','fa-dollar-sign','fa-envelope','fa-facebook-f','fa-google','fa-home','fa-instagram','fa-linkedin-in','fa-location-dot','fa-map-marker-alt','fa-newspaper','fa-phone','fa-play','fa-search','fa-sign-in-alt','fa-sign-out-alt','fa-star','fa-tachometer','fa-thumbs-down','fa-thumbs-up','fa-times','fa-twitter','fa-upload','fa-user','fa-whatsapp',
        'hero-section','header','footer','nav-link','img-fluid','wrapper-invoice','about-inner-one','layout-radius','inventory-section','boxcar-container','boxcar-title-three','breadcrumb','title'
      ]
    }),

    // Mata headers CSP (normal e report-only) no dev
    {
      name: 'atria-kill-csp-headers',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          try { res.removeHeader('Content-Security-Policy'); } catch {}
          try { res.removeHeader('Content-Security-Policy-Report-Only'); } catch {}
          const _setHeader = res.setHeader.bind(res);
          res.setHeader = (k, v) => {
            const key = String(k || '').toLowerCase();
            if (key === 'content-security-policy' || key === 'content-security-policy-report-only') {
              console.warn('⚠️  Bloqueado header CSP (dev):', k, String(v).slice(0,120));
              return;
            }
            return _setHeader(k, v);
          };
          next();
        });
      }
    },

    // Remove metas CSP (normal e report-only) e injeta a nossa
    {
      name: 'atria-csp-dev-meta',
      apply: 'serve',
      transformIndexHtml(html) {
        const cleaned = html
          .replace(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>\s*/gi, '')
          .replace(/<meta[^>]+http-equiv=["']Content-Security-Policy-Report-Only["'][^>]*>\s*/gi, '');
        return cleaned.replace(/<\/head>/i, `  <meta http-equiv="Content-Security-Policy" content="${CSP_DEV}">\n</head>`);
      }
    },

    {
      name: 'critical-css-vite-plugin',
      closeBundle() {
        console.log('🎯 Build concluído - CSS crítico será processado via script separado');
        console.log('💡 Execute workflow "Build with Critical CSS" para build otimizado');
      }
    }
  ],

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

  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: ['all','.replit.dev','.replit.app','d2266e1b-31d5-44a3-b657-a3c9069ad848-00-2sp7joi2ur5w6.riker.replit.dev'],
    proxy: {
      '/openai': { target: 'http://localhost:80', changeOrigin: true },
      '/api/lead': { target: 'http://localhost:80', changeOrigin: true },
      '/api/webhook/credere': { target: 'http://localhost:80', changeOrigin: true }
    }
  },

  preview: { host: '0.0.0.0', port: 4173 },

  build: {
    sourcemap: true,
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      treeshake: false,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('firebase')) return 'lazy-firebase';
            if (id.includes('chart.js') || id.includes('react-chartjs')) return 'lazy-charts';
            if (id.includes('xlsx')) return 'lazy-xlsx';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('bootstrap') || id.includes('@popperjs/core')) return 'vendor-bootstrap';
            if (id.includes('react-slick') || id.includes('slick-carousel')) return 'vendor-slick';
            if (id.includes('photoswipe') || id.includes('react-photoswipe')) return 'vendor-gallery';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-modal-video')) return 'vendor-modal';
            return 'vendor-misc';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) extType = 'images';
          else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) extType = 'fonts';
          return `assets/${extType}/[name]-[hash][extname]`;
        }
      }
    },
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true, pure_funcs: ['console.log','console.info','console.debug'], dead_code: true, unused: true, reduce_vars: true, collapse_vars: true },
      mangle: { safari10: true }
    },
    chunkSizeWarningLimit: 1000,
    target: ['es2020','chrome80','firefox78','safari14']
  },

  css: { devSourcemap: false, postcss: { plugins: [] } }
});
