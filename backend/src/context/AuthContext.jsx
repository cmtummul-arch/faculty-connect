import { useEffect, useMemo, useState } from 'react'

import {
  fetchCurrentUser,
  loginUser,
  registerUser,
} from '../api/authApi'
import { AUTH_STORAGE_KEY } from '../api/client'
import { AuthContext } from './AuthContextObject'

function readStoredAuth() {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [storedAuth] = useState(() => readStoredAuth())
  const [tokens, setTokens] = useState(storedAuth?.tokens || null)
  const [user, setUser] = useState(storedAuth?.user || null)
  const [loading, setLoading] = useState(
    () => Boolean(storedAuth?.tokens && !storedAuth?.user),
  )

  useEffect(() => {
    if (tokens && user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ tokens, user }))
      return
    }

    if (!tokens) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [tokens, user])

  useEffect(() => {
    if (!tokens || user) {
      return
    }

    const loadProfile = async () => {
      try {
        const profile = await fetchCurrentUser()
        setUser(profile)
      } catch {
        setTokens(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [tokens, user])

  async function login(credentials) {
    const data = await loginUser(credentials)
    setTokens({
      access: data.access,
      refresh: data.refresh,
    })
    setUser(data.user)
    return data.user
  }

  async function register(payload) {
    return registerUser(payload)
  }

  async function refreshProfile() {
    const profile = await fetchCurrentUser()
    setUser(profile)
    return profile
  }

  function logout() {
    setTokens(null)
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      tokens,
      loading,
      isAuthenticated: Boolean(tokens && user),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [loading, tokens, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
