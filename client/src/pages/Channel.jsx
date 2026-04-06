import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import VideoCard from '../components/VideoCard'
import Avatar from '../components/Avatar'
import { formatViews } from '../utils/formatTime'

export default function Channel() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const { showToast } = useToast()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('videos')
  const [subscribed, setSubscribed] = useState(false)
  const [subCount, setSubCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([
      api.get(`/auth/user/${id}`),
      api.get(`/videos/channel/${id}`),
    ])
      .then(([userRes, videosRes]) => {
        const userData = userRes.data?.data || userRes.data
        setChannel(userData)
        const subs = userData.subscribers || []
        setSubCount(subs.length || 0)
        if (isAuthenticated && user) {
          const uid = user._id || user.id
          setSubscribed(subs.some(s => (s._id || s) === uid))
        }
        const vidData = videosRes.data?.data || videosRes.data
        setVideos(vidData.videos || vidData || [])
      })
      .catch(() => setError('Channel not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubscribe = async () => {
    if (!isAuthenticated) { showToast('Sign in to subscribe', 'info'); return }
    try {
      const res = await api.post(`/auth/subscribe/${id}`)
      const data = res.data?.data || res.data
      setSubscribed(data.subscribed)
      setSubCount(data.subscriberCount)
      showToast(data.subscribed ? 'Subscribed!' : 'Unsubscribed', 'success')
    } catch {
      showToast('Something went wrong', 'error')
    }
  }

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  if (error || !channel) {
    return (
      <div className="error-state">
        <h2>Channel not found</h2>
        <p>{error || 'This channel does not exist.'}</p>
      </div>
    )
  }

  const isOwn = isAuthenticated && user && ((user._id || user.id) === id)

  return (
    <div className="fade-in">
      <div className="channel-banner" style={{
        background: `linear-gradient(135deg, 
          hsl(${channel.username?.charCodeAt(0) * 3 || 0}, 45%, 20%), 
          hsl(${(channel.username?.charCodeAt(1) || 50) * 5}, 50%, 15%), 
          hsl(${(channel.username?.charCodeAt(2) || 100) * 2}, 40%, 12%))`,
      }} />

      <div className="channel-header">
        <div className="channel-avatar-ring">
          <Avatar src={channel.avatar} username={channel.username} size="lg" />
        </div>
        <div className="channel-info" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1>{channel.channelName || channel.username}</h1>
            <p className="channel-stats">
              @{channel.username} · {formatViews(subCount)} subscribers · {videos.length} videos
            </p>
            {channel.description && (
              <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{channel.description}</p>
            )}
          </div>
          {!isOwn && (
            <button className={subscribed ? 'glass-btn' : 'btn-accent btn'} onClick={handleSubscribe}
              style={{ flexShrink: 0, height: 36 }}>
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      <div className="channel-tabs">
        <button className={`channel-tab${tab === 'videos' ? ' active' : ''}`} onClick={() => setTab('videos')}>
          Videos
        </button>
        <button className={`channel-tab${tab === 'about' ? ' active' : ''}`} onClick={() => setTab('about')}>
          About
        </button>
      </div>

      {tab === 'videos' && (
        videos.length > 0 ? (
          <div className="video-grid stagger-children">
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h2>No videos yet</h2>
            <p>This channel hasn't uploaded any videos.</p>
          </div>
        )
      )}

      {tab === 'about' && (
        <div className="glass-panel" style={{ padding: 24, maxWidth: 600 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>About</h3>
          <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>
            {channel.description || 'No description provided.'}
          </p>
          <div style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
            <p>Joined {new Date(channel.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      )}
    </div>
  )
}
