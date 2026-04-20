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

// ─── Sances (cross-check de preços) ──────────────────────────────────────────
const SANCES_API = "https://integracao.sancesturbo.com.br/api";

exports.sances = onRequest(
  { region: "southamerica-east1", secrets: ["SANCES_BEARER"] },
  async (req, res) => {
    cors(res);
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    const token = process.env.SANCES_BEARER || "";
    if (!token) {
      res.status(500).json({ error: "SANCES_BEARER não configurado" });
      return;
    }

    try {
      const path = req.path.replace(/^\/*(api\/sances\/?)?/, "");
      if (path !== "estoqueVeiculos" && path !== "") {
        res.status(404).json({ error: "not found" });
        return;
      }
      const r = await fetch(`${SANCES_API}/estoqueVeiculos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await r.text();
      if (!r.ok) throw new Error(`Sances ${r.status}: ${text.slice(0, 200)}`);
      res.set("Content-Type", "application/json");
      res.send(text);
    } catch (e) {
      res.status(502).json({ error: e.message });
    }
  }
);

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
        const url = `https://places.googleapis.com/v1/places/${place.id}?languageCode=pt-BR&regionCode=BR`;
        const r = await fetch(url, {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "reviews,rating,userRatingCount",
          },
        });
        if (!r.ok) {
          const body = await r.text().catch(() => "");
          console.error(`Places API ${place.loja} HTTP ${r.status}:`, body.slice(0, 300));
          return { reviews: [], rating: 0, totalCount: 0, loja: place.loja };
        }
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
      } catch (err) {
        console.error(`Places API ${place.loja} exception:`, err?.message || err);
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

// ─── Hypergestor (AutoPop360) — envia leads do site pro CRM ──────────────────
const HYPERGESTOR_URL = "https://api.autopop360.com/lead-novo";
const HYPERGESTOR_EMPRESA = "TFQMKVULUG";
const HYPERGESTOR_UNIDADE = "KJPE8E67TY";
const HYPERGESTOR_SEGMENTO = "fUyQVHGfrD86SYPFAKCZNuZvXRkk13"; // Veículos Seminovos
const HYPERGESTOR_DEPARTAMENTO = "NyDjUMSiGuEbCn8SnPpUPa7YB1DjV4"; // Comercial
const HYPERGESTOR_FONTE = "z3uaM6VEQCbtYlTVZ3vYysirJZgMlM"; // SITE

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

function isVendaSource(source) {
  return /venda|consigna|quero-vender/i.test(source || "");
}

function buildMensagem(lead) {
  const parts = [];
  if (lead.query) parts.push(String(lead.query));
  if (lead.dados && typeof lead.dados === "object") {
    const entries = Object.entries(lead.dados)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`);
    if (entries.length) parts.push(entries.join(" | "));
  }
  if (lead.source) parts.push(`[origem: ${lead.source}]`);
  return parts.join(" — ") || "Lead do site";
}

function buildHypergestorPayload(lead, createdAt) {
  const data = createdAt instanceof Date
    ? createdAt.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const phone = normalizePhone(lead.whatsapp);
  const dados = lead.dados || {};

  const objeto = {
    nome: lead.nome || dados.nome || "Lead Site",
    whatsapp: phone,
    telefone: phone,
    email: dados.email || "",
    mensagem: buildMensagem(lead),
    unidade: HYPERGESTOR_UNIDADE,
    numeroUnico_segmentos_de_lead: HYPERGESTOR_SEGMENTO,
    numeroUnico_departamentos_de_lead: HYPERGESTOR_DEPARTAMENTO,
    numeroUnico_fontes_de_lead: HYPERGESTOR_FONTE,
    origem: "SITE",
    departamento: "Veículos",
    data,
    receber_whatsapp: "SIM",
    receber_email: dados.email ? "SIM" : "NÃO",
    receber_telefone: "SIM",
    veiculo_na_troca: isVendaSource(lead.source) ? "SIM" : "NÃO",
  };

  if (dados.marcaModelo) objeto.modelo = String(dados.marcaModelo);
  if (dados.ano) objeto.ano_modelo = String(dados.ano);
  if (dados.km) objeto.kilometragem = String(dados.km);
  if (dados.carro) objeto.modelo = String(dados.carro);
  if (dados.slug) objeto.modelo = String(dados.slug);

  return { Rota: "lead-novo", Empresa: HYPERGESTOR_EMPRESA, Objeto: objeto };
}

exports.hypergestorTest = onRequest(
  { region: "southamerica-east1" },
  async (req, res) => {
    cors(res);
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const testPayload = {
      Rota: "lead-novo",
      Empresa: HYPERGESTOR_EMPRESA,
      Objeto: {
        nome: `TESTE API ${stamp}`,
        whatsapp: "5519000000000",
        telefone: "5519000000000",
        email: "",
        mensagem: "Lead de teste disparado pelo botão 'Testar integração' do admin. Pode deletar.",
        unidade: HYPERGESTOR_UNIDADE,
        numeroUnico_segmentos_de_lead: HYPERGESTOR_SEGMENTO,
        numeroUnico_departamentos_de_lead: HYPERGESTOR_DEPARTAMENTO,
        numeroUnico_fontes_de_lead: HYPERGESTOR_FONTE,
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
      const r = await fetch(HYPERGESTOR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });
      const text = await r.text();
      res.json({
        ok: r.ok,
        status: r.status,
        body: text.slice(0, 800),
      });
    } catch (e) {
      res.status(502).json({
        ok: false,
        status: 0,
        body: "",
        error: String(e?.message || e).slice(0, 500),
      });
    }
  }
);

exports.hypergestorSend = onRequest(
  { region: "southamerica-east1", cors: true },
  async (req, res) => {
    cors(res);
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
    if (req.method !== "POST") { res.status(405).json({ ok: false, error: "POST only" }); return; }

    const { leadId, lead } = req.body || {};
    if (!lead || !lead.whatsapp) {
      if (leadId) {
        await db.collection("leads").doc(leadId).update({
          hypergestor_error: "Lead sem whatsapp — não é possível enviar pro CRM",
          hypergestor_error_at: admin.firestore.FieldValue.serverTimestamp(),
        }).catch(() => {});
      }
      res.status(400).json({ ok: false, error: "lead.whatsapp obrigatório" });
      return;
    }

    const payload = buildHypergestorPayload(lead, new Date());

    try {
      const r = await fetch(HYPERGESTOR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await r.text();

      if (leadId) {
        const ref = db.collection("leads").doc(leadId);
        if (r.ok) {
          await ref.update({
            hypergestor_sent_at: admin.firestore.FieldValue.serverTimestamp(),
            hypergestor_response: text.slice(0, 500),
          }).catch(() => {});
        } else {
          await ref.update({
            hypergestor_error: `HTTP ${r.status}: ${text.slice(0, 300)}`,
            hypergestor_error_at: admin.firestore.FieldValue.serverTimestamp(),
          }).catch(() => {});
        }
      }

      res.json({ ok: r.ok, status: r.status, body: text.slice(0, 500) });
    } catch (e) {
      const msg = String(e?.message || e).slice(0, 500);
      if (leadId) {
        await db.collection("leads").doc(leadId).update({
          hypergestor_error: msg,
          hypergestor_error_at: admin.firestore.FieldValue.serverTimestamp(),
        }).catch(() => {});
      }
      res.status(502).json({ ok: false, status: 0, body: "", error: msg });
    }
  }
);

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
