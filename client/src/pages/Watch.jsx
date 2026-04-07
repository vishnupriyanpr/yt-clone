import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import VideoPlayer from '../components/VideoPlayer'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'
import Avatar from '../components/Avatar'
import { formatViews, formatDate } from '../utils/formatTime'
import { addToWatchLater, removeFromWatchLater, isInWatchLater } from '../utils/watchLater'
import { WatchPageSkeleton } from '../components/SkeletonLoader'

/* ── Thumbnail dominant color sampler ── */
function sampleThumbnailColor(url, cb) {
  if (!url) return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 50; canvas.height = 50
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, 50, 50)
      const data = ctx.getImageData(0, 0, 50, 50).data
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 16) { r += data[i]; g += data[i + 1]; b += data[i + 2]; count++ }
      if (count) cb(Math.round(r / count), Math.round(g / count), Math.round(b / count))
    } catch (_) {}
  }
  img.src = url
}

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
  const [saved, setSaved] = useState(false)
  const [ambientRGB, setAmbientRGB] = useState(null)
  const [likeCount, setLikeCount] = useState(0)
  const [userLiked, setUserLiked] = useState(false)
  const [userDisliked, setUserDisliked] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    setDescExpanded(false)
    setAmbientRGB(null)

    Promise.all([
      api.get(`/videos/${id}`),
      api.get('/videos?limit=20'),
    ])
      .then(([videoRes, allRes]) => {
        const v = videoRes.data?.data || videoRes.data
        setVideo(v)
        setLikeCount(v.likes?.length || 0)

        const uploaderSubs = v.uploader?.subscribers || []
        setSubCount(uploaderSubs.length || 0)
        if (isAuthenticated && user) {
          const uid = user._id || user.id
          setSubscribed(uploaderSubs.some(s => (s._id || s) === uid))
          setUserLiked(v.likes?.some(l => (l._id || l) === uid) || false)
          setUserDisliked(v.dislikes?.some(d => (d._id || d) === uid) || false)
        }

        setSaved(isInWatchLater(v._id))

        const allVids = allRes.data?.data?.videos || allRes.data?.data || []
        const filtered = allVids.filter(vid => vid._id !== id)
        const sameCat = filtered.filter(vid => vid.category === v.category)
        const rest = filtered.filter(vid => vid.category !== v.category)
        setRelated([...sameCat, ...rest].slice(0, 15))

        // Sample thumbnail ambient color
        if (v.thumbnailUrl) {
          sampleThumbnailColor(v.thumbnailUrl, (r, g, b) => setAmbientRGB({ r, g, b }))
        }
      })
      .catch(() => setError('Failed to load video.'))
      .finally(() => setLoading(false))
  }, [id, isAuthenticated, user])

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

  const handleSave = () => {
    if (!video) return
    if (saved) {
      removeFromWatchLater(video._id)
      setSaved(false)
      showToast('Removed from Watch Later', 'info')
    } else {
      addToWatchLater(video)
      setSaved(true)
      showToast('Saved to Watch Later', 'success')
    }
  }

  const handlePlayerLike = useCallback(() => {
    if (!isAuthenticated) { showToast('Sign in to like videos', 'info'); return }
    setLikeCount(prev => userLiked ? prev - 1 : prev + 1)
    setUserLiked(prev => !prev)
    api.put(`/videos/${id}/like`)
      .then(res => {
        const d = res.data?.data
        if (d) { setLikeCount(d.likeCount); setUserLiked(d.liked) }
      })
      .catch(() => {})
  }, [isAuthenticated, id, userLiked, showToast])

  if (loading) {
    return <WatchPageSkeleton />
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

  const isOwn = isAuthenticated && user && (video.uploader?._id === (user._id || user.id))
  const ambientStyle = ambientRGB
    ? { background: `rgba(${ambientRGB.r},${ambientRGB.g},${ambientRGB.b},0.06)` }
    : {}

  return (
    <div className="watch-layout-2025 fade-in">
      {/* LEFT COLUMN */}
      <div className="watch-main">
        <VideoPlayer
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          likeCount={likeCount}
          onLike={handlePlayerLike}
          liked={userLiked}
        />

        {/* Title */}
        <h1 className="watch-title" style={{ marginTop: 16, marginBottom: 12 }}>
          {video.title}
        </h1>

        {/* Actions row */}
        <div className="watch-actions-2025">
          <div className="watch-actions-left">
            <LikeButton
              videoId={video._id}
              initialLikes={video.likes?.length || 0}
              initialDislikes={video.dislikes?.length || 0}
              userLiked={userLiked}
              userDisliked={userDisliked}
            />

            <button className="glass-btn" onClick={handleShare} style={{ gap: 6 }} id="share-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>

            <button
              className={`glass-btn${saved ? ' save-btn-active' : ''}`}
              onClick={handleSave}
              id="save-btn"
              style={{ gap: 6 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              {saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>

          <div className="watch-actions-right">
            <button className="glass-btn" aria-label="More options">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Channel row */}
        <div className="watch-channel-2025">
          <Link to={`/channel/${video.uploader?._id}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={video.uploader?.avatar} username={video.uploader?.username} size="md" />
            <div>
              <div className="watch-channel-name">{video.uploader?.channelName || video.uploader?.username}</div>
              <div className="watch-channel-subs">{formatViews(subCount)} subscribers</div>
            </div>
          </Link>
          {!isOwn && (
            <button
              className={subscribed ? 'glass-btn' : 'btn-accent btn'}
              onClick={handleSubscribe}
              style={{ marginLeft: 'auto', flexShrink: 0 }}
              id="subscribe-btn"
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>

        {/* Description panel */}
        <div
          className="watch-desc-2025"
          style={ambientStyle}
          onClick={() => setDescExpanded(prev => !prev)}
        >
          <div className="watch-desc-stats">
            {formatViews(video.views)} views • {formatDate(video.createdAt)}
          </div>

          {video.tags?.length > 0 && (
            <div className="watch-desc-tags">
              {video.tags.map(tag => (
                <Link key={tag} to={`/search?q=${tag}`} className="tag" onClick={e => e.stopPropagation()}>
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {video.description && (
            <>
              <div className={`watch-desc-text${descExpanded ? '' : ' clamped'}`}>
                {video.description}
              </div>
              <span className="watch-desc-toggle">
                {descExpanded ? 'Show less' : 'Show more'}
              </span>
            </>
          )}
        </div>

        <CommentSection videoId={id} />
      </div>

      {/* RIGHT COLUMN — sticky sidebar */}
      <div className="watch-sidebar-2025">
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Up next</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {related.map(vid => (
            <Link key={vid._id} to={`/watch/${vid._id}`} className="watch-sidebar-card">
              <img
                src={vid.thumbnailUrl}
                alt={vid.title}
                className="watch-sidebar-thumb"
                onError={(e) => { e.target.src = `https://picsum.photos/seed/${vid._id}/320/180` }}
              />
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
