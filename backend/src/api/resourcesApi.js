import client from './client'

export async function fetchCategories() {
  const { data } = await client.get('/resources/categories/')
  return data
}

export async function fetchResources(params = {}) {
  const { data } = await client.get('/resources/', { params })
  return data
}

export async function createResource(formData) {
  const { data } = await client.post('/resources/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function rateResource(resourceId, payload) {
  const { data } = await client.post(`/resources/${resourceId}/rate/`, payload)
  return data
}

export async function incrementDownload(resourceId) {
  const { data } = await client.post(`/resources/${resourceId}/increment_download/`)
  return data
}
