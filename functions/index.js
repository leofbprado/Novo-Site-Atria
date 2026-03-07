const { onRequest } = require("firebase-functions/v2/https");

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
      Authorization: `Bearer ${AUTOCONF_BEARER}`,
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
    const path = req.path.replace(/^\//, "");

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
