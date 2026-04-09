/**
 * Snapshot do estoque atual pra calibrar campanhas Google Ads.
 * Reporta:
 *   - Marcas e quantidade por marca
 *   - Faixas de preço (até 40k, 40-80k, 80-150k, 150k+)
 *   - Modelos mais recorrentes
 *   - Anos representados
 *
 * Output: scripts/inventory-snapshot.json + console
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getCredential() {
  const candidate = path.join(__dirname, "../docs/legacy-data/novo-site-atria-new.json");
  const json = JSON.parse(fs.readFileSync(candidate, "utf8"));
  return cert(json);
}

initializeApp({ credential: getCredential() });
const db = getFirestore();

async function main() {
  const snap = await db.collection("veiculos_admin").where("status", "==", "publicado").get();
  const vehicles = snap.docs.map((d) => d.data());
  console.log(`Total publicados: ${vehicles.length}\n`);

  // Por marca
  const byMarca = {};
  for (const v of vehicles) {
    const m = v.marca || "?";
    byMarca[m] = (byMarca[m] || 0) + 1;
  }
  console.log("=== POR MARCA ===");
  Object.entries(byMarca).sort((a, b) => b[1] - a[1]).forEach(([m, n]) => {
    console.log(`  ${m}: ${n}`);
  });

  // Faixas de preço
  const faixas = { "ate_40k": 0, "40_80k": 0, "80_150k": 0, "150k_mais": 0 };
  let semPreco = 0;
  for (const v of vehicles) {
    const p = Number(v.preco) || 0;
    if (p === 0) { semPreco++; continue; }
    if (p < 40000) faixas.ate_40k++;
    else if (p < 80000) faixas["40_80k"]++;
    else if (p < 150000) faixas["80_150k"]++;
    else faixas["150k_mais"]++;
  }
  console.log("\n=== POR FAIXA DE PREÇO ===");
  console.log(`  Até R$ 40k:    ${faixas.ate_40k}`);
  console.log(`  R$ 40-80k:     ${faixas["40_80k"]}`);
  console.log(`  R$ 80-150k:    ${faixas["80_150k"]}`);
  console.log(`  R$ 150k+:      ${faixas["150k_mais"]}`);
  if (semPreco) console.log(`  Sem preço:     ${semPreco}`);

  // Top modelos
  const byModelo = {};
  for (const v of vehicles) {
    const key = `${v.marca || "?"} ${v.modelo || "?"}`;
    byModelo[key] = (byModelo[key] || 0) + 1;
  }
  console.log("\n=== TOP 25 MODELOS ===");
  Object.entries(byModelo).sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([m, n]) => {
    console.log(`  ${m}: ${n}`);
  });

  // Anos
  const byAno = {};
  for (const v of vehicles) {
    const a = v.ano_fabricacao || "?";
    byAno[a] = (byAno[a] || 0) + 1;
  }
  console.log("\n=== POR ANO ===");
  Object.entries(byAno).sort((a, b) => Number(b[0]) - Number(a[0])).forEach(([a, n]) => {
    console.log(`  ${a}: ${n}`);
  });

  // Salva snapshot
  const out = {
    total: vehicles.length,
    byMarca,
    faixas,
    topModelos: Object.entries(byModelo).sort((a, b) => b[1] - a[1]).slice(0, 50),
    byAno,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(__dirname, "inventory-snapshot.json"), JSON.stringify(out, null, 2));
  console.log("\nSalvo em scripts/inventory-snapshot.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
