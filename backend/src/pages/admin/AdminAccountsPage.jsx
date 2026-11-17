import { useEffect, useState } from 'react'
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react'

import {
  approveAccount,
  fetchPendingAccounts,
  rejectAccount,
} from '../../api/adminApi'
import { EmptyState } from '../../components/common/EmptyState'
import { SectionCard } from '../../components/common/SectionCard'
import { StatCard } from '../../components/common/StatCard'
import { StatusPill } from '../../components/common/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import { extractErrorMessage, formatDateTime } from '../../utils/format'

export function AdminAccountsPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [actionId, setActionId] = useState(null)

  async function loadAccounts() {
    setLoading(true)
    setError('')

    try {
      const data = await fetchPendingAccounts()
      setAccounts(data)
    } catch (loadError) {
      setError(extractErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  async function handleReview(id, action) {
    setActionId(id)
    setError('')
    setMessage('')

    try {
      const reviewedAccount =
        action === 'approve' ? await approveAccount(id) : await rejectAccount(id)
      setAccounts((current) => current.filter((account) => account.id !== id))
      setMessage(`${reviewedAccount.full_name || reviewedAccount.email} marked as ${reviewedAccount.approval_status}.`)
    } catch (reviewError) {
      setError(extractErrorMessage(reviewError))
    } finally {
      setActionId(null)
    }
  }

  const studentCount = accounts.filter((account) => account.role === 'student').length
  const facultyCount = accounts.filter((account) => account.role === 'faculty').length

  return (
    <div className="space-y-4">
      <section className="glass-panel overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-teal-700">Admin dashboard</p>
            <h1 className="mt-3 text-5xl font-semibold text-slate-900">
              Welcome back, {user?.first_name || 'Admin'}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Approve verified campus accounts, reject mismatched registrations, and keep access tidy.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadAccounts}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <RefreshCw size={16} />
                Refresh list
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Pending" value={accounts.length} accent="Needs review" />
            <StatCard label="Students" value={studentCount} accent="Waiting" />
            <StatCard label="Faculty" value={facultyCount} accent="Waiting" />
          </div>
        </div>
      </section>

      <SectionCard
        title="Pending account requests"
        subtitle="Review each registration before allowing access to the platform."
      >
        {error && (
          <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </p>
        )}

        {loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-600">Loading pending accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            title="No pending accounts"
            copy="New registration requests will appear here when they need approval."
          />
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <article
                key={account.id}
                className="rounded-[24px] border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="break-words text-xl font-semibold text-slate-900">
                        {account.full_name || account.email}
                      </h2>
                      <StatusPill status={account.approval_status} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {account.role}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                      <p className="break-words">
                        <span className="font-semibold text-slate-900">Email:</span> {account.email}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Department:</span>{' '}
                        {account.department || 'Not set'}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Campus ID:</span>{' '}
                        {account.institution_id}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900">Joined:</span>{' '}
                        {formatDateTime(account.date_joined)}
                      </p>
                    </div>

                    {(account.bio || account.office_location) && (
                      <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-2">
                        {account.bio && <p>{account.bio}</p>}
                        {account.office_location && (
                          <p>
                            <span className="font-semibold text-slate-900">Office:</span>{' '}
                            {account.office_location}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                    <button
                      type="button"
                      disabled={actionId === account.id}
                      onClick={() => handleReview(account.id, 'approve')}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 size={16} />
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionId === account.id}
                      onClick={() => handleReview(account.id, 'reject')}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
