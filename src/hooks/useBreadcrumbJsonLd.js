import { useEffect } from "react";

/**
 * Hook to manage unique JSON-LD breadcrumb structured data
 * Ensures only one breadcrumb JSON-LD exists per page
 * @param {Array} items - Array of breadcrumb items with label and href
 * @param {String} urlFinal - Final URL for the current page
 */
export function useBreadcrumbJsonLd(items, urlFinal = window.location.href) {
  useEffect(() => {
    const id = "jsonld-breadcrumb";
    
    // Filter and clean items
    const cleanItems = items.filter(i => i && i.label && i.label.trim().length);
    
    if (cleanItems.length === 0) return;
    
    const data = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": cleanItems.map((it, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": it.label.trim(),
        "item": it.href || (idx === cleanItems.length - 1 ? urlFinal : undefined)
      }))
    };
    
    // Remove any existing breadcrumb JSON-LD
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    
    script.text = JSON.stringify(data);
    
    // Cleanup on unmount
    return () => {
      const node = document.getElementById(id);
      if (node) node.remove();
    };
  }, [JSON.stringify(items), urlFinal]);
}