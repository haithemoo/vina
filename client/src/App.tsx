import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import CreatorProfile from "./pages/CreatorProfile";
import Checkout from "./pages/Checkout";
import CreatorDashboard from "./pages/CreatorDashboard";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Auth from "./pages/Auth";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/category/:id"} component={CategoryPage} />
      <Route path={"/product/:id"} component={ProductDetail} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/orders"} component={OrderHistory} />
      <Route path={"/creator/:id"} component={CreatorProfile} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/creator-dashboard"} component={CreatorDashboard} />
      <Route path={"/help"} component={Help} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/login"} component={Auth} />
      <Route path={"/register"} component={Auth} />
      <Route path={"/auth"} component={Auth} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
