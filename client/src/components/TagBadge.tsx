import { useEffect, useState } from "react";
import { getAllTagConfigs, type TagConfig } from "@/lib/adminFirestore";

// Cache global em memória — uma única leitura do Firestore por sessão.
// Tag config muda raramente; se o usuário editar no admin, basta refresh.
let CACHE: TagConfig[] | null = null;
let PENDING: Promise<TagConfig[]> | null = null;
const SUBSCRIBERS = new Set<(c: TagConfig[]) => void>();

export function loadTagConfigs(): Promise<TagConfig[]> {
  if (CACHE) return Promise.resolve(CACHE);
  if (PENDING) return PENDING;
  PENDING = getAllTagConfigs()
    .then((list) => {
      CACHE = list;
      PENDING = null;
      SUBSCRIBERS.forEach((fn) => fn(list));
      return list;
    })
    .catch((err) => {
      PENDING = null;
      console.error("[TagBadge] erro carregando tag configs:", err);
      return [];
    });
  return PENDING;
}

export function invalidateTagConfigs(next?: TagConfig[]) {
  CACHE = next ?? null;
  if (next) SUBSCRIBERS.forEach((fn) => fn(next));
}

export function useTagConfigs(): TagConfig[] {
  const [list, setList] = useState<TagConfig[]>(CACHE || []);
  useEffect(() => {
    if (!CACHE) loadTagConfigs().then((c) => setList(c));
    SUBSCRIBERS.add(setList);
    return () => { SUBSCRIBERS.delete(setList); };
  }, []);
  return list;
}

type Size = "xs" | "sm" | "md";

export function tagStyle(cfg: TagConfig): React.CSSProperties {
  return cfg.bgTo
    ? { backgroundImage: `linear-gradient(to bottom, ${cfg.bgFrom}, ${cfg.bgTo})`, color: cfg.textColor }
    : { backgroundColor: cfg.bgFrom, color: cfg.textColor };
}

interface Props {
  /** Nome da tag (lowercase, igual ao salvo no Firestore). */
  tag: string;
  /** Sobrescreve o config buscado — útil pro preview no admin. */
  override?: TagConfig;
  size?: Size;
  className?: string;
}

export function TagBadge({ tag, override, size = "sm", className = "" }: Props) {
  const configs = useTagConfigs();
  const cfg = override ?? configs.find((c) => c.nome === tag.toLowerCase());
  if (!cfg) return null;

  const sizeCls = size === "md"
    ? "text-sm px-3 py-1.5"
    : size === "xs"
    ? "text-[10px] px-2 py-0.5"
    : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-block font-inter font-bold ${cfg.uppercase ? "uppercase tracking-wide" : ""} rounded ${sizeCls} ${className}`}
      style={tagStyle(cfg)}
    >
      {cfg.label}
    </span>
  );
}
