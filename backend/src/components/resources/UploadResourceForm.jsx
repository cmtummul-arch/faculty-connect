import { useState } from 'react'

import { SectionCard } from '../common/SectionCard'

const initialForm = {
  title: '',
  description: '',
  category: '',
  subject: '',
  resource_type: 'notes',
  file: null,
}

export function UploadResourceForm({ categories, onUpload }) {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value, files } = event.target
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        payload.append(key, value)
      }
    })

    setSubmitting(true)
    try {
      await onUpload(payload)
      setForm(initialForm)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionCard
      title="Share a Resource"
      subtitle="Upload notes, books, papers, or slides so the community can study together."
      className="h-fit"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          className="field-input"
          type="text"
          name="title"
          placeholder="Resource title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          className="field-input min-h-[120px]"
          name="description"
          placeholder="What does this resource cover?"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          className="field-input"
          type="text"
          name="subject"
          placeholder="Subject or course"
          value={form.subject}
          onChange={handleChange}
          required
        />
        <select
          className="field-input"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          className="field-input"
          name="resource_type"
          value={form.resource_type}
          onChange={handleChange}
        >
          <option value="notes">Notes</option>
          <option value="book">Book</option>
          <option value="paper">Paper</option>
          <option value="slides">Slides</option>
          <option value="other">Other</option>
        </select>
        <input
          className="field-input"
          type="file"
          name="file"
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Uploading...' : 'Upload resource'}
        </button>
      </form>
    </SectionCard>
  )
}
