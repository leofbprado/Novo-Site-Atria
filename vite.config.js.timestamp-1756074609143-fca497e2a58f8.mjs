// vite.config.js
import { defineConfig } from "file:///home/runner/workspace/node_modules/vite/dist/node/index.js";
import path from "path";
import purgeCss from "file:///home/runner/workspace/node_modules/vite-plugin-purgecss/dist/index.mjs";
var __vite_injected_original_dirname = "/home/runner/workspace";
var vite_config_default = defineConfig({
  // Configurar variáveis de ambiente para Cloudinary
  define: {
    "import.meta.env.VITE_CLOUDINARY_CLOUD_NAME": JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME),
    "import.meta.env.VITE_CLOUDINARY_API_KEY": JSON.stringify(process.env.CLOUDINARY_API_KEY),
    "import.meta.env.VITE_CLOUDINARY_API_SECRET": JSON.stringify(process.env.CLOUDINARY_API_SECRET)
  },
  // Configurar esbuild para processar JSX sem plugin React
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
    // jsxInject removido pois os arquivos já importam React
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment"
  },
  plugins: [
    // react(), // Temporariamente desabilitado
    // PurgeCSS oficial com safelist ultra-específica baseada no uso real
    purgeCss({
      content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
      ],
      safelist: [
        // Bootstrap states essenciais
        "collapse",
        "show",
        "active",
        "fade",
        "in",
        // Slick carousel classes
        "slick-slider",
        "slick-slide",
        "slick-track",
        "slick-current",
        "slick-dots",
        "slick-arrow",
        "slick-prev",
        "slick-next",
        "slick-active",
        "slick-center",
        "slick-initialized",
        // Backgrounds específicos realmente usados
        "bg-blue-600",
        "bg-blue-700",
        "bg-gray-100",
        "bg-gray-200",
        "bg-black",
        "bg-gradient-to-r",
        "bg-1",
        "bg-2",
        "bg-4-1",
        "bg-7",
        // Text classes específicas realmente usadas
        "text-2xl",
        "text-4xl",
        "text-center",
        "text-gray-300",
        "text-gray-400",
        "text-dk",
        "text-font",
        "text-box",
        // Spacing apenas os essenciais (limitados)
        "mt-5",
        "mb-4",
        "p-4",
        "px-4",
        "py-3",
        "m-2",
        "m-4",
        // Bootstrap core apenas essencial
        "container",
        "container-fluid",
        "row",
        "btn",
        "card",
        "modal",
        "navbar",
        "w-full",
        "h-16",
        "d-block",
        "d-flex",
        "justify-content-center",
        "align-items-center",
        // Font Awesome APENAS os 38 ícones realmente usados
        "fa",
        "fas",
        "fab",
        "far",
        "fa-solid",
        "fa-brands",
        "fa-angle-down",
        "fa-angle-left",
        "fa-angle-right",
        "fa-angle-up",
        "fa-bars",
        "fa-building",
        "fa-calendar",
        "fa-car",
        "fa-cart-shopping",
        "fa-check",
        "fa-check-circle",
        "fa-circle-check",
        "fa-clock",
        "fa-credit-card",
        "fa-dollar-sign",
        "fa-envelope",
        "fa-facebook-f",
        "fa-google",
        "fa-home",
        "fa-instagram",
        "fa-linkedin-in",
        "fa-location-dot",
        "fa-map-marker-alt",
        "fa-newspaper",
        "fa-phone",
        "fa-play",
        "fa-search",
        "fa-sign-in-alt",
        "fa-sign-out-alt",
        "fa-star",
        "fa-tachometer",
        "fa-thumbs-down",
        "fa-thumbs-up",
        "fa-times",
        "fa-twitter",
        "fa-upload",
        "fa-user",
        "fa-whatsapp",
        // Layout crítico
        "hero-section",
        "header",
        "footer",
        "nav-link",
        "img-fluid",
        "wrapper-invoice",
        "about-inner-one",
        "layout-radius",
        "inventory-section",
        "boxcar-container",
        "boxcar-title-three",
        "breadcrumb",
        "title"
      ]
    }),
    // Plugin personalizado para critical CSS integrado ao build
    {
      name: "critical-css-vite-plugin",
      closeBundle() {
        console.log("\u{1F3AF} Build conclu\xEDdo - CSS cr\xEDtico ser\xE1 processado via script separado");
        console.log('\u{1F4A1} Execute workflow "Build with Critical CSS" para build otimizado');
      }
    }
  ],
  // Resolve aliases para imports limpos
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@components": path.resolve(__vite_injected_original_dirname, "./src/components"),
      "@layouts": path.resolve(__vite_injected_original_dirname, "./src/layouts"),
      "@pages": path.resolve(__vite_injected_original_dirname, "./src/pages"),
      "@utils": path.resolve(__vite_injected_original_dirname, "./src/utils"),
      "@assets": path.resolve(__vite_injected_original_dirname, "./src/assets")
    }
  },
  // Configurações de servidor de desenvolvimento
  server: {
    host: "0.0.0.0",
    port: 5e3,
    allowedHosts: [
      "all",
      ".replit.dev",
      ".replit.app",
      "d2266e1b-31d5-44a3-b657-a3c9069ad848-00-2sp7joi2ur5w6.riker.replit.dev"
    ],
    proxy: {
      "/openai": {
        target: "http://localhost:80",
        changeOrigin: true
      },
      "/api/lead": {
        target: "http://localhost:80",
        changeOrigin: true
      },
      "/api/webhook/credere": {
        target: "http://localhost:80",
        changeOrigin: true
      }
    }
  },
  // Preview server configuration
  preview: {
    host: "0.0.0.0",
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
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react";
            }
            if (id.includes("firebase")) {
              return "lazy-firebase";
            }
            if (id.includes("chart.js") || id.includes("react-chartjs")) {
              return "lazy-charts";
            }
            if (id.includes("xlsx")) {
              return "lazy-xlsx";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("bootstrap") || id.includes("@popperjs/core")) {
              return "vendor-bootstrap";
            }
            if (id.includes("react-slick") || id.includes("slick-carousel")) {
              return "vendor-slick";
            }
            if (id.includes("photoswipe") || id.includes("react-photoswipe")) {
              return "vendor-gallery";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("react-modal-video")) {
              return "vendor-modal";
            }
            return "vendor-misc";
          }
        },
        // Assets naming para cache busting otimizado
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          let extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            extType = "images";
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = "fonts";
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        }
      }
    },
    // CSS code splitting para critical CSS strategy
    cssCodeSplit: true,
    // Minificação otimizada e agressiva
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.log em produção
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
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
    chunkSizeWarningLimit: 1e3,
    // Target browsers modernos para melhor performance
    target: ["es2020", "chrome80", "firefox78", "safari14"]
  },
  // Configurações de CSS otimizadas
  css: {
    devSourcemap: false,
    // Desabilita sourcemaps CSS em prod
    postcss: {
      plugins: [
        // AutoPrefixer já incluído via dependencies
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3Jrc3BhY2Uvdml0ZS5jb25maWcuanNcIjsvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG4vLyBpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgcHVyZ2VDc3MgZnJvbSAndml0ZS1wbHVnaW4tcHVyZ2Vjc3MnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAvLyBDb25maWd1cmFyIHZhcmlcdTAwRTF2ZWlzIGRlIGFtYmllbnRlIHBhcmEgQ2xvdWRpbmFyeVxuICBkZWZpbmU6IHtcbiAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfQ0xPVURJTkFSWV9DTE9VRF9OQU1FJzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuQ0xPVURJTkFSWV9DTE9VRF9OQU1FKSxcbiAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfQ0xPVURJTkFSWV9BUElfS0VZJzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuQ0xPVURJTkFSWV9BUElfS0VZKSxcbiAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfQ0xPVURJTkFSWV9BUElfU0VDUkVUJzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuQ0xPVURJTkFSWV9BUElfU0VDUkVUKVxuICB9LFxuICBcbiAgLy8gQ29uZmlndXJhciBlc2J1aWxkIHBhcmEgcHJvY2Vzc2FyIEpTWCBzZW0gcGx1Z2luIFJlYWN0XG4gIGVzYnVpbGQ6IHtcbiAgICBsb2FkZXI6ICdqc3gnLFxuICAgIGluY2x1ZGU6IC9zcmNcXC8uKlxcLltqdF1zeD8kLyxcbiAgICBleGNsdWRlOiBbXSxcbiAgICAvLyBqc3hJbmplY3QgcmVtb3ZpZG8gcG9pcyBvcyBhcnF1aXZvcyBqXHUwMEUxIGltcG9ydGFtIFJlYWN0XG4gICAganN4RmFjdG9yeTogJ1JlYWN0LmNyZWF0ZUVsZW1lbnQnLFxuICAgIGpzeEZyYWdtZW50OiAnUmVhY3QuRnJhZ21lbnQnXG4gIH0sXG4gIFxuICBwbHVnaW5zOiBbXG4gICAgLy8gcmVhY3QoKSwgLy8gVGVtcG9yYXJpYW1lbnRlIGRlc2FiaWxpdGFkb1xuICAgIFxuICAgIC8vIFB1cmdlQ1NTIG9maWNpYWwgY29tIHNhZmVsaXN0IHVsdHJhLWVzcGVjXHUwMEVEZmljYSBiYXNlYWRhIG5vIHVzbyByZWFsXG4gICAgcHVyZ2VDc3Moe1xuICAgICAgY29udGVudDogW1xuICAgICAgICAnLi9pbmRleC5odG1sJyxcbiAgICAgICAgJy4vc3JjLyoqLyoue2pzLGpzeCx0cyx0c3h9J1xuICAgICAgXSxcbiAgICAgIHNhZmVsaXN0OiBbXG4gICAgICAgIC8vIEJvb3RzdHJhcCBzdGF0ZXMgZXNzZW5jaWFpc1xuICAgICAgICAnY29sbGFwc2UnLCAnc2hvdycsICdhY3RpdmUnLCAnZmFkZScsICdpbicsXG4gICAgICAgIFxuICAgICAgICAvLyBTbGljayBjYXJvdXNlbCBjbGFzc2VzXG4gICAgICAgICdzbGljay1zbGlkZXInLCAnc2xpY2stc2xpZGUnLCAnc2xpY2stdHJhY2snLCAnc2xpY2stY3VycmVudCcsIFxuICAgICAgICAnc2xpY2stZG90cycsICdzbGljay1hcnJvdycsICdzbGljay1wcmV2JywgJ3NsaWNrLW5leHQnLFxuICAgICAgICAnc2xpY2stYWN0aXZlJywgJ3NsaWNrLWNlbnRlcicsICdzbGljay1pbml0aWFsaXplZCcsXG4gICAgICAgIFxuICAgICAgICAvLyBCYWNrZ3JvdW5kcyBlc3BlY1x1MDBFRGZpY29zIHJlYWxtZW50ZSB1c2Fkb3NcbiAgICAgICAgJ2JnLWJsdWUtNjAwJywgJ2JnLWJsdWUtNzAwJywgJ2JnLWdyYXktMTAwJywgJ2JnLWdyYXktMjAwJywgJ2JnLWJsYWNrJywgXG4gICAgICAgICdiZy1ncmFkaWVudC10by1yJywgJ2JnLTEnLCAnYmctMicsICdiZy00LTEnLCAnYmctNycsXG4gICAgICAgIFxuICAgICAgICAvLyBUZXh0IGNsYXNzZXMgZXNwZWNcdTAwRURmaWNhcyByZWFsbWVudGUgdXNhZGFzXG4gICAgICAgICd0ZXh0LTJ4bCcsICd0ZXh0LTR4bCcsICd0ZXh0LWNlbnRlcicsICd0ZXh0LWdyYXktMzAwJywgJ3RleHQtZ3JheS00MDAnLFxuICAgICAgICAndGV4dC1kaycsICd0ZXh0LWZvbnQnLCAndGV4dC1ib3gnLFxuICAgICAgICBcbiAgICAgICAgLy8gU3BhY2luZyBhcGVuYXMgb3MgZXNzZW5jaWFpcyAobGltaXRhZG9zKVxuICAgICAgICAnbXQtNScsICdtYi00JywgJ3AtNCcsICdweC00JywgJ3B5LTMnLCAnbS0yJywgJ20tNCcsXG4gICAgICAgIFxuICAgICAgICAvLyBCb290c3RyYXAgY29yZSBhcGVuYXMgZXNzZW5jaWFsXG4gICAgICAgICdjb250YWluZXInLCAnY29udGFpbmVyLWZsdWlkJywgJ3JvdycsICdidG4nLCAnY2FyZCcsICdtb2RhbCcsICduYXZiYXInLFxuICAgICAgICAndy1mdWxsJywgJ2gtMTYnLCAnZC1ibG9jaycsICdkLWZsZXgnLCAnanVzdGlmeS1jb250ZW50LWNlbnRlcicsICdhbGlnbi1pdGVtcy1jZW50ZXInLFxuICAgICAgICBcbiAgICAgICAgLy8gRm9udCBBd2Vzb21lIEFQRU5BUyBvcyAzOCBcdTAwRURjb25lcyByZWFsbWVudGUgdXNhZG9zXG4gICAgICAgICdmYScsICdmYXMnLCAnZmFiJywgJ2ZhcicsICdmYS1zb2xpZCcsICdmYS1icmFuZHMnLFxuICAgICAgICAnZmEtYW5nbGUtZG93bicsICdmYS1hbmdsZS1sZWZ0JywgJ2ZhLWFuZ2xlLXJpZ2h0JywgJ2ZhLWFuZ2xlLXVwJyxcbiAgICAgICAgJ2ZhLWJhcnMnLCAnZmEtYnVpbGRpbmcnLCAnZmEtY2FsZW5kYXInLCAnZmEtY2FyJywgJ2ZhLWNhcnQtc2hvcHBpbmcnLFxuICAgICAgICAnZmEtY2hlY2snLCAnZmEtY2hlY2stY2lyY2xlJywgJ2ZhLWNpcmNsZS1jaGVjaycsICdmYS1jbG9jaycsXG4gICAgICAgICdmYS1jcmVkaXQtY2FyZCcsICdmYS1kb2xsYXItc2lnbicsICdmYS1lbnZlbG9wZScsXG4gICAgICAgICdmYS1mYWNlYm9vay1mJywgJ2ZhLWdvb2dsZScsICdmYS1ob21lJywgJ2ZhLWluc3RhZ3JhbScsICdmYS1saW5rZWRpbi1pbicsXG4gICAgICAgICdmYS1sb2NhdGlvbi1kb3QnLCAnZmEtbWFwLW1hcmtlci1hbHQnLCAnZmEtbmV3c3BhcGVyJywgJ2ZhLXBob25lJywgJ2ZhLXBsYXknLFxuICAgICAgICAnZmEtc2VhcmNoJywgJ2ZhLXNpZ24taW4tYWx0JywgJ2ZhLXNpZ24tb3V0LWFsdCcsICdmYS1zdGFyJywgJ2ZhLXRhY2hvbWV0ZXInLFxuICAgICAgICAnZmEtdGh1bWJzLWRvd24nLCAnZmEtdGh1bWJzLXVwJywgJ2ZhLXRpbWVzJywgJ2ZhLXR3aXR0ZXInLCAnZmEtdXBsb2FkJyxcbiAgICAgICAgJ2ZhLXVzZXInLCAnZmEtd2hhdHNhcHAnLFxuICAgICAgICBcbiAgICAgICAgLy8gTGF5b3V0IGNyXHUwMEVEdGljb1xuICAgICAgICAnaGVyby1zZWN0aW9uJywgJ2hlYWRlcicsICdmb290ZXInLCAnbmF2LWxpbmsnLCAnaW1nLWZsdWlkJyxcbiAgICAgICAgJ3dyYXBwZXItaW52b2ljZScsICdhYm91dC1pbm5lci1vbmUnLCAnbGF5b3V0LXJhZGl1cycsICdpbnZlbnRvcnktc2VjdGlvbicsXG4gICAgICAgICdib3hjYXItY29udGFpbmVyJywgJ2JveGNhci10aXRsZS10aHJlZScsICdicmVhZGNydW1iJywgJ3RpdGxlJ1xuICAgICAgXVxuICAgIH0pLFxuICAgIFxuICAgIC8vIFBsdWdpbiBwZXJzb25hbGl6YWRvIHBhcmEgY3JpdGljYWwgQ1NTIGludGVncmFkbyBhbyBidWlsZFxuICAgIHtcbiAgICAgIG5hbWU6ICdjcml0aWNhbC1jc3Mtdml0ZS1wbHVnaW4nLFxuICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgIC8vIEV4ZWN1dGEgYXBcdTAwRjNzIG8gYnVpbGQgZXN0YXIgY29tcGxldG9cbiAgICAgICAgY29uc29sZS5sb2coJ1x1RDgzQ1x1REZBRiBCdWlsZCBjb25jbHVcdTAwRURkbyAtIENTUyBjclx1MDBFRHRpY28gc2VyXHUwMEUxIHByb2Nlc3NhZG8gdmlhIHNjcmlwdCBzZXBhcmFkbycpO1xuICAgICAgICBjb25zb2xlLmxvZygnXHVEODNEXHVEQ0ExIEV4ZWN1dGUgd29ya2Zsb3cgXCJCdWlsZCB3aXRoIENyaXRpY2FsIENTU1wiIHBhcmEgYnVpbGQgb3RpbWl6YWRvJyk7XG4gICAgICB9XG4gICAgfVxuICBdLFxuICBcbiAgLy8gUmVzb2x2ZSBhbGlhc2VzIHBhcmEgaW1wb3J0cyBsaW1wb3NcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgJ0Bjb21wb25lbnRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2NvbXBvbmVudHMnKSxcbiAgICAgICdAbGF5b3V0cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9sYXlvdXRzJyksXG4gICAgICAnQHBhZ2VzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3BhZ2VzJyksXG4gICAgICAnQHV0aWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3V0aWxzJyksXG4gICAgICAnQGFzc2V0cyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9hc3NldHMnKVxuICAgIH1cbiAgfSxcbiAgXG4gIC8vIENvbmZpZ3VyYVx1MDBFN1x1MDBGNWVzIGRlIHNlcnZpZG9yIGRlIGRlc2Vudm9sdmltZW50b1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogNTAwMCxcbiAgICBhbGxvd2VkSG9zdHM6IFtcbiAgICAgICdhbGwnLFxuICAgICAgJy5yZXBsaXQuZGV2JyxcbiAgICAgICcucmVwbGl0LmFwcCcsXG4gICAgICAnZDIyNjZlMWItMzFkNS00NGEzLWI2NTctYTNjOTA2OWFkODQ4LTAwLTJzcDdqb2kydXI1dzYucmlrZXIucmVwbGl0LmRldidcbiAgICBdLFxuICAgIHByb3h5OiB7XG4gICAgICAnL29wZW5haSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MCcsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxuICAgICAgfSxcbiAgICAgICcvYXBpL2xlYWQnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH0sXG4gICAgICAnL2FwaS93ZWJob29rL2NyZWRlcmUnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFxuICAvLyBQcmV2aWV3IHNlcnZlciBjb25maWd1cmF0aW9uXG4gIHByZXZpZXc6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgcG9ydDogNDE3M1xuICB9LFxuICBcbiAgLy8gQ29uZmlndXJhXHUwMEU3XHUwMEY1ZXMgb3RpbWl6YWRhcyBwYXJhIHBlcmZvcm1hbmNlIGRlIGJ1aWxkXG4gIGJ1aWxkOiB7XG4gICAgLy8gSGFiaWxpdGEgc291cmNlIG1hcHMgcGFyYSBkZXB1cmFcdTAwRTdcdTAwRTNvXG4gICAgc291cmNlbWFwOiB0cnVlLFxuICAgIC8vIFByZXNlcnZhciBSZWFjdCBwYXJhIGV2aXRhciBlcnJvcyBkZSB1c2VMYXlvdXRFZmZlY3RcbiAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlXG4gICAgfSxcbiAgICAvLyBDb2RlIHNwbGl0dGluZyBjb25zZXJ2YWRvciBwYXJhIGV2aXRhciBwcm9ibGVtYXMgY29tIFJlYWN0XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgLy8gVHJlZSBzaGFraW5nIGxpbWl0YWRvIHBhcmEgZXZpdGFyIHByb2JsZW1hc1xuICAgICAgdHJlZXNoYWtlOiBmYWxzZSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBTZXBhcmFcdTAwRTdcdTAwRTNvIG90aW1pemFkYSBkZSB2ZW5kb3JzIC0gTEFaWSBMT0FESU5HIFNUUkFURUdZXG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIC8vIFJlYWN0IGVjb3N5c3RlbSAoQ1JcdTAwQ0RUSUNPIC0gc2VtcHJlIGNhcnJlZ2FkbylcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QnKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtZG9tJykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LXJvdXRlcicpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXJlYWN0JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gXHVEODNEXHVERDI1IExBWlkgVkVORE9SUyAtIFJlbW92aWRvcyBkbyBidW5kbGUgaW5pY2lhbFxuICAgICAgICAgICAgLy8gRmlyZWJhc2UgLSBBUEVOQVMgcGFyYSBsYXp5IGNvbXBvbmVudHMgKEFkbWluLCBldGMpXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2ZpcmViYXNlJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdsYXp5LWZpcmViYXNlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoYXJ0cyAtIEFQRU5BUyBwYXJhIGNhbGN1bGFkb3JhL2FkbWluIGxhenlcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnY2hhcnQuanMnKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtY2hhcnRqcycpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnbGF6eS1jaGFydHMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gWExTWCAtIEFQRU5BUyBwYXJhIGFkbWluIGxhenlcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygneGxzeCcpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnbGF6eS14bHN4JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gXHUyNzA1IFZFTkRPUlMgTkVDRVNTXHUwMEMxUklPUyAocG9kZW0gZmljYXIgZW0gY2h1bmtzIG1lbm9yZXMpXG4gICAgICAgICAgICAvLyBBbmltYVx1MDBFN1x1MDBGNWVzICh1c2FkbyBlbSBoZXJvIC0gbWFudGVyKVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdmcmFtZXItbW90aW9uJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbW90aW9uJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEJvb3RzdHJhcCBlIFBvcHBlciAodXNhZG8gZ2xvYmFsbWVudGUpXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2Jvb3RzdHJhcCcpIHx8IGlkLmluY2x1ZGVzKCdAcG9wcGVyanMvY29yZScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWJvb3RzdHJhcCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTbGljayBjYXJvdXNlbCAodXNhZG8gZW0gY29tcG9uZW50ZXMgbGF6eSlcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3Qtc2xpY2snKSB8fCBpZC5pbmNsdWRlcygnc2xpY2stY2Fyb3VzZWwnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1zbGljayc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQaG90b1N3aXBlIGdhbGxlcnkgKHVzYWRvIGVtIGxhenkgY29tcG9uZW50cylcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncGhvdG9zd2lwZScpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1waG90b3N3aXBlJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZ2FsbGVyeSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBcdTAwQ0Rjb25lcyAodXNhZG8gZW0gaGVhZGVyKVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1pY29ucyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBNb2RhbCBlIHZcdTAwRURkZW8gKGxhenkpXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0LW1vZGFsLXZpZGVvJykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbW9kYWwnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gT3V0cm9zIHZlbmRvcnMgbWVub3Jlc1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbWlzYyc7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBBc3NldHMgbmFtaW5nIHBhcmEgY2FjaGUgYnVzdGluZyBvdGltaXphZG9cbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcbiAgICAgICAgICBjb25zdCBpbmZvID0gYXNzZXRJbmZvLm5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICBsZXQgZXh0VHlwZSA9IGluZm9baW5mby5sZW5ndGggLSAxXTtcbiAgICAgICAgICBpZiAoL1xcLihwbmd8anBlP2d8c3ZnfGdpZnx0aWZmfGJtcHxpY28pJC9pLnRlc3QoYXNzZXRJbmZvLm5hbWUpKSB7XG4gICAgICAgICAgICBleHRUeXBlID0gJ2ltYWdlcyc7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXFwuKHdvZmYyP3xlb3R8dHRmfG90ZikkL2kudGVzdChhc3NldEluZm8ubmFtZSkpIHtcbiAgICAgICAgICAgIGV4dFR5cGUgPSAnZm9udHMnO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYGFzc2V0cy8ke2V4dFR5cGV9L1tuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBDU1MgY29kZSBzcGxpdHRpbmcgcGFyYSBjcml0aWNhbCBDU1Mgc3RyYXRlZ3lcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgXG4gICAgLy8gTWluaWZpY2FcdTAwRTdcdTAwRTNvIG90aW1pemFkYSBlIGFncmVzc2l2YVxuICAgIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLCAvLyBSZW1vdmUgY29uc29sZS5sb2cgZW0gcHJvZHVcdTAwRTdcdTAwRTNvXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXG4gICAgICAgIHB1cmVfZnVuY3M6IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5pbmZvJywgJ2NvbnNvbGUuZGVidWcnXSxcbiAgICAgICAgZGVhZF9jb2RlOiB0cnVlLFxuICAgICAgICB1bnVzZWQ6IHRydWUsXG4gICAgICAgIHJlZHVjZV92YXJzOiB0cnVlLFxuICAgICAgICBjb2xsYXBzZV92YXJzOiB0cnVlXG4gICAgICB9LFxuICAgICAgbWFuZ2xlOiB7XG4gICAgICAgIHNhZmFyaTEwOiB0cnVlXG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBDaHVuayBzaXplIG9wdGltaXphdGlvblxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICBcbiAgICAvLyBUYXJnZXQgYnJvd3NlcnMgbW9kZXJub3MgcGFyYSBtZWxob3IgcGVyZm9ybWFuY2VcbiAgICB0YXJnZXQ6IFsnZXMyMDIwJywgJ2Nocm9tZTgwJywgJ2ZpcmVmb3g3OCcsICdzYWZhcmkxNCddXG4gIH0sXG4gIFxuICAvLyBDb25maWd1cmFcdTAwRTdcdTAwRjVlcyBkZSBDU1Mgb3RpbWl6YWRhc1xuICBjc3M6IHtcbiAgICBkZXZTb3VyY2VtYXA6IGZhbHNlLCAvLyBEZXNhYmlsaXRhIHNvdXJjZW1hcHMgQ1NTIGVtIHByb2RcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIC8vIEF1dG9QcmVmaXhlciBqXHUwMEUxIGluY2x1XHUwMEVEZG8gdmlhIGRlcGVuZGVuY2llc1xuICAgICAgXVxuICAgIH1cbiAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBRTdCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGNBQWM7QUFKckIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUE7QUFBQSxFQUUxQixRQUFRO0FBQUEsSUFDTiw4Q0FBOEMsS0FBSyxVQUFVLFFBQVEsSUFBSSxxQkFBcUI7QUFBQSxJQUM5RiwyQ0FBMkMsS0FBSyxVQUFVLFFBQVEsSUFBSSxrQkFBa0I7QUFBQSxJQUN4Riw4Q0FBOEMsS0FBSyxVQUFVLFFBQVEsSUFBSSxxQkFBcUI7QUFBQSxFQUNoRztBQUFBO0FBQUEsRUFHQSxTQUFTO0FBQUEsSUFDUCxRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUM7QUFBQTtBQUFBLElBRVYsWUFBWTtBQUFBLElBQ1osYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUVBLFNBQVM7QUFBQTtBQUFBO0FBQUEsSUFJUCxTQUFTO0FBQUEs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
