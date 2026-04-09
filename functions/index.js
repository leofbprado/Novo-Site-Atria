const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const SITE_URL = "https://www.atriaveiculos.com.br";
const AUTOCONF_API = process.env.AUTOCONF_API_URL || "https://api.autoconf.com.br";
const AUTOCONF_BEARER = process.env.AUTOCONF_BEARER || "";
const AUTOCONF_TOKEN = process.env.AUTOCONF_TOKEN || "";

async function autoconfPost(endpoint, body = {}) {
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

function cors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

exports.autoconf = onRequest({ region: "southamerica-east1" }, async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  try {
    const path = req.path.replace(/^\/*(api\/autoconf\/?)?/, "");

    if (path === "veiculos") {
      const data = await autoconfPost("/api/v1/veiculos", req.body || {});
      res.json(data);
    } else if (path === "veiculo") {
      const id = req.body?.id || req.query?.id;
      if (!id) { res.status(400).json({ error: "id required" }); return; }
      const data = await autoconfPost("/api/v1/veiculo", { id: Number(id) });
      res.json(data);
    } else {
      res.status(404).json({ error: "not found" });
    }
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ─── Sitemap dinâmico ────────────────────────────────────────────────────────
let sitemapCache = { xml: "", ts: 0 };
const CACHE_TTL = 3600_000; // 1 hora

exports.sitemap = onRequest({ region: "southamerica-east1" }, async (req, res) => {
  cors(res);

  if (sitemapCache.xml && Date.now() - sitemapCache.ts < CACHE_TTL) {
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.send(sitemapCache.xml);
    return;
  }

  try {
    const snap = await db.collection("veiculos_admin")
      .where("status", "==", "publicado")
      .select("slug", "data_importacao", "updatedAt")
      .get();

    const today = new Date().toISOString().split("T")[0];

    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "daily" },
      { loc: "/estoque", priority: "0.9", changefreq: "daily" },
      { loc: "/venda-seu-carro", priority: "0.8", changefreq: "monthly" },
      { loc: "/financiamento", priority: "0.8", changefreq: "monthly" },
      { loc: "/sobre", priority: "0.6", changefreq: "monthly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const p of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}${p.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    snap.forEach((doc) => {
      const d = doc.data();
      if (!d.slug) return;
      const lastmod = d.updatedAt?.toDate?.()
        ? d.updatedAt.toDate().toISOString().split("T")[0]
        : d.data_importacao?.toDate?.()
          ? d.data_importacao.toDate().toISOString().split("T")[0]
          : today;
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/campinas-sp/${d.slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    sitemapCache = { xml, ts: Date.now() };

    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.send(xml);
  } catch (e) {
    res.status(500).send(`<!-- Sitemap error: ${e.message} -->`);
  }
});

// ─── Google Reviews ──────────────────────────────────────────────────────────
const PLACES = [
  { id: "ChIJHfOghtjOyJQRdL4Zsnxwsis", loja: "Abolição" },
  { id: "ChIJL6nIwhrGyJQRVjPLf7OBAsU", loja: "Guanabara" },
  { id: "ChIJ1yAZp0TJyJQR_81hXZHa3j8", loja: "Campos Elíseos" },
];
const REVIEWS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
let reviewsCache = null;

async function fetchGoogleReviews(apiKey) {
  const results = await Promise.all(
    PLACES.map(async (place) => {
      try {
        // reviews_sort=NEWEST = pede reviews mais recentes em vez de "most relevant"
        // (Places API API New, lançado 2024)
        const url = `https://places.googleapis.com/v1/places/${place.id}?reviews_sort=NEWEST&languageCode=pt-BR&regionCode=BR`;
        const r = await fetch(url, {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "reviews,rating,userRatingCount",
          },
        });
        if (!r.ok) return { reviews: [], rating: 0, totalCount: 0, loja: place.loja };
        const data = await r.json();
        const reviews = (data.reviews || []).map((rv) => ({
          authorName: rv.authorAttribution?.displayName || "Cliente",
          authorPhoto: rv.authorAttribution?.photoUri || "",
          rating: rv.rating ?? 0,
          text: rv.text?.text || rv.originalText?.text || "",
          relativeTime: rv.relativePublishTimeDescription || "",
          publishTime: rv.publishTime || "",
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

  // Filtra APENAS 5 estrelas com texto não vazio
  const fiveStars = allReviews.filter((r) => r.rating === 5 && r.text && r.text.trim().length > 10);

  // Ordena pelas MAIS RECENTES primeiro (publishTime desc)
  fiveStars.sort((a, b) => {
    const ta = a.publishTime ? new Date(a.publishTime).getTime() : 0;
    const tb = b.publishTime ? new Date(b.publishTime).getTime() : 0;
    return tb - ta;
  });

  // Distribui até 9 reviews mesclando lojas: pega as 3 mais recentes de cada loja
  // (3 lojas × 3 = 9 max). Garante variedade geográfica + frescor temporal.
  const selected = [];
  const byStore = new Map();
  for (const r of fiveStars) {
    if (!byStore.has(r.loja)) byStore.set(r.loja, []);
    byStore.get(r.loja).push(r);
  }
  for (const [, storeReviews] of byStore) {
    selected.push(...storeReviews.slice(0, 3));
  }

  // Se ainda sobrar espaço, completa com as mais recentes restantes
  if (selected.length < 9) {
    for (const r of fiveStars) {
      if (selected.length >= 9) break;
      if (!selected.includes(r)) selected.push(r);
    }
  }

  // Re-ordena o resultado final por data (mais recente primeiro) pra exibição
  selected.sort((a, b) => {
    const ta = a.publishTime ? new Date(a.publishTime).getTime() : 0;
    const tb = b.publishTime ? new Date(b.publishTime).getTime() : 0;
    return tb - ta;
  });

  const finalReviews = selected.slice(0, 9);

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

exports.googleReviews = onRequest(
  {
    region: "southamerica-east1",
    secrets: ["GOOGLE_PLACES_API_KEY"],
  },
  async (req, res) => {
    cors(res);
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY || "";
    if (!apiKey) {
      res.json({ reviews: [], averageRating: 4.8, totalReviews: 0, error: "API key não configurada" });
      return;
    }

    if (reviewsCache && Date.now() - reviewsCache.ts < REVIEWS_CACHE_TTL) {
      res.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.json(reviewsCache.data);
      return;
    }

    try {
      const data = await fetchGoogleReviews(apiKey);
      reviewsCache = { ts: Date.now(), data };
      res.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.json(data);
    } catch (e) {
      if (reviewsCache) {
        res.json(reviewsCache.data);
        return;
      }
      res.status(500).json({ error: e.message, reviews: [], averageRating: 4.8, totalReviews: 0 });
    }
  }
);
