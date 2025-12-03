import { queryClient } from '@/lib/queryClient';
import SessionSync from '@/routes/SessionSync';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/ThemeProvider';
import AccountInfoPage from './pages/Account/AccountInfoPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import LandingPage from './pages/home/LandingPage';
import SearchResults from './pages/search/SearchResults';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import MainLayout from './layouts/main-layout/MainLayout';
import { useAuthStore } from './stores/auth';
import AdminDashboard from './pages/home/AdminDashboard';
import UserDashboard from './pages/home/UserDashboard';
import TripsPage from './pages/admin/TripsPage';
import RoutesPage from './pages/admin/RoutesPage';
import BusesPage from './pages/admin/BusesPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
function App() {
  const role = useAuthStore((s) => s.role);

  return (
    <ThemeProvider defaultTheme="light" storageKey="blauchat-theme">
      <Toaster richColors={true} />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <SessionSync />
            <Routes>
              <Route element={<MainLayout />}>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute roles={['USER', 'ADMIN']}>
                      <LandingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute roles={['USER']}>
                      <SearchResults />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    role === 'ADMIN' ? (
                      <ProtectedRoute roles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    ) : (
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    )
                  }
                />
                <Route
                  path="/trips"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <TripsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/routes"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <RoutesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/buses"
                  element={
                    <ProtectedRoute roles={['ADMIN']}>
                      <BusesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountInfoPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route
                path="/signin"
                element={
                  <PublicRoute>
                    <SignInPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignUpPage />
                  </PublicRoute>
                }
              />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
