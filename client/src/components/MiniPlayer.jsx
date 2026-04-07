import React, { useContext, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'

export default function MiniPlayer() {
  const ctx = useContext(PlayerContext)
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(true)
  const [closing, setClosing] = useState(false)
  const [progress, setProgress] = useState(0)

  const { miniPlayer, hideMiniPlayer, updateMiniPlayerTime } = ctx || {}

  useEffect(() => {
    if (!miniPlayer || !videoRef.current) return
    videoRef.current.currentTime = miniPlayer.currentTime || 0
    videoRef.current.play().catch(() => setPlaying(false))
  }, [miniPlayer]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!ctx || !miniPlayer) return null

  const handleClose = () => {
    setClosing(true)
    if (videoRef.current) videoRef.current.pause()
    setTimeout(() => { hideMiniPlayer(); setClosing(false) }, 300)
  }

  const handleNavigate = () => {
    const ct = videoRef.current?.currentTime || 0
    updateMiniPlayerTime(ct)
    if (videoRef.current) videoRef.current.pause()
    hideMiniPlayer()
    navigate(`/watch/${miniPlayer.videoId}`)
  }

  const togglePlay = (e) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play().catch(() => {}); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    updateMiniPlayerTime(v.currentTime)
    if (v.duration) setProgress((v.currentTime / v.duration) * 100)
  }

  return (
    <div className={`mini-player${closing ? ' closing' : ''}`} id="mini-player">
      {/* Video */}
      <div className="mini-player-video-wrap" onClick={handleNavigate}>
        <video
          ref={videoRef}
          src={miniPlayer.src}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          playsInline
        />
        {/* Play/pause overlay */}
        <div className="mini-player-video-overlay">
          <div className="mini-player-play-hint">
            {playing ? null : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.9">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mini-player-progress">
          <div className="mini-player-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Controls strip */}
      <div className="mini-player-controls">
        <button
          className="mini-player-btn"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>

        <div className="mini-player-info" onClick={handleNavigate}>
          <span className="mini-player-title">{miniPlayer.title}</span>
          <span className="mini-player-hint">Click to open</span>
        </div>

        <button
          className="mini-player-btn"
          onClick={handleClose}
          aria-label="Close mini player"
          style={{ flexShrink: 0 }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
