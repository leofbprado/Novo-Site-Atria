/**
 * Re-pesquisa specs técnicas de TODOS os veículos publicados usando Sonnet + web_search.
 *
 * Por que existe: a primeira leva de specs foi gerada por GPT sem web_search e
 * inventou medidas (potência, torque, dimensões). Esse script re-roda com Sonnet
 * + web_search (fontes reais — CarrosNaWeb, iCarros, Quatro Rodas, Inmetro).
 *
 * Estratégia:
 *   1. Faz BACKUP do technical_specs atual em technical_specs_backup_gpt
 *      (só na primeira vez — se já existe backup, não sobrescreve)
 *   2. Pesquisa nova via Sonnet + web_search
 *   3. Sobrescreve technical_specs (se a pesquisa retornou algo)
 *   4. Loga cada veículo: antes vs depois, campo a campo
 *   5. Salva relatório completo em scripts/specs-audit-report.json
 *   6. Salva CSV legível em scripts/specs-audit-report.csv
 *
 * Como rodar:
 *   1. Confirma que docs/legacy-data/novo-site-atria-new.json existe (service account)
 *   2. Confirma que existe a chave Claude no Firestore (admin_config/admin → claude_key)
 *      Ou define no .env: CLAUDE_API_KEY=sk-ant-...
 *   3. node scripts/refetch-all-specs.js [--dry-run] [--limit=N] [--from=N]
 *
 * Flags:
 *   --dry-run     Não grava nada no Firestore, só simula e mostra o que faria
 *   --limit=N     Processa apenas N veículos (útil pra testar primeiro)
 *   --from=N      Começa do veículo N (útil pra retomar se cair no meio)
 *   --force       Re-pesquisa mesmo veículos que já têm backup
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COLLECTION = "veiculos_admin";
const REPORT_JSON = path.join(__dirname, "specs-audit-report.json");
const REPORT_CSV = path.join(__dirname, "specs-audit-report.csv");
const REPORT_JSON_RETRY = path.join(__dirname, "specs-audit-report-retry.json");
const REPORT_CSV_RETRY = path.join(__dirname, "specs-audit-report-retry.csv");

// ─── Args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const RETRY_FAILED = args.includes("--retry-failed");
const LIMIT = parseInt(args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "0", 10);
const FROM = parseInt(args.find((a) => a.startsWith("--from="))?.split("=")[1] || "0", 10);

// ─── Spec field labels (para o CSV) ──────────────────────────────────────────
const SPEC_FIELDS = [
  { key: "potenciaCv", label: "Potência (cv)" },
  { key: "torqueKgfM", label: "Torque (kgf·m)" },
  { key: "comprimentoMm", label: "Comprimento (mm)" },
  { key: "larguraMm", label: "Largura (mm)" },
  { key: "alturaMm", label: "Altura (mm)" },
  { key: "entreEixosMm", label: "Entre-eixos (mm)" },
  { key: "pesoKg", label: "Peso (kg)" },
  { key: "portaMalasLitros", label: "Porta-malas (L)" },
  { key: "tanqueLitros", label: "Tanque (L)" },
  { key: "consumoCidadeKmL", label: "Consumo urbano (km/l)" },
  { key: "consumoEstradaKmL", label: "Consumo rodov. (km/l)" },
];

// ─── Firebase init ───────────────────────────────────────────────────────────
function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString()
    );
    return cert(json);
  }
  const candidate = path.join(__dirname, "../docs/legacy-data/novo-site-atria-new.json");
  if (fs.existsSync(candidate)) {
    const json = JSON.parse(fs.readFileSync(candidate, "utf8"));
    if (json.private_key && json.client_email) return cert(json);
  }
  throw new Error("Sem credencial Firebase. Coloque o JSON em docs/legacy-data/novo-site-atria-new.json ou setar FIREBASE_SERVICE_ACCOUNT.");
}

initializeApp({ credential: getCredential() });
const db = getFirestore();

// ─── Carrega chave Claude ────────────────────────────────────────────────────
async function loadClaudeKey() {
  // 1. .env
  if (process.env.CLAUDE_API_KEY) return process.env.CLAUDE_API_KEY;
  // 2. Firestore config/admin
  const snap = await db.collection("config").doc("admin").get();
  const data = snap.data();
  if (data?.claude_key) return data.claude_key;
  throw new Error("Sem chave Claude. Defina CLAUDE_API_KEY no env ou em config/admin.claude_key");
}

// ─── Sonnet + web_search ─────────────────────────────────────────────────────
async function fetchVehicleSpecs(claudeKey, v) {
  const tipo = (v.tipo || "").toLowerCase();
  const isPickup = /pickup|picape|caminhonete/.test(tipo);

  const prompt = `Voce e um especialista em automoveis. Pesquise APENAS dados tecnicos VERIDICOS do veiculo abaixo em fontes confiaveis (CarrosNaWeb, iCarros, Quatro Rodas, Inmetro/PBE Veicular, sites das montadoras).

Veiculo: ${v.marca} ${v.modelo} ${v.versao || ""} ${v.ano_fabricacao}/${v.ano_modelo || v.ano_fabricacao}
Cambio: ${v.cambio || "N/D"} | Combustivel: ${v.combustivel || "N/D"}

REGRAS CRITICAS:
- NUNCA invente numeros. Se nao encontrar um dado, deixe vazio.
- Use APENAS valores publicados em fontes reais.
- Numeros em formato brasileiro (ponto como milhar: "4.361"; virgula como decimal: "12,5").
${isPickup ? '- Este veiculo e PICAPE: no campo "portaMalasLitros" use a capacidade da CACAMBA (ex: "1.200 litros" ou "1.000 kg").' : ""}

Retorne APENAS um JSON valido nesse formato (sem texto antes ou depois, sem markdown):
{
  "specs": {
    "potenciaCv": "",
    "torqueKgfM": "",
    "comprimentoMm": "",
    "larguraMm": "",
    "alturaMm": "",
    "entreEixosMm": "",
    "pesoKg": "",
    "portaMalasLitros": "",
    "tanqueLitros": "",
    "consumoCidadeKmL": "",
    "consumoEstradaKmL": ""
  }
}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": claudeKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API ${res.status}`);
  }

  const data = await res.json();
  const blocks = Array.isArray(data.content) ? data.content : [];
  const text = blocks.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Resposta sem JSON valido");
  const parsed = JSON.parse(match[0]);

  const specsRaw = parsed.specs || {};
  const out = {};
  for (const [k, val] of Object.entries(specsRaw)) {
    const s = String(val ?? "").trim();
    if (s) out[k] = s;
  }
  return out;
}

// ─── Diff entre antes e depois ───────────────────────────────────────────────
function computeDiff(before, after) {
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const changes = [];
  for (const k of allKeys) {
    const a = String(before?.[k] ?? "");
    const b = String(after?.[k] ?? "");
    if (a !== b) {
      let kind = "changed";
      if (!a && b) kind = "added";
      else if (a && !b) kind = "removed";
      changes.push({ field: k, before: a, after: b, kind });
    }
  }
  return changes;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`REFETCH SPECS — Sonnet + web_search`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Modo: ${DRY_RUN ? "DRY-RUN (não grava)" : "PRODUÇÃO (grava no Firestore)"}`);
  if (LIMIT) console.log(`Limite: ${LIMIT} veículos`);
  if (FROM) console.log(`Começando do índice: ${FROM}`);
  if (FORCE) console.log(`Force: vai re-pesquisar mesmo quem já tem backup`);
  console.log("");

  const claudeKey = await loadClaudeKey();
  console.log(`✓ Chave Claude carregada (${claudeKey.slice(0, 12)}...)`);

  let vehicles;
  if (RETRY_FAILED) {
    // Lê IDs das falhas do relatório anterior e re-busca só esses no Firestore
    if (!fs.existsSync(REPORT_JSON)) {
      throw new Error("--retry-failed exige relatório anterior em " + REPORT_JSON);
    }
    const prev = JSON.parse(fs.readFileSync(REPORT_JSON, "utf8"));
    const failedIds = prev.vehicles.filter((v) => v.status === "error").map((v) => v.id);
    console.log(`✓ ${failedIds.length} IDs com falha no relatório anterior`);
    if (failedIds.length === 0) {
      console.log("Nada pra re-rodar. Tudo já passou.");
      return;
    }
    const docs = await Promise.all(
      failedIds.map((id) => db.collection(COLLECTION).doc(id).get())
    );
    vehicles = docs
      .filter((d) => d.exists)
      .map((d) => ({ id: d.id, ref: d.ref, ...d.data() }));
    console.log(`✓ ${vehicles.length} ainda existem no Firestore`);
  } else {
    const snap = await db
      .collection(COLLECTION)
      .where("status", "==", "publicado")
      .get();
    vehicles = snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }));
    console.log(`✓ ${vehicles.length} veículos publicados encontrados`);
  }

  // Aplica from + limit
  if (FROM > 0) vehicles = vehicles.slice(FROM);
  if (LIMIT > 0) vehicles = vehicles.slice(0, LIMIT);
  console.log(`→ Vai processar ${vehicles.length} veículos\n`);

  const report = {
    startedAt: new Date().toISOString(),
    mode: DRY_RUN ? "dry-run" : "production",
    total: vehicles.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    vehicles: [],
  };

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    const idx = FROM + i + 1;
    const label = `[${idx}/${FROM + vehicles.length}] ${v.marca} ${v.modelo} ${v.ano_fabricacao}`;
    process.stdout.write(`${label}... `);

    const before = v.technical_specs || {};
    const hasBackup = !!v.technical_specs_backup_gpt;

    try {
      const after = await fetchVehicleSpecs(claudeKey, v);

      if (Object.keys(after).length === 0) {
        console.log("⚠ vazio (mantém antigo)");
        report.skipped++;
        report.vehicles.push({
          id: v.id,
          marca: v.marca,
          modelo: v.modelo,
          ano: v.ano_fabricacao,
          status: "empty_response",
          before,
          after: null,
          changes: [],
        });
        continue;
      }

      const changes = computeDiff(before, after);

      if (!DRY_RUN) {
        const updates = { technical_specs: after };
        // Backup só se ainda não existe (ou se --force)
        if (!hasBackup || FORCE) {
          updates.technical_specs_backup_gpt = before;
        }
        await v.ref.update(updates);
      }

      console.log(`✓ ${changes.length} mudança${changes.length !== 1 ? "s" : ""}`);
      report.succeeded++;
      report.vehicles.push({
        id: v.id,
        marca: v.marca,
        modelo: v.modelo,
        ano: v.ano_fabricacao,
        status: "ok",
        before,
        after,
        changes,
      });
    } catch (e) {
      console.log(`✗ erro: ${e.message}`);
      report.failed++;
      report.vehicles.push({
        id: v.id,
        marca: v.marca,
        modelo: v.modelo,
        ano: v.ano_fabricacao,
        status: "error",
        error: e.message,
        before,
        after: null,
        changes: [],
      });
    }

    report.processed++;

    // Salva o relatório a cada 5 veículos (resilência)
    if ((i + 1) % 5 === 0) {
      fs.writeFileSync(RETRY_FAILED ? REPORT_JSON_RETRY : REPORT_JSON, JSON.stringify(report, null, 2));
    }

    // Pausa pra não estourar rate limit (Sonnet é generoso mas web_search é mais lento)
    if (i < vehicles.length - 1) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  report.finishedAt = new Date().toISOString();

  // Salva relatório final
  const jsonPath = RETRY_FAILED ? REPORT_JSON_RETRY : REPORT_JSON;
  const csvPath = RETRY_FAILED ? REPORT_CSV_RETRY : REPORT_CSV;
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeCsv(report, csvPath);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`CONCLUÍDO`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Processados:  ${report.processed}`);
  console.log(`Sucesso:      ${report.succeeded}`);
  console.log(`Vazios:       ${report.skipped}`);
  console.log(`Falhas:       ${report.failed}`);
  console.log(`\nRelatório JSON: ${jsonPath}`);
  console.log(`Relatório CSV:  ${csvPath}`);
}

function writeCsv(report, csvPath) {
  const lines = [];
  // Header
  lines.push([
    "marca", "modelo", "ano", "id", "status", "campo", "antes_gpt", "depois_sonnet", "tipo_mudanca"
  ].map(csvEscape).join(","));

  for (const v of report.vehicles) {
    if (v.status === "error") {
      lines.push([v.marca, v.modelo, v.ano, v.id, "ERRO", v.error || "", "", "", ""].map(csvEscape).join(","));
      continue;
    }
    if (v.status === "empty_response") {
      lines.push([v.marca, v.modelo, v.ano, v.id, "VAZIO", "", "", "", ""].map(csvEscape).join(","));
      continue;
    }
    if (v.changes.length === 0) {
      lines.push([v.marca, v.modelo, v.ano, v.id, "SEM_MUDANCAS", "", "", "", ""].map(csvEscape).join(","));
      continue;
    }
    for (const c of v.changes) {
      const fieldLabel = SPEC_FIELDS.find((f) => f.key === c.field)?.label || c.field;
      lines.push([v.marca, v.modelo, v.ano, v.id, "OK", fieldLabel, c.before, c.after, c.kind].map(csvEscape).join(","));
    }
  }

  fs.writeFileSync(csvPath, lines.join("\n"));
}

function csvEscape(s) {
  const str = String(s ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

main().catch((e) => {
  console.error("\n❌ Erro fatal:", e);
  process.exit(1);
});
