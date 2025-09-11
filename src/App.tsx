
import React, { useState, useEffect, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { StockProvider } from './contexts/StockContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { SearchProvider } from './contexts/SearchContext';
import { Toaster } from './components/ui/toaster';
import { LoginForm } from './components/LoginForm';
import { PageLoader, NavigationLoader } from './components/Layout/PageLoader';
import { PageTransition } from './components/Layout/PageTransition';
import { SessionWarningDialog } from './components/Dialogs/SessionWarningDialog';
import { SessionStatus } from './components/Layout/SessionStatus';
import { offlineManager } from './lib/offlineManager';

// Lazy load components
const Index = React.lazy(() => import('./pages/Index'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Suppliers = React.lazy(() => import('./pages/Suppliers'));
const Movements = React.lazy(() => import('./pages/Movements'));
const Scanner = React.lazy(() => import('./pages/Scanner'));
const BudgetRequest = React.lazy(() => import('./pages/BudgetRequest'));
const ApprovalPage = React.lazy(() => import('./pages/ApprovalPage'));
const ApprovalHistory = React.lazy(() => import('./pages/ApprovalHistory'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Settings = React.lazy(() => import('./pages/Settings'));
const SecuritySettings = React.lazy(() => import('./pages/SecuritySettings'));
const SearchResults = React.lazy(() => import('./pages/SearchResults'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Enhanced loading component with better UX
const LoadingSpinner = ({ message = 'กำลังโหลด...' }: { message?: string }) => (
  <PageLoader message={message} size="lg" />
);

// Layout component for authenticated routes
function AppLayout() {
  return (
    <NavigationProvider>
      <div className="font-thai">
        <PageTransition>
          <Outlet />
        </PageTransition>
        <Toaster />
      </div>
    </NavigationProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading, sessionWarning, timeRemaining, extendSession, logout } = useAuth();

  // Initialize offline manager
  useEffect(() => {
    console.log('Initializing offline manager...');
    // offlineManager is already initialized in its constructor
  }, []);

  // Debug logging
  console.log('AppContent render:', { isAuthenticated, loading });

  if (loading) {
    console.log('Showing loading screen');
    return <LoadingSpinner message="กำลังตรวจสอบการเข้าสู่ระบบ..." />;
  }

  const handleLoginSuccess = () => {
    // Login will be handled by AuthContext automatically
  };

  if (!isAuthenticated) {
    console.log('Showing login form');
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  console.log('User is authenticated, showing main app');

  // Create router with future flags
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Index />
            </Suspense>
          ),
        },
        {
          path: "dashboard",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          ),
        },
        {
          path: "products",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Products />
            </Suspense>
          ),
        },
        {
          path: "categories",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Categories />
            </Suspense>
          ),
        },
        {
          path: "suppliers",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Suppliers />
            </Suspense>
          ),
        },
        {
          path: "movements",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Movements />
            </Suspense>
          ),
        },
        {
          path: "scanner",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Scanner />
            </Suspense>
          ),
        },
        {
          path: "budget-request",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <BudgetRequest />
            </Suspense>
          ),
        },
        {
          path: "approval",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ApprovalPage />
            </Suspense>
          ),
        },
        {
          path: "approval/list",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ApprovalHistory />
            </Suspense>
          ),
        },
        {
          path: "approval/:request_id",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <ApprovalPage />
            </Suspense>
          ),
        },
        {
          path: "reports",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Reports />
            </Suspense>
          ),
        },
        {
          path: "settings",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <Settings />
            </Suspense>
          ),
        },
        {
          path: "security",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <SecuritySettings />
            </Suspense>
          ),
        },
        {
          path: "search",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <SearchResults />
            </Suspense>
          ),
        },
        {
          path: "*",
          element: (
            <Suspense fallback={<LoadingSpinner />}>
              <NotFound />
            </Suspense>
          ),
        },
      ],
    },
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  });

  return (
    <>
      <RouterProvider router={router} />
      <SessionWarningDialog
        isOpen={sessionWarning}
        onExtend={extendSession}
        onLogout={logout}
        timeRemaining={timeRemaining}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </StockProvider>
    </AuthProvider>
  );
}

export default App;
