import { useEffect } from "react";
import { SITE_URL } from "@/lib/constants";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: string;
}

const DEFAULTS = {
  title: "Átria Veículos | Seminovos em Campinas-SP | Compre, Venda e Financie",
  description: "Átria Veículos: concessionária de seminovos em Campinas-SP com mais de 12 anos de mercado e mais de 10.000 carros vendidos. Mais de 200 veículos, 3 lojas e financiamento facilitado.",
  ogImage: `${SITE_URL}/og-image.jpg`,
};

function setMeta(selector: string, attr: string, value: string) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/**
 * Detecta se a hostname atual é o domínio espelho técnico (.com sem .br).
 * Durante a fase de validação paralela, queremos que SOMENTE o .com.br seja
 * indexado pelo Google. O .com fica acessível pra Ads/QA mas é noindex.
 *
 * Quando virarmos o DNS do .com.br pro Firebase, a hostname passa a ser .com.br
 * e o noindex some automaticamente — não precisa lembrar de remover nada.
 */
function isMirrorDomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  // .com (sem .br) ou subdomínios firebase = espelho técnico
  return host === "atriaveiculos.com"
    || host === "www.atriaveiculos.com"
    || host.endsWith(".web.app")
    || host.endsWith(".firebaseapp.com");
}

export function useSEO({ title, description, path, ogImage, ogType }: SEOProps) {
  useEffect(() => {
    const canonical = `${SITE_URL}${path}`;
    const img = ogImage || DEFAULTS.ogImage;

    // Bloqueia indexação no domínio espelho (.com) — só .com.br deve ser indexado.
    // Usa "follow" (não "nofollow") pra Googlebot ainda mapear a estrutura interna —
    // assim quando virarmos pro .com.br, a topologia já está conhecida e a indexação
    // é mais rápida. nofollow mataria internal link equity sem benefício real.
    const robotsValue = isMirrorDomain() ? "noindex, follow" : "index, follow";
    setMeta('meta[name="robots"]', "content", robotsValue);

    document.title = title;

    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", canonical);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[property="og:image"]', "content", img);
    if (ogType) setMeta('meta[property="og:type"]', "content", ogType);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", img);

    return () => {
      document.title = DEFAULTS.title;
      setMeta('meta[name="description"]', "content", DEFAULTS.description);
      setMeta('link[rel="canonical"]', "href", `${SITE_URL}/`);
      setMeta('meta[property="og:title"]', "content", DEFAULTS.title);
      setMeta('meta[property="og:description"]', "content", DEFAULTS.description);
      setMeta('meta[property="og:url"]', "content", `${SITE_URL}/`);
      setMeta('meta[property="og:image"]', "content", DEFAULTS.ogImage);
      setMeta('meta[name="twitter:title"]', "content", DEFAULTS.title);
      setMeta('meta[name="twitter:description"]', "content", DEFAULTS.description);
      setMeta('meta[name="twitter:image"]', "content", DEFAULTS.ogImage);
    };
  }, [title, description, path, ogImage, ogType]);
}
