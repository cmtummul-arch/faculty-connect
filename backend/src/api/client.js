import axios from 'axios'

export const AUTH_STORAGE_KEY = 'faculty-hub-auth'
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const client = axios.create({
  baseURL: API_BASE_URL,
})

client.interceptors.request.use((config) => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) {
    return config
  }

  try {
    const parsed = JSON.parse(stored)
    if (parsed?.tokens?.access) {
      config.headers.Authorization = `Bearer ${parsed.tokens.access}`
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return config
})

export default client
