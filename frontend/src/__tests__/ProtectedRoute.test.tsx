import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { useAuthStore } from '@/stores/auth';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /signin', () => {
    useAuthStore.setState({ accessToken: undefined });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>private</div>
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<div>signin</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('signin')).toBeInTheDocument();
  });

  it('renders children when allowGuest is true even without auth', () => {
    useAuthStore.setState({ accessToken: undefined, role: undefined });

    render(
      <MemoryRouter initialEntries={['/public']}>
        <Routes>
          <Route
            path="/public"
            element={
              <ProtectedRoute allowGuest>
                <div>guest-ok</div>
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<div>signin</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('guest-ok')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({ accessToken: 'token' });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>private</div>
              </ProtectedRoute>
            }
          />
          <Route path="/signin" element={<div>signin</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('private')).toBeInTheDocument();
  });
});
