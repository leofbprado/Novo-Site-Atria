const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const SITE_URL = "https://www.atriaveiculos.com";
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
      xml += `    <loc>${SITE_URL}/veiculo/${d.slug}</loc>\n`;
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
