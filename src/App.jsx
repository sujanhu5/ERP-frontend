import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Spinner from './components/common/Spinner';

// Public entry points load eagerly; everything behind auth is code-split so the
// initial bundle stays small and each area loads on demand.
import Landing from './pages/landing/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

const AppLayout = lazy(() => import('./components/layout/AppLayout'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ProductList = lazy(() => import('./pages/products/ProductList'));
const CustomerList = lazy(() => import('./pages/customers/CustomerList'));
const SupplierList = lazy(() => import('./pages/suppliers/SupplierList'));
const InvoiceList = lazy(() => import('./pages/invoices/InvoiceList'));
const EmployeeList = lazy(() => import('./pages/employees/EmployeeList'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const ActivityLog = lazy(() => import('./pages/activity/ActivityLog'));
const Settings = lazy(() => import('./pages/settings/Settings'));

const PlatformLayout = lazy(() => import('./components/layout/PlatformLayout'));
const PlatformDashboard = lazy(() => import('./pages/platform/PlatformDashboard'));
const PlatformCompanies = lazy(() => import('./pages/platform/PlatformCompanies'));
const PlatformCompanyDetail = lazy(() => import('./pages/platform/PlatformCompanyDetail'));
const PlatformAudit = lazy(() => import('./pages/platform/PlatformAudit'));

const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-canvas">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: '!bg-surface !text-ink !border !border-line !shadow-overlay !rounded-lg !text-[13px]',
            }}
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Platform Owner control plane — reached only by signing in as platform_owner. */}
              <Route
                element={
                  <ProtectedRoute roles={['platform_owner']}>
                    <PlatformLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/platform" element={<PlatformDashboard />} />
                <Route path="/platform/companies" element={<PlatformCompanies />} />
                <Route path="/platform/companies/:id" element={<PlatformCompanyDetail />} />
                <Route path="/platform/audit" element={<PlatformAudit />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute roles={['admin', 'manager', 'employee']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/suppliers" element={<SupplierList />} />
                <Route path="/invoices" element={<InvoiceList />} />
                <Route path="/employees" element={<EmployeeList />} />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute roles={['admin', 'manager']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute roles={['admin', 'manager']}>
                      <ActivityLog />
                    </ProtectedRoute>
                  }
                />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
