import { useEffect, useState } from "react";

export type Orientation = "portrait" | "landscape";

export function useOrientation(): Orientation {
  const get = (): Orientation => {
    if (typeof window === "undefined") return "portrait";
    return window.matchMedia("(orientation: landscape)").matches ? "landscape" : "portrait";
  };
  const [orientation, setOrientation] = useState<Orientation>(get);

  useEffect(() => {
    const mql = window.matchMedia("(orientation: landscape)");
    const handler = (e: MediaQueryListEvent) => setOrientation(e.matches ? "landscape" : "portrait");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return orientation;
}
