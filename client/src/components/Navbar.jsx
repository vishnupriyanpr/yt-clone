import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'
import SearchBar from './SearchBar'

/* ── Mock notification data (UI-only) ── */
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'upload', text: 'Your video "React Tutorial" finished processing', time: '2h ago', unread: true },
  { id: 2, type: 'sub', text: 'TechCreator subscribed to your channel', time: '5h ago', unread: true },
  { id: 3, type: 'comment', text: 'GameDev replied to your comment', time: 'Yesterday', unread: false },
  { id: 4, type: 'like', text: 'Your video reached 100 likes! 🎉', time: '2 days ago', unread: false },
]

const NOTIF_ICONS = {
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  sub: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  comment: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  like: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
}

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  const unreadCount = notifications.filter(n => n.unread).length

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

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
      setShowNotif(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  return (
    <nav
      className="glass-navbar"
      role="navigation"
      aria-label="Main navigation"
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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6 }} aria-label="YTClone home">
          <svg width="30" height="21" viewBox="0 0 28 20">
            <rect width="28" height="20" rx="5" fill="#36BCF7"/>
            <polygon points="11,5 11,15 20,10" fill="white"/>
          </svg>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>YTClone</span>
        </Link>
      </div>

      {/* Center: Search */}
      <SearchBar />

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {isAuthenticated ? (
          <>
            {/* Upload button */}
            <Link
              to="/upload"
              className="glass-btn hover-accent"
              id="upload-nav-btn"
              aria-label="Upload video"
              style={{ gap: 6, borderRadius: 999, padding: '6px 16px', background: 'rgba(54,188,247,0.08)', borderColor: 'rgba(54,188,247,0.15)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="nav-upload-text" style={{ color: 'var(--text)', fontWeight: 600 }}>Create</span>
            </Link>

            {/* Notification bell */}
            <div ref={notifRef} className="notif-bell-wrap" style={{ position: 'relative' }}>
              <button
                className="glass-ghost"
                style={{
                  display: 'flex', alignItems: 'center', padding: 8, borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  background: showNotif ? 'rgba(255,255,255,0.08)' : 'transparent',
                  position: 'relative',
                }}
                onClick={() => setShowNotif(prev => !prev)}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={showNotif}
                aria-haspopup="true"
                id="notif-bell-btn"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill={showNotif ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>
              
              {showNotif && (
                <div
                  className="notif-dropdown scale-in"
                  role="dialog"
                  aria-label="Notifications"
                  style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 360, padding: 0, zIndex: 1001, borderRadius: 'var(--radius-lg)' }}
                >
                  <div className="notif-dropdown-header">
                    <span className="notif-dropdown-title">Notifications</span>
                    {unreadCount > 0 && (
                      <button className="notif-dropdown-action" onClick={markAllRead}>Mark all read</button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="notif-empty" style={{ padding: '48px 20px' }}>
                      <div className="notif-empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>You're all caught up</span>
                      <span style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>No new notifications right now.</span>
                    </div>
                  ) : (
                    <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className="notif-item"
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '12px 20px', cursor: 'pointer',
                            transition: 'background 0.2s ease',
                            background: n.unread ? 'rgba(54,188,247,0.04)' : 'transparent',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(54,188,247,0.04)' : 'transparent'}
                          onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item))}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'rgba(54,188,247,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--accent)', flexShrink: 0, marginTop: 2,
                          }}>
                            {NOTIF_ICONS[n.type] || NOTIF_ICONS.like}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{n.text}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 4 }}>{n.time}</div>
                          </div>
                          {n.unread && (
                            <div style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: 'var(--accent)', flexShrink: 0, marginTop: 8,
                            }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Avatar + dropdown */}
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
                  role="menu"
                  aria-label="Account menu"
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
                    role="menuitem"
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
                    role="menuitem"
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
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleLogout()}
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
          <Link to="/login" className="glass-btn" id="signin-btn" style={{ gap: 6 }} aria-label="Sign in">
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
