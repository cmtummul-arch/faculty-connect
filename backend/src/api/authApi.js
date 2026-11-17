import client from './client'

export async function loginUser(payload) {
  const { data } = await client.post('/accounts/login/', payload)
  return data
}

export async function registerUser(payload) {
  const { data } = await client.post('/accounts/register/', payload)
  return data
}

export async function fetchCurrentUser() {
  const { data } = await client.get('/accounts/me/')
  return data
}

export async function fetchFacultyDirectory() {
  const { data } = await client.get('/accounts/faculty/')
  return data
}
