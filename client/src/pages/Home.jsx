import React, { useEffect, useState, useCallback } from 'react'
import VideoCard from '../components/VideoCard'
import { SkeletonGrid, TopLoadBar, OrbitalSpinner } from '../components/SkeletonLoader'
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
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

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
      setRefreshing(false)
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

  // Scroll-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const handleRefresh = () => {
    if (refreshing) return
    setRefreshing(true)
    setPage(1)
    setHasMore(true)
    fetchVideos(1, category, false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (error && !initialized) {
    return (
      <div className="error-state page-enter">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="glass-btn" onClick={() => { setError(''); fetchVideos(1, category) }} style={{ marginTop: 16, gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="page-enter">
      {/* Top loading bar */}
      <TopLoadBar visible={loading && !initialized} />

      {/* Category chips */}
      <div className="chip-row">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`chip${category === cat ? ' active' : ''}`}
            onClick={() => handleCategory(cat)}
            aria-pressed={category === cat}
          >
            {cat}
          </button>
        ))}
        {/* Refresh button */}
        <button
          className="chip"
          onClick={handleRefresh}
          aria-label="Refresh"
          style={{ marginLeft: 'auto', padding: '6px 12px' }}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={refreshing ? 'refresh-spin' : ''}
            style={{ transition: 'transform 0.3s ease' }}
          >
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {loading && !initialized ? (
        <SkeletonGrid count={16} />
      ) : videos.length === 0 ? (
        <div className="empty-state page-enter">
          <div className="empty-state-icon empty-float">🎬</div>
          <h2>No videos yet</h2>
          <p>Be the first to upload a video!</p>
        </div>
      ) : (
        <>
          <div
            className="video-grid stagger-children"
            style={{
              opacity: gridVisible ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {loadingMore && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <OrbitalSpinner size={40} label="Loading more" />
            </div>
          )}

          <div ref={sentinelRef} style={{ height: 1 }} />
        </>
      )}

      {/* Scroll-to-top button */}
      {showScrollTop && (
        <button
          className="scroll-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      )}
    </div>
  )
}
