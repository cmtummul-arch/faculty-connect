import { useState } from 'react'
import { Link } from 'react-router-dom'

import { PublicNavbar } from '../../components/layout/PublicNavbar'
import { useAuth } from '../../hooks/useAuth'
import { extractErrorMessage } from '../../utils/format'

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'student',
  department: '',
  institution_id: '',
  bio: '',
  office_location: '',
}

export function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await register(form)
      setSuccess('Registration submitted. An admin or faculty verifier can approve your account now.')
      setForm(initialForm)
    } catch (registerError) {
      setError(extractErrorMessage(registerError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <PublicNavbar />
        <div className="grid gap-4 lg:grid-cols-[1fr_500px]">
          <section className="glass-panel p-8 md:p-10">
            <p className="inline-flex rounded-full bg-teal-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              Join the hub
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight text-slate-900">
              Create a verified student or faculty account.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Use any active email address and add your campus or employee ID for account review.
            </p>
          </section>

          <section className="glass-panel p-8">
            <h2 className="text-3xl font-semibold text-slate-900">Register</h2>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="field-input"
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
                <input
                  className="field-input"
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
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
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  className="field-input"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
                <input
                  className="field-input"
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={form.department}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                className="field-input"
                type="text"
                name="institution_id"
                placeholder="Campus ID / Employee ID"
                value={form.institution_id}
                onChange={handleChange}
                required
              />
              <textarea
                className="field-input min-h-[120px]"
                name="bio"
                placeholder="Short profile note"
                value={form.bio}
                onChange={handleChange}
              />
              {form.role === 'faculty' && (
                <input
                  className="field-input"
                  type="text"
                  name="office_location"
                  placeholder="Office location"
                  value={form.office_location}
                  onChange={handleChange}
                />
              )}
              {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
              {success && <p className="text-sm font-medium text-emerald-600">{success}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Create account'}
              </button>
            </form>
            <p className="mt-5 text-sm text-slate-600">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-slate-900">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
