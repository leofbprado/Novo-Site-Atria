import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

// Eager-loaded (above the fold)
import Home from "@/pages/Home";

// Complementa vite:preloadError (em main.tsx) — cobre o caso onde o import()
// dinâmico falha direto (sem preload anterior). Recarrega 1x pra pegar HTML
// atual; compartilha o cooldown "chunk-reload-ts" pra não loopar.
function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (err) {
      const last = Number(sessionStorage.getItem("chunk-reload-ts") || 0);
      if (Date.now() - last < 30_000) throw err;
      sessionStorage.setItem("chunk-reload-ts", String(Date.now()));
      console.warn("[chunk-recovery] import() falhou, recarregando:", err);
      window.location.reload();
      return new Promise<{ default: T }>(() => {}); // segura o Suspense até o reload
    }
  });
}

// Lazy-loaded pages (below the fold / separate routes)
const Estoque = lazyWithRetry(() => import("@/pages/Estoque"));
const VehicleDetail = lazyWithRetry(() => import("@/pages/VehicleDetail"));
const VendaSeuCarro = lazyWithRetry(() => import("@/pages/VendaSeuCarro"));
const Financiamento = lazyWithRetry(() => import("@/pages/Financiamento"));
const Sobre = lazyWithRetry(() => import("@/pages/Sobre"));
const Blog = lazyWithRetry(() => import("@/pages/Blog"));
const BlogPostPage = lazyWithRetry(() => import("@/pages/BlogPost"));
const Admin = lazyWithRetry(() => import("@/pages/admin/Admin"));
const NotFound = lazyWithRetry(() => import("@/pages/not-found"));
const MotorleadsRedirect = lazyWithRetry(() => import("@/pages/MotorleadsRedirect"));

// Simple full-page spinner for route transitions
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" aria-label="Carregando página" role="status">
      <div className="w-10 h-10 rounded-full border-4 border-atria-gray-medium border-t-atria-navy animate-spin" />
    </div>
  );
}

// Client-side redirect for old URLs
function Redirect({ to }: { to: string }) {
  window.location.replace(to);
  return null;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={ROUTES.home} component={() => <Layout><Home /></Layout>} />
        {/* Old fixed-page URLs — redirect before new routes (wouter matches by prefix) */}
        <Route path="/estoque" component={() => <Redirect to={ROUTES.estoque} />} />
        <Route path="/venda-seu-carro" component={() => <Redirect to={ROUTES.venderCarro} />} />
        <Route path="/financiamento" component={() => <Redirect to={ROUTES.financiamento} />} />
        <Route path="/sobre" component={() => <Redirect to={ROUTES.sobre} />} />
        {/* New SEO routes */}
        <Route path={ROUTES.estoque} component={() => <Layout><Estoque /></Layout>} />
        {/* Motorleads legacy URLs — MUST come before /campinas-sp/:slug (more specific first) */}
        <Route path="/campinas-sp/veiculo-seminovo-usado-atria/:slug" component={() => <MotorleadsRedirect />} />
        <Route path="/campinas-sp/:slug" component={() => <Layout><VehicleDetail /></Layout>} />
        <Route path={ROUTES.venderCarro} component={() => <Layout><VendaSeuCarro /></Layout>} />
        <Route path={ROUTES.financiamento} component={() => <Layout><Financiamento /></Layout>} />
        <Route path={ROUTES.sobre} component={() => <Layout><Sobre /></Layout>} />
        <Route path="/blog/:slug" component={() => <Layout><BlogPostPage /></Layout>} />
        <Route path={ROUTES.blog} component={() => <Layout><Blog /></Layout>} />
        {/* Old vehicle URLs — still resolve via old_slug fallback */}
        <Route path="/campinas/:slug" component={() => <Layout><VehicleDetail /></Layout>} />
        <Route path="/veiculo/:slug" component={() => <Layout><VehicleDetail /></Layout>} />
        <Route path={ROUTES.admin} component={() => <Admin />} />
        <Route component={() => <Layout><NotFound /></Layout>} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
