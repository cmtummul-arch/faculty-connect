import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminShell } from '../components/layout/AdminShell'
import { AppShell } from '../components/layout/AppShell'
import { useAuth } from '../hooks/useAuth'
import { AdminAccountsPage } from '../pages/admin/AdminAccountsPage'
import { AdminLoginPage } from '../pages/admin/AdminLoginPage'
import { AppointmentPage } from '../pages/appointments/AppointmentPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { FacultyDashboardPage } from '../pages/faculty/FacultyDashboardPage'
import { NotificationsPage } from '../pages/notifications/NotificationsPage'
import { SwapHubPage } from '../pages/resources/SwapHubPage'
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage'
import { AdminProtectedRoute } from './AdminProtectedRoute'
import { ProtectedRoute } from './ProtectedRoute'

function DashboardRedirect() {
  const { user } = useAuth()

  if (user?.is_staff) {
    return <Navigate to="/admin/accounts" replace />
  }

  if (user?.role === 'faculty') {
    return <Navigate to="/dashboard/faculty" replace />
  }

  return <Navigate to="/dashboard/student" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminShell />}>
          <Route path="/admin" element={<Navigate to="/admin/accounts" replace />} />
          <Route path="/admin/accounts" element={<AdminAccountsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dashboard/student" element={<StudentDashboardPage />} />
          <Route path="/dashboard/faculty" element={<FacultyDashboardPage />} />
          <Route path="/appointments" element={<AppointmentPage />} />
          <Route path="/swap-hub" element={<SwapHubPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
