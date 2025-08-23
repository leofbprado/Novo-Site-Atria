import "./styles/style.css";
import "./styles/loading.css";
import "photoswipe/dist/photoswipe.css";
// import "rc-slider/assets/index.css"; // Temporariamente comentado
import { useEffect, lazy, Suspense } from "react";
import Context from "@/context/Context";
import BackToTop from "@/components/common/BackToTop";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FilterProvider } from "./contexts/FilterContext";
import ScrollTopBehaviour from "./components/common/ScrollToTopBehaviour";
import ScrollToTop from "./components/common/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import WebSiteSchema from "./components/seo/WebSiteSchema";


// Loading component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
  </div>
);

// Lazy load all pages
const HomePage1 = lazy(() => import("./pages"));
const HomePage2 = lazy(() => import("./pages/homes/home-2"));
const HomePage3 = lazy(() => import("./pages/homes/home-3"));
const HomePage4 = lazy(() => import("./pages/homes/home-4"));
const HomePage5 = lazy(() => import("./pages/homes/home-5"));
const HomePage6 = lazy(() => import("./pages/homes/home-6"));
const HomePage7 = lazy(() => import("./pages/homes/home-7"));
const HomePage8 = lazy(() => import("./pages/homes/home-8"));
const HomePage9 = lazy(() => import("./pages/homes/home-9"));
const HomePage10 = lazy(() => import("./pages/homes/home-10"));

const InventoryListPage1 = lazy(() => import("./pages/car-listings/inventory-list-01"));
const InventorySinglePage1 = lazy(() => import("./pages/car-singles/inventory-page-single-v1"));
const BlogListingPage2 = lazy(() => import("./pages/blogs/blog-list-02"));
const BlogSinglePage = lazy(() => import("./pages/blogs/blog-single"));
const AboutPage = lazy(() => import("./pages/otherPages/AboutPage"));
const LoanCalculatorPage = lazy(() => import("./pages/otherPages/loan-calculator"));
const SellCarPage = lazy(() => import("./components/sellCar/SellCarPage"));
const FavoritePage = lazy(() => import("./pages/_interno/area-cliente/favorite"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const EstoqueLayout = lazy(() => import("./layouts/EstoqueLayout"));
const FinanciamentoLayout = lazy(() => import("./layouts/FinanciamentoLayout"));
const FinanciamentoContent = lazy(() => import("./components/financiamento/FinanciamentoContent"));
const EstoqueTestePage = lazy(() => import("./pages/estoque/EstoqueTestePage"));

// Less used pages
const NotFoundPage = lazy(() => import("./pages/not-found"));
const ComparePage = lazy(() => import("./pages/otherPages/compare"));
const LoginPage = lazy(() => import("./pages/otherPages/login"));
const DashboardPage = lazy(() => import("./pages/_interno/area-cliente/dashboard"));
const MyListingsPage = lazy(() => import("./pages/_interno/area-cliente/my-listings"));
const AddListingsPage = lazy(() => import("./pages/_interno/area-cliente/add-listings"));
const SavedPage = lazy(() => import("./pages/_interno/area-cliente/saved"));
const MessagesPage = lazy(() => import("./pages/_interno/area-cliente/messages"));
const ProfilePage = lazy(() => import("./pages/_interno/area-cliente/profile"));
const UIElementsPage = lazy(() => import("./pages/_interno/elementos-interface"));
const EstoqueSite = lazy(() => import("./pages/estoque/EstoqueSite"));
const EstoqueAdmin = lazy(() => import("./pages/estoque/EstoqueAdmin"));

const CredereTest = lazy(() => import("./pages/others/CredereTest"));
const TestCredereAuth = lazy(() => import("./pages/others/TestCredereAuth"));
const CredereAuthExplainer = lazy(() => import("./pages/others/CredereAuthExplainer"));
const CredereSolutionGuide = lazy(() => import("./pages/others/CredereSolutionGuide"));
const CredereSetupHelper = lazy(() => import("./pages/others/CredereSetupHelper"));
const CredereFinalSolution = lazy(() => import("./pages/others/CredereFinalSolution"));
const CrederePluginSolution = lazy(() => import("./pages/others/CrederePluginSolution"));

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Import the script only on the client side
      import("bootstrap/dist/js/bootstrap.esm").then(() => {
        // Module is imported, you can access any exported functionality if
      });
    }
  }, []);

  // useEffect(() => {
  //   new WOW({
  //     live: false,
  //   }).init();
  // }, [pathname]);

  return (
    <>
      <AuthProvider>
        <FilterProvider>
          <Context>
            <ScrollToTop />
            <div className="boxcar-wrapper">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/">
                  <Route index element={<HomePage1 />} />


              <Route path="home-2" element={<HomePage2 />} />
              <Route path="home-3" element={<HomePage3 />} />
              <Route path="home-4" element={<HomePage4 />} />
              <Route path="home-5" element={<HomePage5 />} />
              <Route path="home-6" element={<HomePage6 />} />
              <Route path="home-7" element={<HomePage7 />} />
              <Route path="home-8" element={<HomePage8 />} />
              <Route path="home-9" element={<HomePage9 />} />
              <Route path="home-10" element={<HomePage10 />} />

              {/* Main Navigation Routes */}
              <Route path="estoque" element={<EstoqueLayout />}>
                <Route index element={<InventoryListPage1 />} />
              </Route>
              <Route 
                path="estoque/:identifier" 
                element={
                  <ErrorBoundary>
                    <InventorySinglePage1 />
                  </ErrorBoundary>
                } 
              />
              
              {/* Nova rota SEO com shortId - /carros/{marca}/{modelo}/{ano}-{shortId} */}
              <Route 
                path="carros/:marca/:modelo/:slug" 
                element={
                  <ErrorBoundary>
                    <InventorySinglePage1 />
                  </ErrorBoundary>
                } 
              />
              
              <Route path="estoque-teste" element={<EstoqueTestePage />} />
              <Route path="financiamento" element={<FinanciamentoLayout />}>
                <Route index element={<FinanciamentoContent />} />
              </Route>
              <Route path="simulador" element={<LoanCalculatorPage />} />
              <Route path="favoritos" element={<FavoritePage />} />
              <Route path="vender" element={<SellCarPage />} />
              <Route path="blog" element={<BlogListingPage2 />} />
              <Route path="sobre" element={<AboutPage />} />

              {/* Original Routes for Compatibility */}
              <Route
                path="inventory-list-01"
                element={<InventoryListPage1 />}
              />
              <Route
                path="veiculo/:identifier"
                element={<InventorySinglePage1 />}
              />
              <Route
                path="veiculo-individual/:identifier"
                element={<InventorySinglePage1 />}
              />

              <Route path="blog-list-02" element={<BlogListingPage2 />} />
              <Route path="blog-single/:id" element={<BlogSinglePage />} />
              <Route path="blog/:slug" element={<BlogSinglePage />} />



              {/* Área do Cliente - Páginas internas apenas por acesso direto */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="my-listings" element={<MyListingsPage />} />
              <Route path="add-listings" element={<AddListingsPage />} />
              <Route path="favorite" element={<FavoritePage />} />
              <Route path="saved" element={<SavedPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="profile" element={<ProfilePage />} />

              <Route path="about" element={<AboutPage />} />
              <Route path="login" element={<LoginPage />} />

              <Route path="loan-calculator" element={<LoanCalculatorPage />} />
              <Route path="comparar" element={<ComparePage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="venda-seu-carro" element={<SellCarPage />} />
              
              {/* Admin Routes */}
              <Route path="admin" element={<AdminPage />} />
              <Route path="admin/estoque" element={<EstoqueAdmin />} />
              
              {/* Test Routes */}
              <Route path="credere-test" element={<CredereTest />} />
              <Route path="test-credere-auth" element={<TestCredereAuth />} />
              <Route path="credere-explicacao" element={<CredereAuthExplainer />} />
              <Route path="credere-guia-completo" element={<CredereSolutionGuide />} />
              <Route path="credere-setup" element={<CredereSetupHelper />} />
              <Route path="credere-solucao" element={<CredereFinalSolution />} />
              <Route path="credere-plugin" element={<CrederePluginSolution />} />
              
              <Route path="404" element={<NotFoundPage />} />

              {/* Elementos de Interface - acesso direto apenas */}
              <Route path="_interno/elementos-interface" element={<UIElementsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
            </Suspense>
          </div>
          </Context>
          <BackToTop />
          <ScrollTopBehaviour />
        </FilterProvider>
      </AuthProvider>
      {/* Global SEO Schema */}
      <WebSiteSchema />
    </>
  );
}

export default App;
