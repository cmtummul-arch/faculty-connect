import { API_BASE_URL } from '../api/client'

export function formatDateTime(value) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatDay(weekday) {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][weekday] || 'Day'
}

export function statusTone(status) {
  const tones = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-emerald-100 text-emerald-800',
    accepted: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
    cancelled: 'bg-slate-200 text-slate-700',
    alternative_suggested: 'bg-cyan-100 text-cyan-800',
    completed: 'bg-indigo-100 text-indigo-800',
  }

  return tones[status] || 'bg-slate-100 text-slate-800'
}

export function resolveMediaUrl(fileUrl) {
  if (!fileUrl) {
    return '#'
  }

  if (fileUrl.startsWith('http')) {
    return fileUrl
  }

  return `${API_BASE_URL.replace('/api', '')}${fileUrl}`
}

export function extractErrorMessage(error) {
  const payload = error?.response?.data
  const fieldLabels = {
    email: 'Email',
    institution_id: 'Campus ID / Employee ID',
    password: 'Password',
    first_name: 'First name',
    last_name: 'Last name',
    role: 'Role',
    department: 'Department',
    bio: 'Profile note',
    office_location: 'Office location',
  }

  if (typeof payload === 'string') {
    return payload
  }

  if (payload?.detail) {
    return payload.detail
  }

  if (payload && typeof payload === 'object') {
    return Object.entries(payload)
      .flatMap(([field, messages]) => {
        const label = fieldLabels[field] || field
        const text = Array.isArray(messages) ? messages.join(' ') : messages
        return `${label}: ${text}`
      })
      .join(' ')
  }

  return 'Something went wrong. Please try again.'
}
