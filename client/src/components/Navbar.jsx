import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'
import SearchBar from './SearchBar'

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  return (
    <nav className="glass-navbar" style={{
      position: 'sticky', top: 0, zIndex: 1000,
      height: 'var(--navbar-h)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', gap: 16,
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button onClick={onToggleSidebar} className="glass-ghost"
          style={{ display: 'flex', alignItems: 'center', padding: 8 }} aria-label="Toggle sidebar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="30" height="21" viewBox="0 0 28 20">
            <rect width="28" height="20" rx="5" fill="#FF0000"/>
            <polygon points="11,5 11,15 20,10" fill="white"/>
          </svg>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>YTClone</span>
        </Link>
      </div>

      <SearchBar />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {isAuthenticated ? (
          <>
            <Link to="/upload" className="glass-btn" id="upload-nav-btn" style={{ gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="nav-upload-text">Upload</span>
            </Link>

            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <Avatar src={user?.avatar} username={user?.username} size="sm"
                onClick={() => setShowDropdown(!showDropdown)} />
              {showDropdown && (
                <div className="glass-dropdown scale-in" style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 220, padding: '8px 0', zIndex: 1001,
                }}>
                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar src={user?.avatar} username={user?.username} size="md" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user?.email}</div>
                    </div>
                  </div>
                  <div className="glass-divider" />
                  <Link to={`/channel/${user?._id || user?.id}`} onClick={() => setShowDropdown(false)}
                    className="sidebar-item" style={{ padding: '10px 16px', gap: 12, fontSize: 14, margin: 0, borderLeft: 'none' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Your Channel
                  </Link>
                  <div className="glass-divider" />
                  <div onClick={handleLogout}
                    className="sidebar-item" style={{ padding: '10px 16px', gap: 12, fontSize: 14, margin: 0, borderLeft: 'none' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="glass-btn" id="signin-btn" style={{ gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ color: 'var(--accent)' }}>Sign in</span>
          </Link>
        )}
      </div>

      <style>{`@media (max-width: 640px) { .nav-upload-text { display: none; } }`}</style>
    </nav>
  )
}
