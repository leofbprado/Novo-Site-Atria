import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";

// Eager-loaded (above the fold)
import Home from "@/pages/Home";

// Lazy-loaded pages (below the fold / separate routes)
const Estoque = lazy(() => import("@/pages/Estoque"));
const VehicleDetail = lazy(() => import("@/pages/VehicleDetail"));
const Financiamento = lazy(() => import("@/pages/Financiamento"));
const Sobre = lazy(() => import("@/pages/Sobre"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Simple full-page spinner for route transitions
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white" aria-label="Carregando página" role="status">
      <div className="w-10 h-10 rounded-full border-4 border-atria-gray-medium border-t-atria-navy animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={() => <Layout><Home /></Layout>} />
        <Route path="/estoque" component={() => (
          <Layout>
            <Estoque />
          </Layout>
        )} />
        <Route path="/veiculo/:slug" component={() => (
          <Layout>
            <VehicleDetail />
          </Layout>
        )} />
        <Route path="/financiamento" component={() => (
          <Layout>
            <Financiamento />
          </Layout>
        )} />
        <Route path="/sobre" component={() => (
          <Layout>
            <Sobre />
          </Layout>
        )} />
        <Route component={() => <Layout><NotFound /></Layout>} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
