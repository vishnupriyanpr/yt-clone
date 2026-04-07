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
  const [highlighted, setHighlighted] = useState(-1)
  const debouncedQuery = useDebounce(query, 300)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    api.get(`/videos/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then(res => {
        const videos = res.data?.data?.videos || res.data || []
        setSuggestions(Array.isArray(videos) ? videos : [])
        setHighlighted(-1)
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

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
    const q = highlighted >= 0 && suggestions[highlighted]
      ? suggestions[highlighted].title
      : query
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') setShowSuggestions(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Enter') {
      if (highlighted >= 0 && suggestions[highlighted]) {
        e.preventDefault()
        const title = suggestions[highlighted].title
        setQuery(title)
        navigate(`/search?q=${encodeURIComponent(title)}`)
        setShowSuggestions(false)
      }
    }
  }

  const handleSuggestionClick = (video) => {
    setQuery(video.title)
    navigate(`/search?q=${encodeURIComponent(video.title)}`)
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, maxWidth: 600 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          className="glass-input search-input-2025"
          style={{
            borderRadius: '20px 0 0 20px',
            borderRight: 'none',
            height: 40,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          placeholder="Search..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          id="search-input"
          autoComplete="off"
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
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && query.trim().length >= 2 && (
        <div
          className="glass-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            zIndex: 1001,
            maxHeight: 320,
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
          {suggestions.map((video, idx) => (
            <div
              key={video._id}
              className={`search-suggestion-item${highlighted === idx ? ' highlighted' : ''}`}
              onClick={() => handleSuggestionClick(video)}
              onMouseEnter={() => setHighlighted(idx)}
            >
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="search-suggestion-thumb"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="search-suggestion-thumb" style={{ background: 'var(--surface2)' }} />
              )}
              <div className="search-suggestion-info">
                <div className="search-suggestion-title">{video.title}</div>
                {(video.uploader?.channelName || video.uploader?.username) && (
                  <div className="search-suggestion-channel">
                    {video.uploader?.channelName || video.uploader?.username}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
