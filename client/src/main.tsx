import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { loadTagConfigs } from "./components/TagBadge";
import { captureAttribution } from "./lib/attribution";

// Captura gclid/utm da URL ANTES do React montar — qualquer evento
// disparado depois (incluindo o pageview do GTM) já enxerga atribuição.
captureAttribution();

// Pré-carrega config das tags em paralelo com o boot — quando Estoque/Home
// renderizar, os badges já têm cor sem flash.
loadTagConfigs();

/**
 * Auto-desregistra Service Workers legados (do site Motorleads antigo ou versões
 * anteriores do .com) e limpa caches obsoletos. O site novo não usa SW — qualquer
 * SW ativo é vestígio de uma visita anterior. Sem isso, funcionários viam bundles
 * antigos do Admin cacheados e nunca recebiam atualizações.
 *
 * Roda apenas 1 vez por aba (flag em sessionStorage) e força reload se achou
 * algum SW pra limpar — garante que a próxima requisição vem fresca do servidor.
 */
if ("serviceWorker" in navigator && !sessionStorage.getItem("sw-cleaned")) {
  sessionStorage.setItem("sw-cleaned", "1");
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length === 0) return;
    Promise.all(registrations.map((r) => r.unregister()))
      .then(() => caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))))
      .then(() => {
        console.log("[sw-cleanup] Removido SW legado + caches. Recarregando...");
        window.location.reload();
      })
      .catch(() => {});
  }).catch(() => {});
}

// Chunk recovery — a cada deploy novo, Vite muda os hashes dos chunks.
// Usuário com index.html em cache tenta buscar chunk antigo que 404 → tela branca.
// Recarrega 1x pra pegar o HTML atual. Loop-safe via cooldown de 30s no sessionStorage.
window.addEventListener("vite:preloadError", (event) => {
  const last = Number(sessionStorage.getItem("chunk-reload-ts") || 0);
  if (Date.now() - last < 30_000) return;
  sessionStorage.setItem("chunk-reload-ts", String(Date.now()));
  console.warn("[chunk-recovery] preloadError, recarregando pra pegar bundle novo:", event);
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
