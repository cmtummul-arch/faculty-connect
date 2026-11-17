import { useState } from 'react'

import { EmptyState } from '../common/EmptyState'
import { StatusPill } from '../common/StatusPill'
import { formatDateTime } from '../../utils/format'

function toDateTimeLocalValue(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function AppointmentList({
  appointments,
  role,
  onAccept,
  onReject,
  onSuggestAlternative,
  onAcceptSuggestion,
  onCancel,
}) {
  const [responses, setResponses] = useState({})

  function updateResponse(id, key, value) {
    setResponses((current) => ({
      ...current,
      [id]: {
        faculty_response: '',
        suggested_start: '',
        suggested_end: '',
        ...current[id],
        [key]: value,
      },
    }))
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        title="No appointments yet"
        copy="Once requests start moving through the system, they will appear here with their current status."
      />
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const responseState = responses[appointment.id] || {
          faculty_response: '',
          suggested_start: '',
          suggested_end: '',
        }
        const otherPerson =
          role === 'faculty' ? appointment.student.full_name : appointment.faculty.full_name
        const canCancel = ['pending', 'accepted', 'alternative_suggested'].includes(appointment.status)

        return (
          <article
            key={appointment.id}
            className="rounded-[24px] border border-slate-200 bg-white/90 p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-900">{appointment.purpose}</h3>
                  <StatusPill status={appointment.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {role === 'faculty' ? 'Requested by' : 'Faculty'}: {otherPerson}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Requested time: {formatDateTime(appointment.requested_start)}
                </p>
                {appointment.note && (
                  <p className="mt-3 text-sm leading-6 text-slate-600">{appointment.note}</p>
                )}
                {appointment.faculty_response && (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Faculty note:</span>{' '}
                    {appointment.faculty_response}
                  </div>
                )}
                {appointment.suggested_start && (
                  <div className="mt-3 rounded-2xl bg-cyan-50 p-3 text-sm text-cyan-900">
                    Suggested slot: {formatDateTime(appointment.suggested_start)}
                  </div>
                )}
              </div>

              <div className="w-full max-w-xl space-y-3">
                {role === 'faculty' && appointment.status === 'pending' && (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                    <textarea
                      className="field-input min-h-[110px]"
                      placeholder="Leave a response or preparation note for the student."
                      value={responseState.faculty_response}
                      onChange={(event) =>
                        updateResponse(appointment.id, 'faculty_response', event.target.value)
                      }
                    />
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input
                        className="field-input"
                        type="datetime-local"
                        value={responseState.suggested_start}
                        onChange={(event) =>
                          updateResponse(appointment.id, 'suggested_start', event.target.value)
                        }
                      />
                      <input
                        className="field-input"
                        type="datetime-local"
                        value={responseState.suggested_end}
                        onChange={(event) =>
                          updateResponse(appointment.id, 'suggested_end', event.target.value)
                        }
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          onAccept?.(appointment.id, {
                            faculty_response: responseState.faculty_response,
                          })
                        }
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onSuggestAlternative?.(appointment.id, {
                            faculty_response: responseState.faculty_response,
                            suggested_start: new Date(responseState.suggested_start).toISOString(),
                            suggested_end: new Date(responseState.suggested_end).toISOString(),
                          })
                        }
                        disabled={!responseState.suggested_start || !responseState.suggested_end}
                        className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Suggest alternative
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onReject?.(appointment.id, {
                            faculty_response: responseState.faculty_response,
                          })
                        }
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {role === 'student' && appointment.status === 'alternative_suggested' && (
                  <button
                    type="button"
                    onClick={() => onAcceptSuggestion?.(appointment.id)}
                    className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Accept suggested slot
                  </button>
                )}

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => onCancel?.(appointment.id)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                  >
                    Cancel appointment
                  </button>
                )}

                {appointment.status === 'alternative_suggested' && role === 'faculty' && (
                  <div className="rounded-2xl bg-cyan-50 p-3 text-sm text-cyan-900">
                    Waiting for the student to accept the proposed replacement slot.
                  </div>
                )}

                {appointment.suggested_start && role === 'faculty' && (
                  <div className="hidden">
                    {toDateTimeLocalValue(appointment.suggested_start)}
                  </div>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
