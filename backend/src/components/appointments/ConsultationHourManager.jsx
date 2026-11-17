import { useState } from 'react'

import { EmptyState } from '../common/EmptyState'
import { SectionCard } from '../common/SectionCard'

const initialForm = {
  weekday: 0,
  start_time: '10:00',
  end_time: '12:00',
  slot_duration_minutes: 30,
  meeting_mode: 'hybrid',
  location: '',
  note: '',
}

const weekdayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function ConsultationHourManager({ hours, onCreate, loading }) {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await onCreate({
        ...form,
        weekday: Number(form.weekday),
        slot_duration_minutes: Number(form.slot_duration_minutes),
      })
      setForm(initialForm)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionCard
      title="Consultation Hours"
      subtitle="Define the slots students can book against your official consultation windows."
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Weekday
          <select
            className="field-input"
            name="weekday"
            value={form.weekday}
            onChange={handleChange}
          >
            {weekdayLabels.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Meeting mode
          <select
            className="field-input"
            name="meeting_mode"
            value={form.meeting_mode}
            onChange={handleChange}
          >
            <option value="in_person">In person</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Start time
          <input
            className="field-input"
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          End time
          <input
            className="field-input"
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Slot duration (minutes)
          <input
            className="field-input"
            type="number"
            min="15"
            step="15"
            name="slot_duration_minutes"
            value={form.slot_duration_minutes}
            onChange={handleChange}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Location
          <input
            className="field-input"
            type="text"
            name="location"
            placeholder="Office room or meeting link"
            value={form.location}
            onChange={handleChange}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          Notes
          <textarea
            className="field-input min-h-[120px]"
            name="note"
            placeholder="Share prep instructions for students."
            value={form.note}
            onChange={handleChange}
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-teal-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save consultation block'}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading consultation hours...</p>}
        {!loading && hours.length === 0 && (
          <EmptyState
            title="No consultation hours yet"
            copy="Add at least one weekly slot so students can request appointments."
          />
        )}
        {hours.map((hour) => (
          <div
            key={hour.id}
            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {weekdayLabels[hour.weekday]}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {hour.start_time.slice(0, 5)} to {hour.end_time.slice(0, 5)} |{' '}
                  {hour.slot_duration_minutes} min slots
                </p>
              </div>
              <div className="text-sm text-slate-600">
                {hour.meeting_mode.replace('_', ' ')} | {hour.location || 'Location TBD'}
              </div>
            </div>
            {hour.note && <p className="mt-3 text-sm leading-6 text-slate-600">{hour.note}</p>}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
