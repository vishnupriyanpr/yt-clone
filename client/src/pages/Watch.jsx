import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import VideoPlayer from '../components/VideoPlayer'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'
import Avatar from '../components/Avatar'
import VideoCard from '../components/VideoCard'
import { formatViews, formatDate } from '../utils/formatTime'

export default function Watch() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const { showToast } = useToast()
  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [descExpanded, setDescExpanded] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [subCount, setSubCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError('')
    setDescExpanded(false)

    Promise.all([
      api.get(`/videos/${id}`),
      api.get('/videos?limit=20'),
    ])
      .then(([videoRes, allRes]) => {
        const v = videoRes.data?.data || videoRes.data
        setVideo(v)

        const uploaderSubs = v.uploader?.subscribers || []
        setSubCount(uploaderSubs.length || 0)
        if (isAuthenticated && user) {
          const uid = user._id || user.id
          setSubscribed(uploaderSubs.some(s => (s._id || s) === uid))
        }

        const allVids = allRes.data?.data?.videos || allRes.data?.data || []
        const filtered = allVids.filter(vid => vid._id !== id)
        const sameCat = filtered.filter(vid => vid.category === v.category)
        const rest = filtered.filter(vid => vid.category !== v.category)
        setRelated([...sameCat, ...rest].slice(0, 15))
      })
      .catch(() => setError('Failed to load video.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubscribe = async () => {
    if (!isAuthenticated) { showToast('Sign in to subscribe', 'info'); return }
    const uploaderId = video?.uploader?._id
    if (!uploaderId) return

    try {
      const res = await api.post(`/auth/subscribe/${uploaderId}`)
      const data = res.data?.data || res.data
      setSubscribed(data.subscribed)
      setSubCount(data.subscriberCount)
      showToast(data.subscribed ? 'Subscribed!' : 'Unsubscribed', 'success')
    } catch {
      showToast('Something went wrong', 'error')
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copied!', 'success'))
      .catch(() => showToast('Failed to copy link', 'error'))
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /><span>Loading video...</span></div>
  }

  if (error || !video) {
    return (
      <div className="error-state">
        <h2>Video not found</h2>
        <p>{error || 'This video may have been removed.'}</p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>Go Home</Link>
      </div>
    )
  }

  const userLiked = isAuthenticated && user ? video.likes?.some(l => (l._id || l) === (user._id || user.id)) : false
  const userDisliked = isAuthenticated && user ? video.dislikes?.some(d => (d._id || d) === (user._id || user.id)) : false
  const isOwn = isAuthenticated && user && (video.uploader?._id === (user._id || user.id))

  return (
    <div className="watch-layout fade-in">
      <div className="watch-main">
        <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} />

        <div className="watch-info">
          <h1 className="watch-title">{video.title}</h1>

          <div className="watch-meta">
            <span className="watch-views">
              {formatViews(video.views)} views · {formatDate(video.createdAt)}
            </span>
            <div className="watch-actions">
              <LikeButton
                videoId={video._id}
                initialLikes={video.likes?.length || 0}
                initialDislikes={video.dislikes?.length || 0}
                userLiked={userLiked}
                userDisliked={userDisliked}
              />
              <button className="glass-btn" onClick={handleShare} style={{ gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share
              </button>
            </div>
          </div>

          <div className="watch-channel" style={{ justifyContent: 'space-between' }}>
            <Link to={`/channel/${video.uploader?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar src={video.uploader?.avatar} username={video.uploader?.username} size="md" />
              <div>
                <div className="watch-channel-name">{video.uploader?.channelName || video.uploader?.username}</div>
                <div className="watch-channel-subs">{formatViews(subCount)} subscribers</div>
              </div>
            </Link>
            {!isOwn && (
              <button className={subscribed ? 'glass-btn' : 'btn-accent btn'} onClick={handleSubscribe}
                style={{ flexShrink: 0 }}>
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          {video.description && (
            <div className="watch-description" onClick={() => setDescExpanded(!descExpanded)}
              style={!descExpanded ? { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}>
              {video.description}
              {!descExpanded && <span style={{ color: 'var(--text)', display: 'block', marginTop: 4, fontSize: 13, fontWeight: 500 }}>...Show more</span>}
              {descExpanded && <span style={{ color: 'var(--muted)', display: 'block', marginTop: 4, fontSize: 13, fontWeight: 500 }}>Show less</span>}
            </div>
          )}

          {video.tags?.length > 0 && (
            <div className="tags-list" style={{ marginTop: 12 }}>
              {video.tags.map(tag => (
                <Link key={tag} to={`/search?q=${tag}`} className="tag">#{tag}</Link>
              ))}
            </div>
          )}
        </div>

        <CommentSection videoId={id} />
      </div>

      <div className="watch-sidebar">
        <div className="section-header"><h2>Up next</h2></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {related.map(vid => (
            <Link key={vid._id} to={`/watch/${vid._id}`} className="watch-sidebar-card">
              <img src={vid.thumbnailUrl} alt={vid.title} className="watch-sidebar-thumb"
                onError={(e) => { e.target.src = `https://picsum.photos/seed/${vid._id}/320/180` }} />
              <div className="watch-sidebar-info">
                <div className="watch-sidebar-title">{vid.title}</div>
                <div className="watch-sidebar-channel">{vid.uploader?.channelName || vid.uploader?.username}</div>
                <div className="watch-sidebar-views">{formatViews(vid.views)} views</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
