import { useEffect, useMemo, useState } from 'react'

import {
  fetchFacultyDirectory,
} from '../../api/authApi'
import { fetchFacultySlots } from '../../api/appointmentsApi'
import { EmptyState } from '../common/EmptyState'
import { SectionCard } from '../common/SectionCard'
import { formatDateTime } from '../../utils/format'

export function StudentBookingPanel({ onBook }) {
  const [facultyList, setFacultyList] = useState([])
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlotStart, setSelectedSlotStart] = useState('')
  const [form, setForm] = useState({ purpose: '', note: '' })
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadFaculty = async () => {
      const faculty = await fetchFacultyDirectory()
      setFacultyList(faculty)
      if (faculty[0]) {
        setSelectedFacultyId(String(faculty[0].id))
      }
    }

    loadFaculty()
  }, [])

  useEffect(() => {
    if (!selectedFacultyId) {
      return
    }

    const loadSlots = async () => {
      setLoadingSlots(true)
      try {
        const data = await fetchFacultySlots(selectedFacultyId, { days: 10 })
        setSlots(data.filter((slot) => slot.available))
      } finally {
        setLoadingSlots(false)
      }
    }

    loadSlots()
  }, [selectedFacultyId])

  const selectedFaculty = useMemo(
    () => facultyList.find((faculty) => String(faculty.id) === selectedFacultyId),
    [facultyList, selectedFacultyId],
  )

  function handleTextChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const selectedSlot = slots.find((slot) => slot.start === selectedSlotStart)
    if (!selectedSlot) {
      return
    }

    setSubmitting(true)
    try {
      await onBook({
        faculty_id: Number(selectedFacultyId),
        requested_start: selectedSlot.start,
        requested_end: selectedSlot.end,
        purpose: form.purpose,
        note: form.note,
      })
      setForm({ purpose: '', note: '' })
      setSelectedSlotStart('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionCard
        title="Book Faculty Time"
        subtitle="Choose a faculty member, explore the next available slots, and send a focused appointment request."
      >
        <div className="space-y-4">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Faculty member
            <select
              className="field-input"
              value={selectedFacultyId}
              onChange={(event) => {
                setSelectedFacultyId(event.target.value)
                setSelectedSlotStart('')
              }}
            >
              {facultyList.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.full_name} | {faculty.department}
                </option>
              ))}
            </select>
          </label>

          {selectedFaculty && (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
              <h3 className="text-lg font-semibold text-slate-900">{selectedFaculty.full_name}</h3>
              <p className="mt-1 text-sm text-slate-600">{selectedFaculty.department}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{selectedFaculty.bio}</p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {selectedFaculty.office_location || 'Office location will be shared after confirmation.'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Available slots</h3>
              {loadingSlots && <span className="text-sm text-slate-500">Checking schedule...</span>}
            </div>

            {!loadingSlots && slots.length === 0 && (
              <EmptyState
                title="No upcoming slots found"
                copy="Try a different faculty member or wait until more consultation blocks are published."
              />
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {slots.slice(0, 8).map((slot) => {
                const isSelected = slot.start === selectedSlotStart
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setSelectedSlotStart(slot.start)}
                    className={[
                      'rounded-[22px] border p-4 text-left transition',
                      isSelected
                        ? 'border-amber-400 bg-amber-50 shadow-ambient'
                        : 'border-slate-200 bg-white hover:border-teal-300',
                    ].join(' ')}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDateTime(slot.start)}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {slot.meeting_mode.replace('_', ' ')}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{slot.location || 'Location shared later'}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Appointment Request"
        subtitle="Give faculty enough context so they can accept quickly or suggest the best alternative."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/90 p-4">
            <p className="text-sm text-slate-500">Selected slot</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {selectedSlotStart ? formatDateTime(selectedSlotStart) : 'Pick an available slot first'}
            </p>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Purpose
            <input
              className="field-input"
              type="text"
              name="purpose"
              placeholder="Project discussion, course guidance, thesis check-in"
              value={form.purpose}
              onChange={handleTextChange}
              required
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Note for faculty
            <textarea
              className="field-input min-h-[160px]"
              name="note"
              placeholder="Mention your topic, roll number, or the prep material you are bringing."
              value={form.note}
              onChange={handleTextChange}
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !selectedSlotStart}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Sending request...' : 'Send appointment request'}
          </button>
        </form>
      </SectionCard>
    </div>
  )
}
