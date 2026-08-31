import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { StoreProvider } from "@/store";
import { Layout } from "@/components/Layout";
import { LoginPage } from "@/pages/LoginPage";
import { Dashboard } from "@/pages/Dashboard";
import { ItemsPage } from "@/pages/Items";
import { PartiesPage } from "@/pages/Parties";
import { InvoicesPage } from "@/pages/Invoices";
import { NewInvoicePage } from "@/pages/NewInvoice";
import { PaymentsPage } from "@/pages/Payments";
import { ReturnsPage } from "@/pages/Returns";
import { ExpensesPage } from "@/pages/Expenses";
import { StockMovementPage } from "@/pages/StockMovement";
import type { PageKey } from "@/types";
import { api } from "./api";

function AuthedApp() {
  const { logout } = useAuth();
  const [page, setPage] = useState<PageKey>("dashboard");
  const [paymentsInvoiceId, setPaymentsInvoiceId] = useState<
    string | undefined
  >(undefined);

  const navigate = (p: PageKey, invoiceId?: string) => {
    if (p === "payments") setPaymentsInvoiceId(invoiceId);
    setPage(p);
  };

  const render = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} />;
      case "items":
        return <ItemsPage onNavigate={navigate} />;
      case "customers":
        return <PartiesPage kind="customers" onNavigate={navigate} />;
      case "suppliers":
        return <PartiesPage kind="suppliers" onNavigate={navigate} />;
      case "invoices":
        return <InvoicesPage onNavigate={navigate} />;
      case "new-invoice":
        return <NewInvoicePage onNavigate={navigate} />;
      case "payments":
        return <PaymentsPage initialInvoiceId={paymentsInvoiceId} />;
      case "returns":
        return <ReturnsPage />;
      case "expenses":
        return <ExpensesPage />;
      case "stock":
        return <StockMovementPage />;
      default:
        return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <StoreProvider>
      <Layout current={page} onNavigate={setPage} onLogout={logout}>
        {render()}
      </Layout>
    </StoreProvider>
  );
}

function Root() {
  const { user } = useAuth();
  return user ? <AuthedApp /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
