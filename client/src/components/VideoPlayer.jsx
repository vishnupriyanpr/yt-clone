import React, { useRef, useState, useEffect, useCallback, useContext } from 'react'
import { formatDuration } from '../utils/formatTime'
import { PlayerContext } from '../context/PlayerContext'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function triggerParticles(e) {
  const colors = ['#ff0000', '#ff6b6b', '#ffaa00', '#ffffff']
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div')
    const dx = (Math.random() - 0.5) * 80
    const dy = (Math.random() - 1) * 80
    p.style.cssText = `
      position:fixed;left:${e.clientX}px;top:${e.clientY}px;
      width:6px;height:6px;border-radius:50%;
      background:${colors[i % 4]};pointer-events:none;z-index:9999;
      animation:particle-burst 0.6s ease-out forwards;
      --dx:${dx}px;--dy:${dy}px;
    `
    document.body.appendChild(p)
    setTimeout(() => p.remove(), 650)
  }
}

export default function VideoPlayer({ src, poster, likeCount, onLike, liked }) {
  const videoRef = useRef(null)
  const wrapperRef = useRef(null)
  const hideTimer = useRef(null)
  const clickTimer = useRef(null)
  const progressRef = useRef(null)
  const isDragging = useRef(false)
  const toastTimer = useRef(null)

  const playerCtx = useContext(PlayerContext)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [speedIdx, setSpeedIdx] = useState(2) // default 1x
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [seekOverlay, setSeekOverlay] = useState(null) // { side, key }
  const [ambientColor, setAmbientColor] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastKey, setToastKey] = useState(0)

  /* ── Controls auto-hide ── */
  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current)
    setShowControls(true)
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2500)
    }
  }, [playing])

  useEffect(() => {
    if (!playing) setShowControls(true)
    else scheduleHide()
    return () => clearTimeout(hideTimer.current)
  }, [playing, scheduleHide])

  /* ── Ambient color sampling ── */
  const sampleAmbient = useCallback(() => {
    const v = videoRef.current
    if (!v || v.readyState < 2) return
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 50; canvas.height = 50
      const ctx = canvas.getContext('2d')
      ctx.drawImage(v, 0, 0, 50, 50)
      const data = ctx.getImageData(0, 0, 50, 50).data
      let r = 0, g = 0, b = 0, count = 0
      for (let i = 0; i < data.length; i += 16) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++
      }
      if (count > 0) {
        r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count)
        setAmbientColor(`rgba(${r},${g},${b},0.35)`)
      }
    } catch (_) {}
  }, [])

  /* ── Seek overlay helper ── */
  const showSeekOverlay = useCallback((side) => {
    setSeekOverlay({ side, key: Date.now() })
    setTimeout(() => setSeekOverlay(null), 820)
  }, [])

  /* ── Shortcut toast ── */
  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    setToastKey(k => k + 1)
    toastTimer.current = setTimeout(() => setToast(null), 1250)
  }, [])

  /* ── Playback ── */
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }, [])

  /* ── Seek ── */
  const seekBySeconds = useCallback((secs) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs))
    showSeekOverlay(secs > 0 ? 'right' : 'left')
    showToast(secs > 0 ? `+${secs}s` : `${secs}s`)
  }, [showSeekOverlay, showToast])

  const seekToPercent = useCallback((pct) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    v.currentTime = v.duration * pct
  }, [])

  /* ── Volume ── */
  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    showToast(v.muted ? '🔇 Muted' : '🔊 Unmuted')
  }, [showToast])

  const changeVolume = useCallback((val) => {
    const v = videoRef.current
    if (!v) return
    v.volume = val; setVolume(val)
    if (val > 0) { v.muted = false; setMuted(false) }
  }, [])

  /* ── Speed ── */
  const cycleSpeed = useCallback(() => {
    const nextIdx = (speedIdx + 1) % SPEEDS.length
    setSpeedIdx(nextIdx)
    if (videoRef.current) videoRef.current.playbackRate = SPEEDS[nextIdx]
    showToast(`${SPEEDS[nextIdx]}x speed`)
  }, [speedIdx, showToast])

  /* ── Fullscreen ── */
  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  /* ── Progress bar interaction ── */
  const getProgressPct = useCallback((clientX) => {
    const el = progressRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [])

  const handleProgressClick = useCallback((e) => {
    e.stopPropagation()
    const pct = getProgressPct(e.clientX)
    seekToPercent(pct)
  }, [getProgressPct, seekToPercent])

  const handleProgressMouseDown = useCallback((e) => {
    e.stopPropagation()
    isDragging.current = true
    const onMove = (me) => {
      if (!isDragging.current) return
      seekToPercent(getProgressPct(me.clientX))
    }
    const onUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [getProgressPct, seekToPercent])

  /* ── Double-tap seek zones ── */
  const handleZoneClick = useCallback((side, e) => {
    e.stopPropagation()
    clearTimeout(clickTimer.current)
    clickTimer.current = setTimeout(() => {
      // single click on zone = play/pause
    }, 260)
  }, [])

  const handleZoneDblClick = useCallback((side, e) => {
    e.stopPropagation()
    clearTimeout(clickTimer.current)
    seekBySeconds(side === 'right' ? 10 : -10)
  }, [seekBySeconds])

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if (!focused) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const v = videoRef.current
      switch (e.key) {
        case ' ': case 'k':
          e.preventDefault()
          togglePlay()
          showToast(v?.paused ? '▶ Playing' : '⏸ Paused')
          break
        case 'ArrowLeft': case 'j':
          e.preventDefault(); seekBySeconds(-10); break
        case 'ArrowRight': case 'l':
          e.preventDefault(); seekBySeconds(10); break
        case 'ArrowUp':
          e.preventDefault()
          if (v) { const nv = Math.min(1, v.volume + 0.1); changeVolume(nv); showToast(`🔊 ${Math.round(nv * 100)}%`) }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (v) { const nv = Math.max(0, v.volume - 0.1); changeVolume(nv); showToast(`🔉 ${Math.round(nv * 100)}%`) }
          break
        case 'f': e.preventDefault(); toggleFullscreen(); break
        case 'm': e.preventDefault(); toggleMute(); break
        default:
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault()
            seekToPercent(parseInt(e.key) / 10)
          }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [focused, togglePlay, seekBySeconds, changeVolume, toggleMute, toggleFullscreen, seekToPercent, showToast])

  /* ── PlayerContext sync (mini player) ── */
  useEffect(() => {
    if (!playerCtx) return
    return () => {
      const v = videoRef.current
      if (v && !v.paused) {
        playerCtx.showMiniPlayer({ src, title: document.title, videoId: window.location.pathname.split('/').pop(), currentTime: v.currentTime })
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const progress = duration ? (currentTime / duration) * 100 : 0
  const speed = SPEEDS[speedIdx]

  return (
    <>
      <div
        ref={wrapperRef}
        className="player-wrapper"
        tabIndex={0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMouseEnter={() => scheduleHide()}
        onMouseLeave={() => { if (playing) setShowControls(false); setShowVolume(false) }}
        onMouseMove={scheduleHide}
        style={{ boxShadow: ambientColor ? `0 0 60px 10px ${ambientColor}` : undefined }}
      >
        {/* Video element */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          style={{ width: '100%', display: 'block', maxHeight: '75vh', background: '#000' }}
          onTimeUpdate={() => {
            const v = videoRef.current
            if (!v) return
            setCurrentTime(v.currentTime)
            if (v.buffered.length > 0) {
              setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100 || 0)
            }
          }}
          onLoadedData={sampleAmbient}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onClick={togglePlay}
        />

        {/* Double-tap seek zones */}
        <div
          onClick={(e) => handleZoneClick('left', e)}
          onDoubleClick={(e) => handleZoneDblClick('left', e)}
          style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', zIndex: 5 }}
        />
        <div
          onClick={(e) => handleZoneClick('right', e)}
          onDoubleClick={(e) => handleZoneDblClick('right', e)}
          style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', zIndex: 5 }}
        />

        {/* Seek overlays */}
        {seekOverlay && (
          <div key={seekOverlay.key} className={`seek-overlay ${seekOverlay.side}`}>
            {seekOverlay.side === 'left' ? '« -10s' : '+10s »'}
          </div>
        )}

        {/* Controls overlay */}
        <div
          className={`player-controls-overlay${showControls ? ' visible' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="progress-bar-2025"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div className="progress-track">
              <div className="progress-buffered" style={{ width: `${buffered}%` }} />
              <div className="progress-played" style={{ width: `${progress}%` }} />
              <div className="progress-thumb" style={{ left: `${progress}%` }} />
            </div>
          </div>

          {/* Controls row */}
          <div className="controls-row-2025">
            {/* LEFT group */}
            <div className="controls-left">
              {/* Play/Pause pill */}
              <button className="pill-control" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                )}
                <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                  {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
                </span>
              </button>

              {/* Volume pill */}
              <div
                className="volume-pill-wrap"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <button
                  className="pill-control"
                  onClick={toggleMute}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted || volume === 0 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <line x1="23" y1="9" x2="17" y2="15"/>
                      <line x1="17" y1="9" x2="23" y2="15"/>
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  )}
                </button>
                {showVolume && (
                  <div className="volume-popup">
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                      {Math.round((muted ? 0 : volume) * 100)}%
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={muted ? 0 : volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      aria-label="Volume"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT group */}
            <div className="controls-right">
              {/* Speed pill */}
              <button className="pill-control" onClick={cycleSpeed} aria-label="Playback speed">
                {speed}x
              </button>

              {/* Fullscreen pill */}
              <button className="pill-control" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  {isFullscreen ? (
                    <>
                      <polyline points="4 14 10 14 10 20"/>
                      <polyline points="20 10 14 10 14 4"/>
                      <line x1="14" y1="10" x2="21" y2="3"/>
                      <line x1="3" y1="21" x2="10" y2="14"/>
                    </>
                  ) : (
                    <>
                      <polyline points="15 3 21 3 21 9"/>
                      <polyline points="9 21 3 21 3 15"/>
                      <line x1="21" y1="3" x2="14" y2="10"/>
                      <line x1="3" y1="21" x2="10" y2="14"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Like overlay pill (top-right) */}
        {onLike && (
          <div className={`player-like-overlay${showControls ? ' visible' : ''}`}>
            <button
              className="pill-control"
              onClick={(e) => { onLike(); triggerParticles(e) }}
              aria-label="Like video"
              style={{ background: liked ? 'rgba(255,0,0,0.25)' : undefined }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#ff0000' : 'none'} stroke={liked ? '#ff0000' : 'white'} strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
              {likeCount != null && <span>{likeCount}</span>}
            </button>
          </div>
        )}
      </div>

      {/* Keyboard shortcut toast */}
      {toast && (
        <div key={toastKey} className="shortcut-toast">
          {toast}
        </div>
      )}
    </>
  )
}
