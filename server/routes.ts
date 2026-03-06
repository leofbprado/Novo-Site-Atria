import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const AUTOCONF_API = process.env.AUTOCONF_API_URL || "https://api.autoconf.com.br";
const AUTOCONF_BEARER = process.env.AUTOCONF_BEARER || "";
const AUTOCONF_TOKEN = process.env.AUTOCONF_TOKEN || "";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "atria2024";

async function autoconfPost(endpoint: string, body: Record<string, unknown>) {
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

  // ── OpenAI key (save to runtime, not persisted) ──────────────────────────
  let openaiKey = process.env.OPENAI_API_KEY || "";

  app.get("/api/admin/openai-key", (_req: Request, res: Response) => {
    res.json({ key: openaiKey ? "****" + openaiKey.slice(-4) : "" });
  });

  app.post("/api/admin/openai-key", (req: Request, res: Response) => {
    openaiKey = req.body.key || "";
    res.json({ ok: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
