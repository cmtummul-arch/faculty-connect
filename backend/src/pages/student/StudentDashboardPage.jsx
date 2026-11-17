import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchFacultyDirectory } from '../../api/authApi'
import { fetchAppointments } from '../../api/appointmentsApi'
import { fetchNotifications } from '../../api/notificationsApi'
import { fetchResources } from '../../api/resourcesApi'
import { EmptyState } from '../../components/common/EmptyState'
import { SectionCard } from '../../components/common/SectionCard'
import { StatCard } from '../../components/common/StatCard'
import { StatusPill } from '../../components/common/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import { formatDateTime } from '../../utils/format'

export function StudentDashboardPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [resources, setResources] = useState([])
  const [faculty, setFaculty] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      const [appointmentData, notificationData, resourceData, facultyData] = await Promise.all([
        fetchAppointments(),
        fetchNotifications(),
        fetchResources(),
        fetchFacultyDirectory(),
      ])
      setAppointments(appointmentData)
      setNotifications(notificationData)
      setResources(resourceData)
      setFaculty(facultyData)
    }

    loadDashboard()
  }, [])

  const activeAppointments = appointments.filter((appointment) =>
    ['pending', 'accepted', 'alternative_suggested'].includes(appointment.status),
  )
  const nextAppointment = [...activeAppointments].sort(
    (left, right) => new Date(left.requested_start) - new Date(right.requested_start),
  )[0]
  const unreadNotifications = notifications.filter((item) => !item.is_read)

  return (
    <div className="space-y-4">
      <section className="glass-panel overflow-hidden p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-700">Student dashboard</p>
            <h1 className="mt-3 text-5xl font-semibold text-slate-900">
              Welcome back, {user?.first_name}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Keep track of faculty meetings, discover new study material, and move quickly between requests, downloads, and updates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/appointments"
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Request appointment
              </Link>
              <Link
                to="/swap-hub"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Browse resources
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Active requests" value={activeAppointments.length} accent="In motion" />
            <StatCard label="Faculty available" value={faculty.length} accent="Verified" />
            <StatCard label="Unread alerts" value={unreadNotifications.length} accent="Stay updated" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Next appointment"
          subtitle="Your nearest confirmed or pending meeting request."
        >
          {nextAppointment ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">{nextAppointment.purpose}</h2>
                <StatusPill status={nextAppointment.status} />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Faculty: {nextAppointment.faculty.full_name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Time: {formatDateTime(nextAppointment.requested_start)}
              </p>
              {nextAppointment.faculty_response && (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {nextAppointment.faculty_response}
                </p>
              )}
            </div>
          ) : (
            <EmptyState
              title="No active appointment"
              copy="Use the appointments section to request a consultation with any approved faculty member."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Latest notifications"
          subtitle="Approvals, changes, and appointment updates surface here first."
          action={
            <Link to="/notifications" className="text-sm font-semibold text-slate-900">
              View all
            </Link>
          }
        >
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-semibold text-slate-900">{notification.title}</h3>
                  {!notification.is_read && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <EmptyState title="Nothing new yet" copy="Notifications will appear as soon as faculty respond." />
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Popular resources"
        subtitle="Recent uploads from the swap hub to support your academic workflow."
        action={<Link to="/swap-hub" className="text-sm font-semibold text-slate-900">Open hub</Link>}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {resources.slice(0, 3).map((resource) => (
            <div key={resource.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {resource.resource_type}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{resource.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{resource.description}</p>
              <p className="mt-3 text-sm font-medium text-slate-700">{resource.subject}</p>
            </div>
          ))}
          {resources.length === 0 && (
            <EmptyState
              title="No shared resources yet"
              copy="Once someone uploads notes or books, they will show up here."
            />
          )}
        </div>
      </SectionCard>
    </div>
  )
}
