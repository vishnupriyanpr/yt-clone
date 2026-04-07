import React from 'react'
import { Link } from 'react-router-dom'
import { formatViews, formatAge, formatDuration } from '../utils/formatTime'

export default function VideoCard({ video }) {
  if (!video) return null
  const { _id, title, thumbnailUrl, uploader, views, createdAt, duration } = video

  const initial = (uploader?.username || 'U')[0].toUpperCase()
  const colors = ['#FF6B6B','#4ECDC4','#45B7D1','#6C5CE7','#FD79A8','#A29BFE','#55EFC4','#F39C12']
  let h = 0
  for (let i = 0; i < (uploader?.username || '').length; i++) {
    h = (uploader?.username || '').charCodeAt(i) + ((h << 5) - h)
  }
  const avatarBg = colors[Math.abs(h) % colors.length]

  return (
    <Link to={`/watch/${_id}`} className="video-card video-card-2025">
      <div className="video-card-thumbnail">
        <img
          src={thumbnailUrl}
          alt={title}
          loading="lazy"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${_id}/640/360` }}
        />
        {duration != null && (
          <span className="video-card-duration">{formatDuration(duration)}</span>
        )}
        {/* Hover overlay gradient */}
        <div className="video-card-hover-overlay" />
      </div>

      <div className="video-card-info">
        {uploader?.avatar ? (
          <img
            src={uploader.avatar}
            alt={uploader.username}
            className="video-card-avatar"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="video-card-avatar-initial" style={{ background: avatarBg }}>
            {initial}
          </div>
        )}

        <div className="video-card-details">
          <div className="video-card-title">{title}</div>
          <div className="video-card-channel">
            {uploader?.channelName || uploader?.username || 'Unknown'}
          </div>
          <div className="video-card-meta">
            {formatViews(views || 0)} views · {formatAge(createdAt)}
          </div>
        </div>
      </div>
    </Link>
  )
}
