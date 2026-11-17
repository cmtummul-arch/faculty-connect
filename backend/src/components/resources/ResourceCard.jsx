import { useState } from 'react'

import { resolveMediaUrl } from '../../utils/format'
import { StatusPill } from '../common/StatusPill'

export function ResourceCard({ resource, onDownload, onRate }) {
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleRate() {
    setSubmitting(true)
    try {
      await onRate(resource.id, {
        rating,
        feedback,
      })
      setFeedback('')
      setRating(5)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article className="glass-panel p-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={resource.resource_type} />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {resource.subject}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-slate-900">{resource.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{resource.description}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
        <span>Category: {resource.category?.name || 'General'}</span>
        <span>By: {resource.uploaded_by?.full_name}</span>
        <span>Downloads: {resource.download_count}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
        <span>Average rating: {resource.average_rating || 0} / 5</span>
        <span>{resource.rating_count} feedback entries</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          href={resolveMediaUrl(resource.file)}
          target="_blank"
          rel="noreferrer"
          onClick={() => onDownload(resource.id)}
        >
          Open file
        </a>
      </div>
      <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/90 p-4">
        <p className="text-sm font-semibold text-slate-800">Leave feedback</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
          <select
            className="field-input"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          >
            {[5, 4, 3, 2, 1].map((score) => (
              <option key={score} value={score}>
                {score} stars
              </option>
            ))}
          </select>
          <textarea
            className="field-input min-h-[100px]"
            placeholder="What was helpful about this resource?"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleRate}
          disabled={submitting}
          className="mt-3 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Submit feedback'}
        </button>
      </div>
    </article>
  )
}
