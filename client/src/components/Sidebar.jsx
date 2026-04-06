import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  {
    to: '/', label: 'Home', end: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  },
  {
    to: '/search?q=trending', label: 'Trending',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  },
  {
    to: '/search?q=gaming', label: 'Gaming',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01M8 12h.01"/><path d="M16 10v4"/></svg>,
  },
  {
    to: '/search?q=music', label: 'Music',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  },
]

export default function Sidebar({ isOpen, isMobile, onClose }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const sidebarClass = [
    'sidebar',
    !isOpen && !isMobile ? 'mini' : '',
    isMobile && isOpen ? 'mobile-open' : '',
  ].filter(Boolean).join(' ')

  const handleNav = (path) => {
    navigate(path)
    if (isMobile) onClose()
  }

  return (
    <aside className={sidebarClass}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `sidebar-item${isActive && item.end ? ' active' : ''}`}
          onClick={() => isMobile && onClose()}
        >
          {item.icon}
          <span className="sidebar-label">{item.label}</span>
        </NavLink>
      ))}

      <div className="sidebar-divider" />
      <div className="sidebar-section-title">Library</div>

      {isAuthenticated ? (
        <div className="sidebar-item" onClick={() => handleNav('/upload')} style={{ cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span className="sidebar-label">Upload Video</span>
        </div>
      ) : (
        <NavLink to="/login" className="sidebar-item" onClick={() => isMobile && onClose()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span className="sidebar-label">Sign In</span>
        </NavLink>
      )}
    </aside>
  )
}
