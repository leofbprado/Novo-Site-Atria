const { onRequest } = require("firebase-functions/v2/https");

const AUTOCONF_API = "https://api.autoconf.com.br";
const AUTOCONF_BEARER = "5mHbswJ9CEHh18iHhEnkl8nZdVXXq0bNPYh1t9CqyNNqhp5NxlD8s68oCghqMbagDSsUOvqyXSsNp0Q7Euv7hSYEmHahQOlwfaHNgDvjqIaGTu7aXeIWwG8Y8HNxsrvfgqOjLqAFjwJ5JhZ8ZRA6zvBBxHXSNCb5SXKICvLzvr0mWuYDycTuQKCspl1mVCvkyoXdAp1ZGP1u8sbGScrkONASHrEAjl9QXb0klFuDgk8f1kgL5oabZqubnoqaHfyL";
const AUTOCONF_TOKEN = "N0y5JfzY5nTQcNGOQ5D5G0dPXSnG2ngseaALptDS";

async function autoconfPost(endpoint, body) {
  const res = await fetch(`${AUTOCONF_API}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTOCONF_BEARER}`,
    },
    body: JSON.stringify({ token: AUTOCONF_TOKEN, ...body }),
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
