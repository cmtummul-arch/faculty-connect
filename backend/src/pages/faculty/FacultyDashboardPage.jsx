import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchAppointments, fetchConsultationHours } from '../../api/appointmentsApi'
import { fetchNotifications } from '../../api/notificationsApi'
import { EmptyState } from '../../components/common/EmptyState'
import { SectionCard } from '../../components/common/SectionCard'
import { StatCard } from '../../components/common/StatCard'
import { StatusPill } from '../../components/common/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import { formatDateTime } from '../../utils/format'

export function FacultyDashboardPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [hours, setHours] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      const [appointmentData, hoursData, notificationData] = await Promise.all([
        fetchAppointments(),
        fetchConsultationHours({ faculty: user.id }),
        fetchNotifications(),
      ])
      setAppointments(appointmentData)
      setHours(hoursData)
      setNotifications(notificationData)
    }

    loadDashboard()
  }, [user.id])

  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending')
  const acceptedAppointments = appointments.filter((appointment) => appointment.status === 'accepted')
  const unreadNotifications = notifications.filter((notification) => !notification.is_read)

  return (
    <div className="space-y-4">
      <section className="glass-panel overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-teal-700">Faculty dashboard</p>
            <h1 className="mt-3 text-5xl font-semibold text-slate-900">
              Welcome back, {user?.first_name}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Review incoming requests, shape your consultation windows, and keep students aligned through fast notifications.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/appointments"
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Manage appointments
              </Link>
              <Link
                to="/notifications"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Open notifications
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Pending requests" value={pendingAppointments.length} accent="Needs response" />
            <StatCard label="Accepted meetings" value={acceptedAppointments.length} accent="Confirmed" />
            <StatCard label="Consultation blocks" value={hours.length} accent="Published" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Appointments needing action"
          subtitle="Pending requests should be accepted, rejected, or moved to an alternative slot."
        >
          <div className="space-y-3">
            {pendingAppointments.slice(0, 4).map((appointment) => (
              <div key={appointment.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">{appointment.purpose}</h2>
                  <StatusPill status={appointment.status} />
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Student: {appointment.student.full_name}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Requested for: {formatDateTime(appointment.requested_start)}
                </p>
                {appointment.note && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">{appointment.note}</p>
                )}
              </div>
            ))}
            {pendingAppointments.length === 0 && (
              <EmptyState
                title="No pending requests"
                copy="New student appointment requests will appear here when they need your input."
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Notification pulse"
          subtitle="Unread updates from the system and your students."
          action={<Link to="/notifications" className="text-sm font-semibold text-slate-900">View all</Link>}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Unread" value={unreadNotifications.length} accent="Fresh" />
            <StatCard label="This week" value={notifications.length} accent="Tracked" />
            <StatCard label="Office hours" value={hours.length} accent="Live" />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
