import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import Avatar from '../components/Avatar'
import { formatViews, formatAge } from '../utils/formatTime'

export default function Search() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('relevance')

  useEffect(() => {
    if (!q) { setVideos([]); return }
    setLoading(true)
    setError('')
    api.get(`/videos/search?q=${encodeURIComponent(q)}&sort=${sort}`)
      .then(res => {
        const data = res.data?.data || res.data
        setVideos(data.videos || data || [])
      })
      .catch(() => setError('Search failed. Please try again.'))
      .finally(() => setLoading(false))
  }, [q, sort])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p className="page-title" style={{ marginBottom: 0 }}>
          {q ? <>Search results for <span>"{q}"</span></> : 'Enter a search query'}
        </p>
        {q && videos.length > 0 && (
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ width: 'auto', height: 32, fontSize: 13, padding: '0 28px 0 10px' }}>
            <option value="relevance">Relevance</option>
            <option value="date">Upload date</option>
            <option value="views">View count</option>
          </select>
        )}
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Searching...</span>
        </div>
      )}

      {error && (
        <div className="error-state"><h2>Search failed</h2><p>{error}</p></div>
      )}

      {!loading && !error && videos.length === 0 && q && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2>No results found</h2>
          <p>Try different keywords</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {videos.map(video => (
            <Link key={video._id} to={`/watch/${video._id}`} className="search-result-card">
              <img src={video.thumbnailUrl} alt={video.title} className="search-result-thumb"
                onError={(e) => { e.target.src = `https://picsum.photos/seed/${video._id}/320/180` }} />
              <div className="search-result-info">
                <div className="search-result-title">{video.title}</div>
                <div className="search-result-meta">
                  {formatViews(video.views)} views · {formatAge(video.createdAt)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Avatar src={video.uploader?.avatar} username={video.uploader?.username} size="xs" />
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {video.uploader?.channelName || video.uploader?.username}
                  </span>
                </div>
                {video.description && (
                  <div className="search-result-desc">{video.description}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
