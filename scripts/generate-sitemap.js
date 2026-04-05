/**
 * Generate dynamic sitemap.xml with all published vehicles from Firestore.
 * Runs before vite build (npm run prebuild).
 *
 * Credentials: reads service account from FIREBASE_SERVICE_ACCOUNT env var (base64-encoded JSON)
 * or falls back to local file at docs/legacy-data/novo-site-atria-*.json
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://www.atriaveiculos.com";
const OUTPUT = path.join(__dirname, "../client/public/sitemap.xml");

// ── Firebase init ───────────────────────────────────────────────────────────
function getCredential() {
  // 1) env var (base64-encoded JSON) — used in CI/Cloudflare
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString()
    );
    return cert(json);
  }
  // 2) local file fallback
  const legacyDir = path.join(__dirname, "../docs/legacy-data");
  if (fs.existsSync(legacyDir)) {
    const files = fs.readdirSync(legacyDir).filter((f) => f.endsWith(".json"));
    for (const f of files) {
      const full = path.join(legacyDir, f);
      try {
        const json = JSON.parse(fs.readFileSync(full, "utf8"));
        if (json.private_key && json.client_email) return cert(json);
      } catch { /* skip */ }
    }
  }
  throw new Error(
    "No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT env var (base64 JSON) or place service account in docs/legacy-data/"
  );
}

initializeApp({ credential: getCredential() });
const db = getFirestore();

// ── Fetch published vehicles ────────────────────────────────────────────────
async function getPublishedVehicles() {
  const snap = await db
    .collection("veiculos_admin")
    .where("status", "==", "publicado")
    .orderBy("data_importacao", "desc")
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      slug: data.slug || "",
      lastmod: (data.data_publicacao || data.data_importacao)?.toDate?.() || new Date(),
    };
  });
}

// ── Fetch published blog posts ──────────────────────────────────────────────
async function getPublishedBlogPosts() {
  const snap = await db
    .collection("blog_posts")
    .where("status", "==", "publicado")
    .orderBy("data_publicacao", "desc")
    .get();

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      slug: data.slug || "",
      lastmod: (data.data_publicacao || data.data_criacao)?.toDate?.() || new Date(),
    };
  });
}

// ── Generate XML ────────────────────────────────────────────────────────────
function toW3CDate(d) {
  return d.toISOString().slice(0, 10);
}

function buildSitemap(vehicles, blogPosts) {
  const today = toW3CDate(new Date());

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/estoque-carros-usados-seminovos-campinas-sp", priority: "0.9", changefreq: "daily" },
    { loc: "/vender-carro-usado-campinas-sp", priority: "0.7", changefreq: "monthly" },
    { loc: "/financiamento-carro-usado-seminovo-campinas-sp", priority: "0.7", changefreq: "monthly" },
    { loc: "/sobre-atria-veiculos-campinas-sp", priority: "0.6", changefreq: "monthly" },
    { loc: "/blog", priority: "0.8", changefreq: "weekly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const p of staticPages) {
    xml += `  <url>\n    <loc>${SITE_URL}${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
  }

  for (const v of vehicles) {
    if (!v.slug) continue;
    xml += `  <url>\n    <loc>${SITE_URL}/campinas-sp/${v.slug}</loc>\n    <lastmod>${toW3CDate(v.lastmod)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  for (const bp of blogPosts) {
    if (!bp.slug) continue;
    xml += `  <url>\n    <loc>${SITE_URL}/blog/${bp.slug}</loc>\n    <lastmod>${toW3CDate(bp.lastmod)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Generating sitemap...");
  const vehicles = await getPublishedVehicles();
  console.log(`Found ${vehicles.length} published vehicles`);

  let blogPosts = [];
  try {
    blogPosts = await getPublishedBlogPosts();
    console.log(`Found ${blogPosts.length} published blog posts`);
  } catch { console.log("No blog posts found (collection may not exist yet)"); }

  const xml = buildSitemap(vehicles, blogPosts);
  fs.writeFileSync(OUTPUT, xml, "utf8");

  const totalUrls = 6 + vehicles.length + blogPosts.length;
  console.log(`Sitemap written to ${OUTPUT} (${totalUrls} URLs)`);
}

main().catch((err) => {
  console.error("Sitemap generation failed:", err.message);
  console.log("Keeping existing sitemap.xml");
  process.exit(0); // don't fail the build
});
