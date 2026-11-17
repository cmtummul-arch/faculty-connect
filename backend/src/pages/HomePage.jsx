import { ArrowRight, BookOpenText, CalendarClock, ShieldCheck } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'

import { PublicNavbar } from '../components/layout/PublicNavbar'
import { useAuth } from '../hooks/useAuth'

export function HomePage() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === 'faculty' ? '/dashboard/faculty' : '/dashboard/student'}
        replace
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-5 md:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <PublicNavbar />
        <section className="glass-panel overflow-hidden px-6 py-8 md:px-10 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                Faculty Appointment and Swap Hub
              </p>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.04] text-slate-900 md:text-7xl">
                Campus office hours and academic resources, finally in one calm place.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Students can request faculty appointments inside published consultation hours, while the swap hub keeps notes, books, and study material organized for the whole academic community.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Create an account
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                {
                  icon: CalendarClock,
                  title: 'Structured appointments',
                  copy: 'Faculty publish weekly consultation windows and students request only the slots that make sense.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Verified access',
                  copy: 'Email based sign-up and approval-ready account verification keeps the portal private.',
                },
                {
                  icon: BookOpenText,
                  title: 'Academic swap hub',
                  copy: 'Upload, search, rate, and download course resources without losing track of quality.',
                },
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="rounded-[28px] border border-white/70 bg-slate-900 p-6 text-white shadow-ambient">
                  <Icon size={24} className="text-amber-300" />
                  <h2 className="mt-5 text-2xl font-semibold">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
