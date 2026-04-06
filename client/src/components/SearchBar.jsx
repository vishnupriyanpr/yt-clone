import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import api from '../api/axios'

export default function SearchBar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const wrapperRef = useRef(null)

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    api.get(`/videos/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`)
      .then(res => {
        const videos = res.data?.data?.videos || res.data || []
        setSuggestions(Array.isArray(videos) ? videos : [])
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Click outside closes suggestions
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setShowSuggestions(false)
  }

  const handleSuggestionClick = (title) => {
    setQuery(title)
    navigate(`/search?q=${encodeURIComponent(title)}`)
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, maxWidth: 600 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className="glass-input"
          style={{
            borderRadius: '20px 0 0 20px',
            borderRight: 'none',
            height: 40,
          }}
          placeholder="Search..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          id="search-input"
        />
        <button
          type="submit"
          className="glass-btn"
          style={{
            borderRadius: '0 20px 20px 0',
            borderLeft: 'none',
            height: 40,
            width: 56,
            padding: 0,
            flexShrink: 0,
          }}
          aria-label="Search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (query.trim().length >= 2) && (
        <div
          className="glass-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            zIndex: 1001,
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          {loading && (
            <div style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13 }}>
              Searching...
            </div>
          )}
          {!loading && suggestions.length === 0 && (
            <div style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13 }}>
              No results for "{query}"
            </div>
          )}
          {suggestions.map(video => (
            <div
              key={video._id}
              onClick={() => handleSuggestionClick(video.title)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={{ fontSize: 14, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {video.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
