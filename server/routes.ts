import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const AUTOCONF_API = process.env.AUTOCONF_API_URL || "https://api.autoconf.com.br";
const AUTOCONF_BEARER = process.env.AUTOCONF_BEARER || "";
const AUTOCONF_TOKEN = process.env.AUTOCONF_TOKEN || "";
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

// ── Google Reviews in-memory cache ──────────────────────────────────────────
const PLACES = [
  { id: "ChIJHfOghtjOyJQRdL4Zsnxwsis", loja: "Abolição" },
  { id: "ChIJL6nIwhrGyJQRVjPLf7OBAsU", loja: "Guanabara" },
  { id: "ChIJ1yAZp0TJyJQR_81hXZHa3j8", loja: "Campos Elíseos" },
];
const REVIEWS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
let reviewsCache: { ts: number; data: any } | null = null;

async function fetchGoogleReviews() {
  const results = await Promise.all(
    PLACES.map(async (place) => {
      try {
        const res = await fetch(
          `https://places.googleapis.com/v1/places/${place.id}`,
          {
            headers: {
              "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
              "X-Goog-FieldMask": "reviews,rating,userRatingCount",
            },
          }
        );
        if (!res.ok) return { reviews: [], rating: 0, totalCount: 0, loja: place.loja };
        const data = await res.json();
        const reviews = (data.reviews || []).map((r: any) => ({
          authorName: r.authorAttribution?.displayName || "Cliente",
          authorPhoto: r.authorAttribution?.photoUri || "",
          rating: r.rating ?? 0,
          text: r.text?.text || r.originalText?.text || "",
          relativeTime: r.relativePublishTimeDescription || "",
          publishTime: r.publishTime || "",
          loja: place.loja,
        }));
        return {
          reviews,
          rating: data.rating ?? 0,
          totalCount: data.userRatingCount ?? 0,
          loja: place.loja,
        };
      } catch {
        return { reviews: [], rating: 0, totalCount: 0, loja: place.loja };
      }
    })
  );

  const allReviews = results.flatMap((r) => r.reviews);
  const fiveStars = allReviews.filter((r: any) => r.rating === 5);

  fiveStars.sort((a: any, b: any) => {
    if (a.publishTime && b.publishTime) {
      return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
    }
    return 0;
  });

  // Pick up to 6 reviews, 2 per store
  const selected: any[] = [];
  const byStore = new Map<string, any[]>();
  for (const r of fiveStars) {
    if (!byStore.has(r.loja)) byStore.set(r.loja, []);
    byStore.get(r.loja)!.push(r);
  }
  for (const [, storeReviews] of byStore) {
    selected.push(...storeReviews.slice(0, 2));
  }
  if (selected.length < 6) {
    for (const r of fiveStars) {
      if (selected.length >= 6) break;
      if (!selected.includes(r)) selected.push(r);
    }
  }
  const finalReviews = selected.slice(0, 6);

  const validStores = results.filter((r) => r.rating > 0);
  const avgRating =
    validStores.length > 0
      ? validStores.reduce((s, r) => s + r.rating * r.totalCount, 0) /
        validStores.reduce((s, r) => s + r.totalCount, 0)
      : 4.8;
  const totalReviews = results.reduce((s, r) => s + r.totalCount, 0);

  return {
    reviews: finalReviews,
    averageRating: Math.round(avgRating * 10) / 10,
    totalReviews,
  };
}
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "atria2024";

async function autoconfPost(endpoint: string, body: Record<string, unknown> = {}) {
  const params = new URLSearchParams();
  params.set("token", AUTOCONF_TOKEN);
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }
  const res = await fetch(`${AUTOCONF_API}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: AUTOCONF_BEARER,
    },
    body: params,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`AutoConf ${res.status}: ${text || "empty response"}`);
  }
  if (!text) {
    throw new Error("AutoConf returned empty response");
  }
  return JSON.parse(text);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ── Admin login ──────────────────────────────────────────────────────────
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { user, pass } = req.body;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false, message: "Credenciais invalidas" });
  });

  // ── AutoConf proxy ───────────────────────────────────────────────────────
  app.post("/api/admin/veiculos", async (req: Request, res: Response) => {
    try {
      const data = await autoconfPost("/api/v1/veiculos", req.body);
      res.json(data);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.post("/api/admin/veiculos-home", async (_req: Request, res: Response) => {
    try {
      const data = await autoconfPost("/api/v1/veiculos-home", {});
      res.json(data);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.post("/api/admin/veiculo", async (req: Request, res: Response) => {
    try {
      const data = await autoconfPost("/api/v1/veiculo", { id: req.body.id });
      res.json(data);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  // ── AutoConf proxy (used by admin frontend) ────────────────────────────
  app.post("/api/autoconf/veiculos", async (req: Request, res: Response) => {
    try {
      const data = await autoconfPost("/api/v1/veiculos", req.body);
      res.json(data);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  app.post("/api/autoconf/veiculo", async (req: Request, res: Response) => {
    try {
      const data = await autoconfPost("/api/v1/veiculo", { id: req.body.id });
      res.json(data);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  // ── Hypergestor test (dev) ──────────────────────────────────────────────
  app.post("/api/hypergestor-test", async (_req: Request, res: Response) => {
    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const payload = {
      Rota: "lead-novo",
      Empresa: "TFQMKVULUG",
      Objeto: {
        nome: `TESTE API ${stamp}`,
        whatsapp: "5519000000000",
        telefone: "5519000000000",
        mensagem: "Lead de teste (dev)",
        unidade: "KJPE8E67TY",
        numeroUnico_segmentos_de_lead: "fUyQVHGfrD86SYPFAKCZNuZvXRkk13",
        numeroUnico_departamentos_de_lead: "NyDjUMSiGuEbCn8SnPpUPa7YB1DjV4",
        numeroUnico_fontes_de_lead: "z3uaM6VEQCbtYlTVZ3vYysirJZgMlM",
        origem: "SITE",
        departamento: "Veículos",
        data: new Date().toISOString().split("T")[0],
        receber_whatsapp: "NÃO",
        receber_email: "NÃO",
        receber_telefone: "NÃO",
        veiculo_na_troca: "NÃO",
      },
    };
    try {
      const r = await fetch("https://api.autopop360.com/lead-novo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await r.text();
      res.json({ ok: r.ok, status: r.status, body: text.slice(0, 800) });
    } catch (e: any) {
      res.status(502).json({ ok: false, status: 0, body: "", error: String(e?.message || e).slice(0, 500) });
    }
  });

  // ── Sances proxy (cross-check de preços) ────────────────────────────────
  app.get("/api/sances/estoqueVeiculos", async (_req: Request, res: Response) => {
    try {
      const token = process.env.SANCES_BEARER || "";
      if (!token) { res.status(500).json({ error: "SANCES_BEARER não configurado" }); return; }
      const r = await fetch("https://integracao.sancesturbo.com.br/api/estoqueVeiculos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) { res.status(r.status).json({ error: `Sances ${r.status}` }); return; }
      const data = await r.json();
      res.json(data);
    } catch (e: any) {
      res.status(502).json({ error: e.message });
    }
  });

  // ── OpenAI key (save to runtime, not persisted) ──────────────────────────
  let openaiKey = process.env.OPENAI_API_KEY || "";

  app.get("/api/admin/openai-key", (_req: Request, res: Response) => {
    res.json({ key: openaiKey ? "****" + openaiKey.slice(-4) : "" });
  });

  app.post("/api/admin/openai-key", (req: Request, res: Response) => {
    openaiKey = req.body.key || "";
    res.json({ ok: true });
  });

  // ── Google Reviews proxy ─────────────────────────────────────────────────
  app.get("/api/google-reviews", async (_req: Request, res: Response) => {
    if (!GOOGLE_PLACES_API_KEY) {
      return res.json({ reviews: [], averageRating: 4.8, totalReviews: 0 });
    }

    // Return cached data if fresh
    if (reviewsCache && Date.now() - reviewsCache.ts < REVIEWS_CACHE_TTL) {
      return res.json(reviewsCache.data);
    }

    try {
      const data = await fetchGoogleReviews();
      reviewsCache = { ts: Date.now(), data };
      res.json(data);
    } catch (e: any) {
      // Return stale cache if available, otherwise empty
      if (reviewsCache) {
        return res.json(reviewsCache.data);
      }
      res.json({ reviews: [], averageRating: 4.8, totalReviews: 0 });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
