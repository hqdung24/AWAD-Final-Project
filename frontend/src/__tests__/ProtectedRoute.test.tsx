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
