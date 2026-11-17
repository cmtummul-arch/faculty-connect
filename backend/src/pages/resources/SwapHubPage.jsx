import { startTransition, useDeferredValue, useEffect, useState } from 'react'

import {
  createResource,
  fetchCategories,
  fetchResources,
  incrementDownload,
  rateResource,
} from '../../api/resourcesApi'
import { EmptyState } from '../../components/common/EmptyState'
import { SectionCard } from '../../components/common/SectionCard'
import { ResourceCard } from '../../components/resources/ResourceCard'
import { UploadResourceForm } from '../../components/resources/UploadResourceForm'
import { extractErrorMessage } from '../../utils/format'

export function SwapHubPage() {
  const [categories, setCategories] = useState([])
  const [resources, setResources] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    resource_type: '',
  })
  const [feedback, setFeedback] = useState({ message: '', error: '' })

  const deferredSearch = useDeferredValue(filters.search)

  async function loadResources(activeFilters) {
    const params = {}
    if (activeFilters.search) {
      params.search = activeFilters.search
    }
    if (activeFilters.category) {
      params.category = activeFilters.category
    }
    if (activeFilters.resource_type) {
      params.resource_type = activeFilters.resource_type
    }
    const data = await fetchResources(params)
    setResources(data)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      const [categoryData, resourceData] = await Promise.all([
        fetchCategories(),
        fetchResources(),
      ])
      setCategories(categoryData)
      setResources(resourceData)
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    let ignore = false

    const syncResources = async () => {
      const params = {}
      if (deferredSearch) {
        params.search = deferredSearch
      }
      if (filters.category) {
        params.category = filters.category
      }
      if (filters.resource_type) {
        params.resource_type = filters.resource_type
      }

      const data = await fetchResources(params)
      if (!ignore) {
        setResources(data)
      }
    }

    syncResources()

    return () => {
      ignore = true
    }
  }, [deferredSearch, filters.category, filters.resource_type])

  function handleFilterChange(event) {
    const { name, value } = event.target
    startTransition(() => {
      setFilters((current) => ({ ...current, [name]: value }))
    })
  }

  async function handleUpload(formData) {
    setFeedback({ message: '', error: '' })
    try {
      await createResource(formData)
      setFeedback({ message: 'Resource uploaded successfully.', error: '' })
      await loadResources({
        ...filters,
        search: deferredSearch,
      })
    } catch (uploadError) {
      setFeedback({ message: '', error: extractErrorMessage(uploadError) })
      throw uploadError
    }
  }

  async function handleRate(resourceId, payload) {
    await rateResource(resourceId, payload)
    await loadResources({
      ...filters,
      search: deferredSearch,
    })
  }

  async function handleDownload(resourceId) {
    await incrementDownload(resourceId)
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Swap Hub"
        subtitle="Search lecture notes, books, past papers, and student-made guides in one organized resource vault."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="field-input"
            type="text"
            name="search"
            placeholder="Search by title, subject, or uploader"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select
            className="field-input"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="field-input"
            name="resource_type"
            value={filters.resource_type}
            onChange={handleFilterChange}
          >
            <option value="">All resource types</option>
            <option value="notes">Notes</option>
            <option value="book">Books</option>
            <option value="paper">Papers</option>
            <option value="slides">Slides</option>
            <option value="other">Other</option>
          </select>
        </div>
        {feedback.error && <p className="mt-4 text-sm font-medium text-rose-600">{feedback.error}</p>}
        {feedback.message && <p className="mt-4 text-sm font-medium text-emerald-600">{feedback.message}</p>}
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <UploadResourceForm categories={categories} onUpload={handleUpload} />

        <div className="space-y-4">
          {resources.length === 0 && (
            <EmptyState
              title="No resources match the current filters"
              copy="Try another search term or be the first person to share something useful."
            />
          )}
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDownload={handleDownload}
              onRate={handleRate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
