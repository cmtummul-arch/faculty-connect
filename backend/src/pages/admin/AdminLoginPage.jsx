import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

import { PublicNavbar } from '../../components/layout/PublicNavbar'
import { useAuth } from '../../hooks/useAuth'
import { extractErrorMessage } from '../../utils/format'

export function AdminLoginPage() {
  const { isAuthenticated, login, logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated && user?.is_staff) {
    return <Navigate to="/admin/accounts" replace />
  }

  if (isAuthenticated && !user?.is_staff) {
    return <Navigate to="/dashboard" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const profile = await login(form)
      if (!profile.is_staff) {
        logout()
        setError('This login is only for staff administrators.')
        return
      }

      const redirectTarget = location.state?.from?.pathname || '/admin/accounts'
      navigate(redirectTarget, { replace: true })
    } catch (loginError) {
      setError(extractErrorMessage(loginError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <PublicNavbar />
        <div className="grid gap-4 lg:grid-cols-[1fr_460px]">
          <section className="glass-panel p-8 md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-amber-300">
              <ShieldCheck size={28} />
            </div>
            <p className="mt-6 inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Admin verification
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-slate-900">
              Review new campus accounts with a focused approval desk.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Staff users can approve student and faculty registrations before they enter the workspace.
            </p>
          </section>

          <section className="glass-panel p-8">
            <h2 className="text-3xl font-semibold text-slate-900">Admin sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use a staff account to manage pending registrations.
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input
                className="field-input"
                type="email"
                name="email"
                placeholder="Admin email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                className="field-input"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Open admin desk'}
              </button>
            </form>
            <p className="mt-5 text-sm text-slate-600">
              Student or faculty?{' '}
              <Link to="/login" className="font-semibold text-slate-900">
                Use workspace login
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
