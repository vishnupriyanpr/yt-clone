import React from 'react'

function SkeletonCard() {
  return (
    <div className="depth-enter" style={{ overflow: 'hidden' }}>
      <div className="skeleton-wave" style={{ aspectRatio: '16/9', borderRadius: 'var(--radius)' }} />
      <div style={{ display: 'flex', gap: 10, paddingTop: 12 }}>
        <div className="skeleton-wave" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton-wave" style={{ height: 14, marginBottom: 8, width: '90%', borderRadius: 6 }} />
          <div className="skeleton-wave" style={{ height: 12, width: '60%', marginBottom: 6, borderRadius: 6 }} />
          <div className="skeleton-wave" style={{ height: 12, width: '40%', borderRadius: 6 }} />
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
  return <div className="skeleton-wave" style={{ height, width, borderRadius: 6, ...style }} />
}

/* ── Orbital Spinner — cinematic dual-ring loader ── */
export function OrbitalSpinner({ size = 48, label = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div className="orbital-spinner" style={{ width: size, height: size }}>
        <div className="orbital-spinner-dot" />
      </div>
      {label && (
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  )
}

/* ── Loading Dots — for inline loading states ── */
export function LoadingDots() {
  return (
    <span className="loading-dots" aria-label="Loading">
      <span /><span /><span />
    </span>
  )
}

/* ── Top Load Bar — YouTube-style progress ── */
export function TopLoadBar({ visible }) {
  if (!visible) return null
  return <div className="top-load-bar" />
}

/* ── Watch Page Skeleton ── */
export function WatchPageSkeleton() {
  return (
    <div style={{ maxWidth: 1800, margin: '0 auto', padding: '24px 24px 0' }}>
      <div className="skeleton-wave" style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-lg)', marginBottom: 16 }} />
      <div className="skeleton-wave" style={{ height: 24, width: '70%', marginBottom: 12, borderRadius: 6 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div className="skeleton-wave" style={{ height: 36, width: 100, borderRadius: 999 }} />
        <div className="skeleton-wave" style={{ height: 36, width: 80, borderRadius: 999 }} />
        <div className="skeleton-wave" style={{ height: 36, width: 80, borderRadius: 999 }} />
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div className="skeleton-wave" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        <div>
          <div className="skeleton-wave" style={{ height: 14, width: 120, marginBottom: 6, borderRadius: 6 }} />
          <div className="skeleton-wave" style={{ height: 12, width: 80, borderRadius: 6 }} />
        </div>
      </div>
      <div className="skeleton-wave" style={{ height: 80, borderRadius: 'var(--radius)', marginBottom: 24 }} />
    </div>
  )
}

export default SkeletonCard
