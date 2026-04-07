import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import VideoCard from '../components/VideoCard'
import { getWatchLater, removeFromWatchLater } from '../utils/watchLater'
import { formatViews } from '../utils/formatTime'

export default function Library() {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    setVideos(getWatchLater())
  }, [])

  const handleRemove = (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    removeFromWatchLater(id)
    setVideos(prev => prev.filter(v => v._id !== id))
  }

  return (
    <div className="library-page fade-in">

      {/* Header */}
      <div className="library-hero">
        <div className="library-hero-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h1 className="library-title">Watch Later</h1>
          <p className="library-subtitle">
            {videos.length === 0
              ? 'Your saved videos will appear here'
              : `${videos.length} ${videos.length === 1 ? 'video' : 'videos'} saved`}
          </p>
        </div>
        {videos.length > 0 && (
          <button
            className="glass-btn"
            onClick={() => { setVideos([]); localStorage.removeItem('yt_watch_later') }}
            style={{ marginLeft: 'auto', fontSize: 13 }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="library-divider" />

      {videos.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-illustration">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h2 className="library-empty-title">Nothing saved yet</h2>
          <p className="library-empty-desc">
            Tap <strong style={{ color: 'var(--text)' }}>Save</strong> on any video to add it here
          </p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 24, gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Browse Videos
          </Link>
        </div>
      ) : (
        <div className="video-grid library-grid stagger-children">
          {videos.map(video => (
            <div key={video._id} className="library-card-wrapper">
              <VideoCard video={video} />
              <button
                className="library-remove-btn"
                onClick={(e) => handleRemove(video._id, e)}
                aria-label="Remove from Watch Later"
                title="Remove"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
