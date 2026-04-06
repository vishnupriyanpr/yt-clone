import React from 'react'

function SkeletonCard() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 'var(--radius)' }} />
      <div style={{ display: 'flex', gap: 10, paddingTop: 12 }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '90%' }} />
          <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 12, width: '40%' }} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="video-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return <div className="skeleton" style={{ height, width, ...style }} />
}

export default SkeletonCard
