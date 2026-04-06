import React, { useRef, useState, useEffect, useCallback } from 'react'
import { formatDuration } from '../utils/formatTime'

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null)
  const wrapperRef = useRef(null)
  const hideTimer = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hovering, setHovering] = useState(false)

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current)
    setShowControls(true)
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  useEffect(() => {
    if (!playing) setShowControls(true)
    else scheduleHide()
    return () => clearTimeout(hideTimer.current)
  }, [playing, scheduleHide])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const v = videoRef.current
    if (v) v.currentTime = pct * v.duration
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const changeVolume = (e) => {
    const val = parseFloat(e.target.value)
    const v = videoRef.current
    if (v) { v.volume = val; setVolume(val); if (val > 0) { v.muted = false; setMuted(false) } }
  }

  const changeSpeed = (e) => {
    const val = parseFloat(e.target.value)
    const v = videoRef.current
    if (v) v.playbackRate = val
    setSpeed(val)
  }

  const toggleFullscreen = () => {
    const el = wrapperRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (!hovering) return
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break
        case 'ArrowLeft': e.preventDefault(); if (videoRef.current) videoRef.current.currentTime -= 5; break
        case 'ArrowRight': e.preventDefault(); if (videoRef.current) videoRef.current.currentTime += 5; break
        case 'ArrowUp': e.preventDefault(); if (videoRef.current) { const nv = Math.min(1, videoRef.current.volume + 0.1); videoRef.current.volume = nv; setVolume(nv) } break
        case 'ArrowDown': e.preventDefault(); if (videoRef.current) { const nv = Math.max(0, videoRef.current.volume - 0.1); videoRef.current.volume = nv; setVolume(nv) } break
        case 'f': e.preventDefault(); toggleFullscreen(); break
        case 'm': e.preventDefault(); toggleMute(); break
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [hovering])

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFSChange)
    return () => document.removeEventListener('fullscreenchange', onFSChange)
  }, [])

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={wrapperRef}
      className="video-player-wrapper"
      onMouseEnter={() => { setHovering(true); scheduleHide() }}
      onMouseLeave={() => { setHovering(false); if (playing) setShowControls(false) }}
      onMouseMove={scheduleHide}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Controls overlay */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          padding: '24px 16px 12px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Progress bar */}
        <div
          onClick={seek}
          style={{
            position: 'relative', height: 4, cursor: 'pointer',
            background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginBottom: 10,
          }}
          onMouseEnter={(e) => e.currentTarget.style.height = '6px'}
          onMouseLeave={(e) => e.currentTarget.style.height = '4px'}
        >
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'var(--accent)', borderRadius: 2,
            transition: 'width 0.1s linear',
          }} />
        </div>

        {/* Control buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
            {playing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            )}
          </button>

          <button onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
            {muted || volume === 0 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          </button>

          <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={changeVolume}
            style={{ width: 60, accentColor: 'var(--accent)', cursor: 'pointer' }} />

          <span style={{ color: '#fff', fontSize: 13, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
          </span>

          <div style={{ flex: 1 }} />

          <select value={speed} onChange={changeSpeed}
            style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, padding: '2px 4px', fontSize: 12, cursor: 'pointer' }}>
            <option value="0.5" style={{background:'#222'}}>0.5x</option>
            <option value="1" style={{background:'#222'}}>1x</option>
            <option value="1.25" style={{background:'#222'}}>1.25x</option>
            <option value="1.5" style={{background:'#222'}}>1.5x</option>
            <option value="2" style={{background:'#222'}}>2x</option>
          </select>

          <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              {isFullscreen ? (
                <><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></>
              ) : (
                <><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></>
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
