import React, { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { useToast } from './Toast'
import { formatViews } from '../utils/formatTime'

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

export default function LikeButton({
  videoId,
  initialLikes = 0,
  initialDislikes = 0,
  userLiked = false,
  userDisliked = false,
}) {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [liked, setLiked] = useState(userLiked)
  const [disliked, setDisliked] = useState(userDisliked)
  const [likeAnim, setLikeAnim] = useState(false)

  const handleLike = async (e) => {
    if (!isAuthenticated) { showToast('Sign in to like videos', 'info'); return }
    triggerParticles(e)
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 400)

    const prevLiked = liked, prevLikes = likes, prevDisliked = disliked, prevDislikes = dislikes
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
    if (disliked) { setDisliked(false); setDislikes(dislikes - 1) }

    try {
      const res = await api.put(`/videos/${videoId}/like`)
      const d = res.data.data
      setLiked(d.liked); setLikes(d.likeCount); setDislikes(d.dislikeCount)
      setDisliked(false)
    } catch {
      setLiked(prevLiked); setLikes(prevLikes); setDisliked(prevDisliked); setDislikes(prevDislikes)
      showToast('Something went wrong', 'error')
    }
  }

  const handleDislike = async () => {
    if (!isAuthenticated) { showToast('Sign in to dislike videos', 'info'); return }

    const prevLiked = liked, prevLikes = likes, prevDisliked = disliked, prevDislikes = dislikes
    setDisliked(!disliked)
    setDislikes(disliked ? dislikes - 1 : dislikes + 1)
    if (liked) { setLiked(false); setLikes(likes - 1) }

    try {
      const res = await api.put(`/videos/${videoId}/dislike`)
      const d = res.data.data
      setDisliked(d.disliked); setLikes(d.likeCount); setDislikes(d.dislikeCount)
      setLiked(false)
    } catch {
      setLiked(prevLiked); setLikes(prevLikes); setDisliked(prevDisliked); setDislikes(prevDislikes)
      showToast('Something went wrong', 'error')
    }
  }

  return (
    <div className="like-pill-2025" id="like-dislike-pill">
      <button
        className={`like-btn-half${liked ? ' active-like' : ''}`}
        onClick={handleLike}
        id="like-btn"
        aria-label="Like"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          className={likeAnim ? 'like-pop-2025' : ''}
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        {formatViews(likes)}
      </button>

      <div className="like-pill-divider" role="separator" />

      <button
        className={`like-btn-half${disliked ? ' active-dislike' : ''}`}
        onClick={handleDislike}
        id="dislike-btn"
        aria-label="Dislike"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={disliked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: 'rotate(180deg)' }}
        >
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        {formatViews(dislikes)}
      </button>
    </div>
  )
}
