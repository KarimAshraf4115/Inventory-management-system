import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { StoreProvider } from '@/store';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { ItemsPage } from '@/pages/Items';
import { PartiesPage } from '@/pages/Parties';
import { InvoicesPage } from '@/pages/Invoices';
import { NewInvoicePage } from '@/pages/NewInvoice';
import { PaymentsPage } from '@/pages/Payments';
import { ReturnsPage } from '@/pages/Returns';
import { ExpensesPage } from '@/pages/Expenses';
import { StockMovementPage } from '@/pages/StockMovement';
import type { PageKey } from '@/types';
import { api } from './api';


function AuthedApp() {
  const { logout } = useAuth();
  const [page, setPage] = useState<PageKey>('dashboard');

  const render = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard onNavigate={setPage} />;
      case 'items':
        return <ItemsPage onNavigate={setPage} />;
      case 'customers':
        return <PartiesPage kind="customers" onNavigate={setPage} />;
      case 'suppliers':
        return <PartiesPage kind="suppliers" onNavigate={setPage} />;
      case 'invoices':
        return <InvoicesPage onNavigate={setPage} />;
      case 'new-invoice':
        return <NewInvoicePage onNavigate={setPage} />;
      case 'payments':
        return <PaymentsPage />;
      case 'returns':
        return <ReturnsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'stock':
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