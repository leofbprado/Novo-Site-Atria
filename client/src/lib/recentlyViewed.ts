import { useEffect, useState } from "react";
import { getVehicles, type Vehicle } from "./firestore";

// Lista de slugs de veículos recentemente visualizados (estilo CarMax).
// Persistida em localStorage por device, sem login. Cap em 12 (mais recente
// no topo, deduplicada). Visita à ficha do carro adiciona automaticamente —
// não depende de click no heart.
const KEY = "atria_recently_viewed";
const CAP = 12;

function readSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeSlugs(slugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    // localStorage cheio ou bloqueado — falha silenciosa, feature degradada
  }
}

export function pushRecentSlug(slug: string): void {
  if (!slug) return;
  const current = readSlugs();
  // Move pro topo, dedupe, cap em CAP
  const next = [slug, ...current.filter((s) => s !== slug)].slice(0, CAP);
  writeSlugs(next);
}

export function getRecentSlugs(): string[] {
  return readSlugs();
}

// Hook que retorna os Vehicle objects correspondentes aos slugs salvos,
// preservando a ordem (mais recente primeiro). Filtra silenciosamente os
// que não estão mais publicados (vendidos/despublicados).
export function useRecentlyViewed(maxItems = 6): Vehicle[] {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const slugs = readSlugs();
    if (slugs.length === 0) {
      setVehicles([]);
      return;
    }
    let cancelled = false;
    getVehicles()
      .then((all) => {
        if (cancelled) return;
        const bySlug = new Map(all.map((v) => [v.slug, v]));
        const ordered = slugs
          .map((s) => bySlug.get(s))
          .filter((v): v is Vehicle => !!v)
          .slice(0, maxItems);
        setVehicles(ordered);
      })
      .catch(() => {
        if (!cancelled) setVehicles([]);
      });
    return () => {
      cancelled = true;
    };
  }, [maxItems]);

  return vehicles;
}
