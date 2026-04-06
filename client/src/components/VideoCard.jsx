import React from 'react'
import { Link } from 'react-router-dom'
import { formatViews, formatAge, formatDuration } from '../utils/formatTime'

export default function VideoCard({ video }) {
  if (!video) return null
  const { _id, title, thumbnailUrl, uploader, views, createdAt, duration } = video

  const avatarSrc = uploader?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader?.username || 'U')}&background=444&color=fff`

  return (
    <Link to={`/watch/${_id}`} className="video-card">
      <div className="video-card-thumbnail">
        <img src={thumbnailUrl} alt={title} loading="lazy"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${_id}/640/360` }} />
        {duration != null && <span className="video-card-duration">{formatDuration(duration)}</span>}
      </div>
      <div className="video-card-info">
        <img src={avatarSrc} alt={uploader?.username} className="video-card-avatar"
          onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=U&background=444&color=fff' }} />
        <div className="video-card-details">
          <div className="video-card-title">{title}</div>
          <div className="video-card-channel">{uploader?.channelName || uploader?.username || 'Unknown'}</div>
          <div className="video-card-meta">{formatViews(views || 0)} views · {formatAge(createdAt)}</div>
        </div>
      </div>
    </Link>
  )
}
