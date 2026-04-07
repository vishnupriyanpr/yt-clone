import React, { useEffect, useState, useCallback } from 'react'
import VideoCard from '../components/VideoCard'
import { SkeletonGrid } from '../components/SkeletonLoader'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import api from '../api/axios'

const CATEGORIES = ['All', 'Music', 'Gaming', 'Tech', 'Vlog', 'Education', 'Entertainment', 'News', 'Sports', 'Cooking']

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [gridVisible, setGridVisible] = useState(true)

  const fetchVideos = useCallback(async (pageNum, cat, append = false) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams({ page: pageNum, limit: 12 })
      if (cat && cat !== 'All') params.append('category', cat)

      const res = await api.get(`/videos?${params}`)
      const data = res.data?.data || res.data
      const fetched = data.videos || []

      if (append) {
        setVideos(prev => [...prev, ...fetched])
      } else {
        setVideos(fetched)
      }
      setHasMore(pageNum < (data.totalPages || 1))
      setInitialized(true)
    } catch {
      if (!append) setError('Failed to load videos. Make sure the server is running.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setGridVisible(true)
    }
  }, [])

  useEffect(() => {
    setGridVisible(false)
    setPage(1)
    setHasMore(true)
    setVideos([])
    setInitialized(false)
    const timer = setTimeout(() => fetchVideos(1, category, false), 80)
    return () => clearTimeout(timer)
  }, [category, fetchVideos])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchVideos(nextPage, category, true)
  }, [page, category, loadingMore, hasMore, fetchVideos])

  const sentinelRef = useInfiniteScroll(loadMore, { enabled: hasMore && !loading })

  const handleCategory = (cat) => {
    if (cat === category) return
    setCategory(cat)
  }

  if (error && !initialized) {
    return (
      <div className="error-state">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="chip-row">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`chip${category === cat ? ' active' : ''}`}
            onClick={() => handleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && !initialized ? (
        <SkeletonGrid count={12} />
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎬</div>
          <h2>No videos yet</h2>
          <p>Be the first to upload a video!</p>
        </div>
      ) : (
        <>
          <div
            className="video-grid stagger-children"
            style={{
              padding: '24px',
              opacity: gridVisible ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {loadingMore && (
            <div className="loading-spinner" style={{ padding: 32 }}>
              <div className="spinner" />
            </div>
          )}

          <div ref={sentinelRef} style={{ height: 1 }} />
        </>
      )}
    </div>
  )
}
