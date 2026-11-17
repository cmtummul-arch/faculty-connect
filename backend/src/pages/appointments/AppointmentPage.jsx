import { useEffect, useState } from 'react'

import {
  acceptAppointment,
  acceptSuggestion,
  cancelAppointment,
  createAppointment,
  createConsultationHour,
  fetchAppointments,
  fetchConsultationHours,
  rejectAppointment,
  suggestAlternative,
} from '../../api/appointmentsApi'
import { AppointmentList } from '../../components/appointments/AppointmentList'
import { ConsultationHourManager } from '../../components/appointments/ConsultationHourManager'
import { StudentBookingPanel } from '../../components/appointments/StudentBookingPanel'
import { SectionCard } from '../../components/common/SectionCard'
import { useAuth } from '../../hooks/useAuth'
import { extractErrorMessage } from '../../utils/format'

export function AppointmentPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [hours, setHours] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loadingHours, setLoadingHours] = useState(false)

  async function loadData() {
    const appointmentData = await fetchAppointments()
    setAppointments(appointmentData)

    if (user.role === 'faculty') {
      setLoadingHours(true)
      try {
        const hoursData = await fetchConsultationHours({ faculty: user.id })
        setHours(hoursData)
      } finally {
        setLoadingHours(false)
      }
    }
  }

  useEffect(() => {
    let ignore = false

    const loadInitialData = async () => {
      const appointmentData = await fetchAppointments()
      if (ignore) {
        return
      }
      setAppointments(appointmentData)

      if (user.role === 'faculty') {
        setLoadingHours(true)
        try {
          const hoursData = await fetchConsultationHours({ faculty: user.id })
          if (!ignore) {
            setHours(hoursData)
          }
        } finally {
          if (!ignore) {
            setLoadingHours(false)
          }
        }
      }
    }

    loadInitialData()

    return () => {
      ignore = true
    }
  }, [user.id, user.role])

  async function handleBookAppointment(payload) {
    setError('')
    setMessage('')
    try {
      await createAppointment(payload)
      setMessage('Appointment request sent successfully.')
      await loadData()
    } catch (requestError) {
      setError(extractErrorMessage(requestError))
      throw requestError
    }
  }

  async function handleCreateConsultationHour(payload) {
    setError('')
    setMessage('')
    try {
      await createConsultationHour(payload)
      setMessage('Consultation block added successfully.')
      await loadData()
    } catch (requestError) {
      setError(extractErrorMessage(requestError))
      throw requestError
    }
  }

  async function runAction(action) {
    setError('')
    setMessage('')
    try {
      await action()
      setMessage('Appointment updated successfully.')
      await loadData()
    } catch (requestError) {
      setError(extractErrorMessage(requestError))
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Appointment Centre"
        subtitle={
          user.role === 'faculty'
            ? 'Publish consultation windows and respond to students from one place.'
            : 'Request appointments inside real faculty consultation hours and track responses.'
        }
      >
        {(message || error) && (
          <div
            className={[
              'rounded-2xl px-4 py-3 text-sm font-medium',
              error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700',
            ].join(' ')}
          >
            {error || message}
          </div>
        )}
      </SectionCard>

      {user.role === 'faculty' ? (
        <>
          <ConsultationHourManager
            hours={hours}
            onCreate={handleCreateConsultationHour}
            loading={loadingHours}
          />
          <SectionCard
            title="Incoming appointment requests"
            subtitle="Approve, decline, or suggest another time based on your schedule."
          >
            <AppointmentList
              appointments={appointments}
              role="faculty"
              onAccept={(id, payload) => runAction(() => acceptAppointment(id, payload))}
              onReject={(id, payload) => runAction(() => rejectAppointment(id, payload))}
              onSuggestAlternative={(id, payload) =>
                runAction(() => suggestAlternative(id, payload))
              }
              onCancel={(id) => runAction(() => cancelAppointment(id))}
            />
          </SectionCard>
        </>
      ) : (
        <>
          <StudentBookingPanel onBook={handleBookAppointment} />
          <SectionCard
            title="Your appointment requests"
            subtitle="Watch for approvals, alternative suggestions, and status changes from faculty."
          >
            <AppointmentList
              appointments={appointments}
              role="student"
              onAcceptSuggestion={(id) => runAction(() => acceptSuggestion(id))}
              onCancel={(id) => runAction(() => cancelAppointment(id))}
            />
          </SectionCard>
        </>
      )}
    </div>
  )
}
