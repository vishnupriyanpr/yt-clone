import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'
import SearchBar from './SearchBar'

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
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
    <nav
      className="glass-navbar"
      style={{
        position: 'sticky', top: 0, zIndex: 1000,
        height: 'var(--navbar-h)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', gap: 16,
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Left: hamburger + logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={onToggleSidebar}
          className="glass-ghost"
          style={{ display: 'flex', alignItems: 'center', padding: 8 }}
          aria-label="Toggle sidebar"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
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

      {/* Center: Search */}
      <SearchBar />

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {isAuthenticated ? (
          <>
            {/* Upload button — premium pill */}
            <Link
              to="/upload"
              className="glass-btn hover-accent"
              id="upload-nav-btn"
              style={{ gap: 6, borderRadius: 999, padding: '6px 16px', background: 'rgba(255,0,0,0.08)', borderColor: 'rgba(255,0,0,0.15)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="nav-upload-text" style={{ color: 'var(--text)', fontWeight: 600 }}>Create</span>
            </Link>

            {/* Notification bell — premium */}
            <div ref={notifRef} className="notif-bell-wrap" style={{ position: 'relative' }}>
              <button
                className="glass-ghost"
                style={{ display: 'flex', alignItems: 'center', padding: 8, borderRadius: 50, transition: 'all 0.2s ease', background: showNotif ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                onClick={() => setShowNotif(prev => !prev)}
                aria-label="Notifications"
                id="notif-bell-btn"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={showNotif ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              
              {showNotif && (
                <div className="notif-dropdown scale-in" style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 340, padding: 0, zIndex: 1001, borderRadius: 'var(--radius-lg)' }}>
                  <div className="notif-dropdown-header">
                    <span className="notif-dropdown-title">Notifications</span>
                    <button className="notif-dropdown-action">Mark all read</button>
                  </div>
                  <div className="notif-empty" style={{ padding: '48px 20px' }}>
                    <div className="notif-empty-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <polyline points="21 3 21 9 15 9"/>
                        <path d="M10 21A11 11 0 0 1 3 10"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginTop: 4 }}>You're all caught up</span>
                    <span style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>No new notifications right now. Keep exploring to find more content.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar + dropdown — premium */}
            <div ref={dropdownRef} style={{ position: 'relative', marginLeft: 4 }}>
              <Avatar
                src={user?.avatar}
                username={user?.username}
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className={showDropdown ? 'avatar-active' : ''}
              />
              {showDropdown && (
                <div
                  className="notif-dropdown scale-in"
                  style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 280, padding: '8px 0', zIndex: 1001, borderRadius: 'var(--radius-lg)' }}
                >
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar src={user?.avatar} username={user?.username} size="md" />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: 15, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.username}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.email}</div>
                    </div>
                  </div>
                  <div className="library-divider" style={{ margin: '8px 0', opacity: 0.5 }} />
                  <Link
                    to={`/channel/${user?._id || user?.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="sidebar-item hover-accent"
                    style={{ padding: '12px 20px', gap: 14, fontSize: 14, margin: '4px 8px', borderRadius: 'var(--radius)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Your Channel
                  </Link>
                  <Link
                    to="/library"
                    onClick={() => setShowDropdown(false)}
                    className="sidebar-item hover-accent"
                    style={{ padding: '12px 20px', gap: 14, fontSize: 14, margin: '4px 8px', borderRadius: 'var(--radius)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    Watch Later
                  </Link>
                  <div className="library-divider" style={{ margin: '8px 0', opacity: 0.5 }} />
                  <div
                    onClick={handleLogout}
                    className="sidebar-item"
                    style={{ padding: '12px 20px', gap: 14, fontSize: 14, margin: '4px 8px', borderRadius: 'var(--radius)', cursor: 'pointer', color: 'var(--error)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span style={{ color: 'var(--accent)' }}>Sign in</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
