import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('yt_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('yt_token') || null)
  const [loading, setLoading] = useState(!!localStorage.getItem('yt_token'))

  useEffect(() => {
    const storedToken = localStorage.getItem('yt_token')
    if (!storedToken) {
      setLoading(false)
      return
    }
    api.get('/auth/me')
      .then(res => {
        const userData = res.data?.data || res.data
        setUser(userData)
        localStorage.setItem('yt_user', JSON.stringify(userData))
      })
      .catch(() => {
        localStorage.removeItem('yt_token')
        localStorage.removeItem('yt_user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('yt_token', newToken)
    localStorage.setItem('yt_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('yt_token')
    localStorage.removeItem('yt_user')
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext
