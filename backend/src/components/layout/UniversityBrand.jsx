import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

import { UNIVERSITY_NAME } from '../../constants/branding'

const toneStyles = {
  light: {
    icon: 'bg-slate-900 text-amber-300',
    eyebrow: 'text-amber-700',
    title: 'text-slate-900',
  },
  dark: {
    icon: 'bg-amber-300 text-slate-950',
    eyebrow: 'text-amber-300',
    title: 'text-white',
  },
}

export function UniversityBrand({ className = '', tone = 'light', to }) {
  const styles = toneStyles[tone] || toneStyles.light
  const classes = ['flex min-w-0 items-center gap-3', className].filter(Boolean).join(' ')

  const content = (
    <>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>
        <GraduationCap size={23} />
      </span>
      <span className="min-w-0">
        <span className={`block text-xs font-semibold uppercase tracking-[0.22em] ${styles.eyebrow}`}>
          University
        </span>
        <span className={`block text-lg font-semibold leading-6 ${styles.title}`}>
          {UNIVERSITY_NAME}
        </span>
      </span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }

  return <div className={classes}>{content}</div>
}
