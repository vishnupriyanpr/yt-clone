import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const data = res.data?.data || res.data
      login(data.token, data.user)
      showToast('Welcome back!', 'success')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <svg width="32" height="22" viewBox="0 0 28 20">
            <rect width="28" height="20" rx="4" fill="#36BCF7"/>
            <polygon points="11,6 11,14 19,10" fill="white"/>
          </svg>
          <span className="auth-logo-text">YTClone</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input id="login-email" name="email" type="email" className="form-input"
              placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input id="login-password" name="password" type="password" className="form-input"
              placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="current-password" />
          </div>
          <button type="submit" className="form-submit" disabled={loading} id="login-submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div style={{
          marginTop: 20, padding: 12,
          background: 'rgba(255,255,255,0.04)', borderRadius: 6,
          fontSize: 12, color: 'var(--muted)',
        }}>
          <strong style={{ color: 'var(--text)' }}>Demo accounts:</strong><br />
          tech@demo.com / demo123<br />
          gaming@demo.com / demo123<br />
          music@demo.com / demo123
        </div>
      </div>
    </div>
  )
}
