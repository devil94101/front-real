import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { useApp, useAppDispatch, useAppSelector } from "./store/hooks";
import { loadUser } from "./store/slices/authSlice";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PropertyForm } from "./components/PropertyForm";
import { UpgradeModal } from "./components/UpgradeModal";
import { useHashRoute } from "./lib/router";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Properties } from "./pages/Properties";
import { PropertyDetail } from "./pages/PropertyDetail";
import { Vacancies } from "./pages/Vacancies";
import { Deals } from "./pages/Deals";
import { Contacts } from "./pages/Contacts";
import { Team } from "./pages/Team";
import type { Property } from "./types";

function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, isDemoMode } = useAppSelector((s) => s.auth);

  // On mount: validate any existing token. loadInitial() optimistically sets
  // isAuthenticated=true when a token is present, so we must NOT gate on
  // !isAuthenticated here — otherwise the validation never fires and the app
  // stays stuck on "Verifying session…" after a refresh.
  useEffect(() => {
    if (token && !isDemoMode) {
      dispatch(loadUser());
    }
  }, []); // intentionally run once on mount

  return <>{children}</>;
}

function DataLoader({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadAllData } = useApp();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loaded) {
      loadAllData();
      setLoaded(true);
    }
    if (!isAuthenticated) {
      setLoaded(false);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}

function Shell() {
  const route = useHashRoute();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const billing = useAppSelector((s) => s.billing.status);

  // Adding a new property is gated by the plan's listing limit; editing is not.
  const openAdd = () => {
    if (billing && !billing.canList) {
      setUpgradeOpen(true);
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Property) => { setEditing(p); setFormOpen(true); };

  // Public routes (no auth required)
  if (route.view === "login") return <LoginPage />;
  if (route.view === "register") return <RegisterPage />;

  // Protected routes
  let page: React.ReactNode;
  switch (route.view) {
    case "properties":
      page = route.param
        ? <PropertyDetail propertyId={route.param} onEdit={openEdit} />
        : <Properties onAddProperty={openAdd} />;
      break;
    case "vacancies": page = <Vacancies />; break;
    case "deals": page = <Deals />; break;
    case "contacts": page = <Contacts />; break;
    case "team": page = <Team />; break;
    default: page = <Dashboard onAddProperty={openAdd} />;
  }

  return (
    <ProtectedRoute>
      <DataLoader>
        <Layout onAddProperty={openAdd} onUpgrade={() => setUpgradeOpen(true)}>{page}</Layout>
        <PropertyForm open={formOpen} onClose={() => setFormOpen(false)} property={editing} />
        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      </DataLoader>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthGate>
        <Shell />
      </AuthGate>
    </Provider>
  );
}
