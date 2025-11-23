import { queryClient } from '@/lib/queryClient';
import SessionSync from '@/routes/SessionSync';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import AccountInfoPage from './pages/account/AccountInfoPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import HomePage from './pages/home/HomePage';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import MainLayout from './layouts/main-layout/MainLayout';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
function App() {
  return (
    <>
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
                    <ProtectedRoute>
                      <HomePage />
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
    </>
  );
}

export default App;
