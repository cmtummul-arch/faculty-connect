import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export function AdminProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel max-w-md p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Loading admin workspace</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Checking your staff session and preparing account reviews.
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (!user?.is_staff) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
