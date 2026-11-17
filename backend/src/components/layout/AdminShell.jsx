import { LogOut, ShieldCheck, UserCheck } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { UniversityBrand } from './UniversityBrand'

export function AdminShell() {
  const { logout, user } = useAuth()

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-panel flex flex-col justify-between overflow-hidden p-6">
          <div>
            <div className="rounded-[24px] bg-slate-900 p-5 text-white">
              <UniversityBrand className="mb-5" tone="dark" to="/admin/accounts" />
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-slate-950">
                <ShieldCheck size={22} />
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.28em] text-amber-300">
                Admin Hub
              </p>
              <h1 className="mt-3 text-3xl font-semibold">Account verification desk</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Review campus signups and keep platform access limited to verified users.
              </p>
            </div>

            <nav className="mt-6 space-y-2">
              <NavLink
                to="/admin/accounts"
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-teal-900 text-white shadow-ambient'
                      : 'text-slate-700 hover:bg-white hover:text-slate-900',
                  ].join(' ')
                }
              >
                <UserCheck size={18} />
                <span>Account Review</span>
              </NavLink>
            </nav>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">administrator</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {user?.full_name || user?.email}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              staff access
            </p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <main className="space-y-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
