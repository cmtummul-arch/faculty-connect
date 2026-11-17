import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { PublicNavbar } from '../../components/layout/PublicNavbar'
import { useAuth } from '../../hooks/useAuth'
import { extractErrorMessage } from '../../utils/format'

export function LoginPage() {
  const { isAuthenticated, login, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return (
      <Navigate
        to={
          user?.is_staff
            ? '/admin/accounts'
            : user?.role === 'faculty'
              ? '/dashboard/faculty'
              : '/dashboard/student'
        }
        replace
      />
    )
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
      const redirectTarget =
        location.state?.from?.pathname ||
        (profile.is_staff
          ? '/admin/accounts'
          : profile.role === 'faculty'
            ? '/dashboard/faculty'
            : '/dashboard/student')
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
            <p className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              Verified campus access
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-slate-900">
              Return to your faculty and student workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Demo accounts after seeding:
              <br />
              Faculty: <span className="font-semibold">faculty@campus.edu</span>
              <br />
              Student: <span className="font-semibold">student@campus.edu</span>
              <br />
              Password: <span className="font-semibold">DemoPass123!</span>
            </p>
          </section>

          <section className="glass-panel p-8">
            <h2 className="text-3xl font-semibold text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Only approved accounts can enter the platform.
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <input
                className="field-input"
                type="email"
                name="email"
                placeholder="Email address"
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
                {submitting ? 'Signing in...' : 'Enter workspace'}
              </button>
            </form>
            <p className="mt-5 text-sm text-slate-600">
              Need an account?{' '}
              <Link to="/register" className="font-semibold text-slate-900">
                Register here
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
