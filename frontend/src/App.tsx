import { queryClient } from '@/lib/queryClient';
import SessionSync from '@/routes/SessionSync';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AccountInfoPage from './pages/Account/AccountInfoPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerificationPage from './pages/auth/VerificationPage';
import PasswordResetEmailPage from './pages/auth/PasswordResetEmailPage';
import LandingPage from './pages/home/LandingPage';
import SearchResults from './pages/search/SearchResults';
import TripDetails from './pages/search/TripDetails';
import SeatSelection from './pages/search/SeatSelection';
import Checkout from './pages/search/ConfirmBooking';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import MainLayout from './layouts/main-layout/MainLayout';
import { useAuthStore } from './stores/auth';
import AdminDashboard from './pages/home/AdminDashboard';
import UserDashboard from './pages/home/UserTrips';
import UpcomingTripDetail from './pages/home/UpcomingTripDetail';
import TripsPage from './pages/admin/TripsPage';
import RoutesPage from './pages/admin/RoutesPage';
import BusesPage from './pages/admin/BusesPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import ReportsPage from './pages/admin/ReportsPage';
import OperatorsPage from './pages/admin/OperatorsPage';
import GuestBookingLookup from './pages/guest/GuestBookingLookup';
import PaymentConfirmation from './pages/payment/PaymentConfirmation';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
function App() {
  const role = useAuthStore((s) => s.role);

  return (
    <ErrorBoundary>
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
                      <ProtectedRoute allowGuest>
                        <LandingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <ProtectedRoute allowGuest>
                        <SearchResults />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search/:id"
                    element={
                      <ProtectedRoute allowGuest>
                        <TripDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search/:id/seats"
                    element={
                      <ProtectedRoute allowGuest>
                        <SeatSelection />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search/:id/checkout"
                    element={
                      <ProtectedRoute allowGuest>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/upcoming-trip"
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
                    path="/upcoming-trip/:id"
                    element={
                      <ProtectedRoute>
                        <UpcomingTripDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment/:bookingId"
                    element={
                      <ProtectedRoute allowGuest>
                        <PaymentConfirmation />
                      </ProtectedRoute>
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
                    path="/operators"
                    element={
                      <ProtectedRoute roles={['ADMIN']}>
                        <OperatorsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute roles={['ADMIN']}>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute roles={['ADMIN']}>
                        <ReportsPage />
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
                  <Route
                    path="/guest-booking"
                    element={
                      <ProtectedRoute allowGuest>
                        <GuestBookingLookup />
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
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPasswordPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/auth/verification-email"
                  element={
                    <PublicRoute>
                      <VerificationPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/auth/password-reset-email"
                  element={
                    <PublicRoute>
                      <PasswordResetEmailPage />
                    </PublicRoute>
                  }
                />
              </Routes>
            </QueryClientProvider>
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
