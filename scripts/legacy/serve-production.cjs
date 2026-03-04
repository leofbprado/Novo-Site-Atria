const express = require("express");
const path = require("path");
const compression = require("compression");
const history = require("connect-history-api-fallback");

const app = express();
app.disable("x-powered-by");

const DIST = path.join(__dirname, "dist");

// API (se houver) deve vir ANTES do history:
// app.use("/api", apiRouter);

app.use(history({
  disableDotRule: true,
  htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
  rewrites: [
    // deixar sair do fallback arquivos estáticos e SEO
    { from: /^\/(assets|favicon\.ico)(\/.*)?$/, to: ctx => ctx.parsedUrl.pathname },
    { from: /^\/robots\.txt$/, to: "/robots.txt" },
    { from: /^\/sitemap(\.xml|\/.*)?$/, to: ctx => ctx.parsedUrl.pathname },
  ],
}));

app.use(compression());
app.use("/assets", express.static(path.join(DIST, "assets"), { immutable: true, maxAge: "1y" }));
app.use(express.static(DIST, { maxAge: "1h", etag: true }));

const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Production server on http://localhost:${port}`);
});
