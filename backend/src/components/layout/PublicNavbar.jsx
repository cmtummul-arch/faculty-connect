import { Link, useLocation } from 'react-router-dom'

import { UniversityBrand } from './UniversityBrand'

const links = [
  { to: '/login', label: 'Sign in' },
  { to: '/register', label: 'Register' },
  { to: '/admin/login', label: 'Admin' },
]

export function PublicNavbar() {
  const { pathname } = useLocation()

  return (
    <header className="glass-panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <UniversityBrand to="/" />
      <nav className="flex flex-wrap gap-2" aria-label="Public navigation">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              pathname === to
                ? 'bg-slate-900 text-white'
                : 'bg-white/70 text-slate-700 hover:bg-white hover:text-slate-900',
            ].join(' ')}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
