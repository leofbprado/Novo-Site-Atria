import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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

createRoot(document.getElementById("root")!).render(<App />);
