import { lazy, Suspense } from "react";
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

// Lazy-loaded pages (below the fold / separate routes)
const Estoque = lazy(() => import("@/pages/Estoque"));
const VehicleDetail = lazy(() => import("@/pages/VehicleDetail"));
const VendaSeuCarro = lazy(() => import("@/pages/VendaSeuCarro"));
const Financiamento = lazy(() => import("@/pages/Financiamento"));
const Sobre = lazy(() => import("@/pages/Sobre"));
const Admin = lazy(() => import("@/pages/admin/Admin"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
        <Route path="/campinas/:slug" component={() => <Layout><VehicleDetail /></Layout>} />
        <Route path={ROUTES.venderCarro} component={() => <Layout><VendaSeuCarro /></Layout>} />
        <Route path={ROUTES.financiamento} component={() => <Layout><Financiamento /></Layout>} />
        <Route path={ROUTES.sobre} component={() => <Layout><Sobre /></Layout>} />
        {/* Old vehicle URLs — still resolve via old_slug fallback */}
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
