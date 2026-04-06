import React from 'react'

// Hash a string to a color index
function hashToColor(str) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#6C5CE7', '#FD79A8',
    '#A29BFE', '#55EFC4', '#F39C12', '#E74C3C',
  ]
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const sizes = { xs: 20, sm: 24, md: 36, lg: 48, xl: 64 }

export default function Avatar({ src, username = '', size = 'md', onClick, className = '' }) {
  const dim = sizes[size] || sizes.md
  const initial = username ? username[0].toUpperCase() : '?'
  const bg = hashToColor(username)

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        className={className}
        onClick={onClick}
        style={{
          width: dim,
          height: dim,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          cursor: onClick ? 'pointer' : 'default',
        }}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex') }}
      />
    )
  }

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: dim * 0.42,
        fontWeight: 700,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {initial}
    </div>
  )
}
