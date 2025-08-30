import React, { useEffect, useState } from "react";

function Row({ label, result }) {
  const { status, detail } = result || {};
  const color =
    status === "OK" ? "#0b8b3c" :
    status === "EMPTY" ? "#6b7280" :
    status === "PENDING" ? "#1f2937" :
    "#b00020";
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid #eee" }}>
      <div style={{ width: 300, fontWeight: 700 }}>{label}</div>
      <div style={{ color, minWidth: 90, fontWeight: 700 }}>{status || "—"}</div>
      <div style={{ opacity: 0.85, whiteSpace: "pre-wrap" }}>{detail || ""}</div>
    </div>
  );
}

export default function FirestoreHealth() {
  const [envInfo, setEnvInfo] = useState({});
  const [results, setResults] = useState({
    "_init/firebase": { status: "PENDING", detail: "" },
    "_init/firestoreLiteImport": { status: "PENDING", detail: "" },
    "lite/blog_posts": { status: "PENDING", detail: "" },
    "lite/depoimentos": { status: "PENDING", detail: "" },
    "lite/veiculos": { status: "PENDING", detail: "" },
    "lite/config/home": { status: "PENDING", detail: "" },
    "_net/rest-blog_posts": { status: "PENDING", detail: "" },
  });

  const setLine = (key, next) =>
    setResults(prev => ({ ...prev, [key]: { ...(prev[key] || {}), ...next } }));

  useEffect(() => {
    (async () => {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "(missing)";
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
      const apiKeyMask = apiKey ? `SET (…${apiKey.slice(-6)})` : "MISSING";

      setEnvInfo({
        projectId,
        host: window.location.host,
        sdk: "Firestore LITE + REST",
        apiKey: apiKeyMask,
      });

      const fmt = (e) => {
        if (!e) return "error";
        const code = e.code || "";
        const msg = e.message || String(e);
        return code ? `${code}: ${msg}` : msg;
      };

      const withTimeout = (promise, ms = 7000) => {
        let t;
        return Promise.race([
          promise,
          new Promise((_, reject) => {
            t = setTimeout(() => reject(new Error(`timeout(${ms}ms)`)), ms);
          }),
        ]).finally(() => clearTimeout(t));
      };

      try {
        // 0) App (do seu config atual)
        const cfg = await import("@/firebase/config");
        const ok = !!cfg.app;
        setLine("_init/firebase", { status: ok ? "OK" : "ERROR", detail: ok ? "app presente" : "app indefinido" });
        if (!ok) return;

        // 1) IMPORTA Firestore **LITE** e cria db a partir do app (sem usar cfg.db)
        let fw;
        try {
          fw = await import("firebase/firestore/lite");
          const fns = ["getFirestore","collection","getDocs","getDoc","doc","query","orderBy","limit"]
            .map(k => (typeof fw[k] === "function" ? k : `${k}(!)`))
            .join(", ");
          setLine("_init/firestoreLiteImport", { status: "OK", detail: `LITE ok: ${fns}` });
        } catch (e) {
          setLine("_init/firestoreLiteImport", { status: "ERROR", detail: fmt(e) });
          return;
        }

        const { getFirestore, collection, getDocs, getDoc, doc, query, orderBy, limit: limitFn } = fw;
        const dbLite = getFirestore(cfg.app); // 👈 usa db LITE puro

        // 2) Consultas via LITE (REST por baixo)
        const runLiteList = async (label, qBuilder) => {
          try {
            const q = qBuilder();
            const snap = await withTimeout(getDocs(q), 7000);
            setLine(label, { status: snap.size > 0 ? "OK" : "EMPTY", detail: `${snap.size} docs` });
          } catch (e) {
            setLine(label, { status: "ERROR", detail: fmt(e) });
          }
        };

        await runLiteList("lite/blog_posts", () =>
          query(collection(dbLite, "blog_posts"), orderBy("publishedAt", "desc"), limitFn(3))
        );
        await runLiteList("lite/depoimentos", () =>
          query(collection(dbLite, "depoimentos"), orderBy("created_at", "desc"), limitFn(3))
        );
        await runLiteList("lite/veiculos", () =>
          query(collection(dbLite, "veiculos"), limitFn(3))
        );

        try {
          const d = await withTimeout(getDoc(doc(dbLite, "config", "home")), 7000);
          setLine("lite/config/home", { status: d.exists() ? "OK" : "EMPTY", detail: d.exists() ? "doc existe" : "doc inexistente" });
        } catch (e) {
          setLine("lite/config/home", { status: "ERROR", detail: fmt(e) });
        }

        // 3) TESTE REST cru (sem SDK) — lista 1 doc de blog_posts
        try {
          if (!apiKey || projectId === "(missing)") {
            setLine("_net/rest-blog_posts", { status: "ERROR", detail: "apiKey/projectId ausentes" });
          } else {
            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blog_posts?pageSize=1&key=${encodeURIComponent(apiKey)}`;
            const res = await withTimeout(fetch(url, { method: "GET" }), 7000);
            if (!res.ok) {
              const txt = await res.text().catch(()=>"");
              setLine("_net/rest-blog_posts", { status: "ERROR", detail: `HTTP ${res.status} ${res.statusText} ${txt?.slice(0,200) || ""}` });
            } else {
              const json = await res.json();
              const count = Array.isArray(json?.documents) ? json.documents.length : 0;
              setLine("_net/rest-blog_posts", { status: count > 0 ? "OK" : "EMPTY", detail: `HTTP 200, ${count} docs` });
            }
          }
        } catch (e) {
          setLine("_net/rest-blog_posts", { status: "ERROR", detail: fmt(e) });
        }
      } catch (e) {
        setLine("_init/firebase", { status: "ERROR", detail: `Falha ao importar/configurar Firebase: ${e?.message || e}` });
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 980, margin: "32px auto", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Firestore Health</h1>
      <div style={{ marginBottom: 16, color: "#444" }}>
        <div><strong>Project ID:</strong> {envInfo.projectId}</div>
        <div><strong>Host:</strong> {envInfo.host}</div>
        <div><strong>SDK:</strong> {envInfo.sdk}</div>
        <div><strong>API Key:</strong> {envInfo.apiKey}</div>
      </div>

      <Row label="Inicialização Firebase (App)" result={results["_init/firebase"]} />
      <Row label="Import Firestore SDK (LITE)" result={results["_init/firestoreLiteImport"]} />
      <Row label="LITE → blog_posts" result={results["lite/blog_posts"]} />
      <Row label="LITE → depoimentos" result={results["lite/depoimentos"]} />
      <Row label="LITE → veiculos" result={results["lite/veiculos"]} />
      <Row label="LITE → config/home" result={results["lite/config/home"]} />
      <Row label="REST → GET blog_posts?pageSize=1" result={results["_net/rest-blog_posts"]} />

      <p style={{ marginTop: 24, fontSize: 13, color: "#6b7280" }}>
        Esta página não altera nada no banco. Apenas lê coleções/documentos para diagnóstico.
      </p>
    </div>
  );
}

