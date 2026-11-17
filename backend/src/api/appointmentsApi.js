import client from './client'

export async function fetchAppointments() {
  const { data } = await client.get('/appointments/')
  return data
}

export async function createAppointment(payload) {
  const { data } = await client.post('/appointments/', payload)
  return data
}

export async function fetchConsultationHours(params = {}) {
  const { data } = await client.get('/appointments/consultation-hours/', { params })
  return data
}

export async function createConsultationHour(payload) {
  const { data } = await client.post('/appointments/consultation-hours/', payload)
  return data
}

export async function fetchFacultySlots(facultyId, params = {}) {
  const { data } = await client.get(
    `/appointments/faculty/${facultyId}/available-slots/`,
    { params },
  )
  return data
}

export async function acceptAppointment(id, payload) {
  const { data } = await client.post(`/appointments/${id}/accept/`, payload)
  return data
}

export async function rejectAppointment(id, payload) {
  const { data } = await client.post(`/appointments/${id}/reject/`, payload)
  return data
}

export async function suggestAlternative(id, payload) {
  const { data } = await client.post(
    `/appointments/${id}/suggest_alternative/`,
    payload,
  )
  return data
}

export async function acceptSuggestion(id) {
  const { data } = await client.post(`/appointments/${id}/accept_suggestion/`)
  return data
}

export async function cancelAppointment(id) {
  const { data } = await client.post(`/appointments/${id}/cancel/`)
  return data
}
