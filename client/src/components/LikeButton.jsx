import React, { useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { useToast } from './Toast'

export default function LikeButton({ videoId, initialLikes = 0, initialDislikes = 0, userLiked = false, userDisliked = false }) {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [liked, setLiked] = useState(userLiked)
  const [disliked, setDisliked] = useState(userDisliked)

  const handleLike = async () => {
    if (!isAuthenticated) { showToast('Sign in to like videos', 'info'); return }
    const prevLiked = liked; const prevLikes = likes; const prevDisliked = disliked; const prevDislikes = dislikes
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
    if (disliked) { setDisliked(false); setDislikes(dislikes - 1) }
    try {
      const res = await api.put(`/videos/${videoId}/like`)
      const d = res.data.data
      setLiked(d.liked); setLikes(d.likeCount); setDislikes(d.dislikeCount)
      if (!disliked) setDisliked(false)
    } catch {
      setLiked(prevLiked); setLikes(prevLikes); setDisliked(prevDisliked); setDislikes(prevDislikes)
      showToast('Something went wrong', 'error')
    }
  }

  const handleDislike = async () => {
    if (!isAuthenticated) { showToast('Sign in to dislike videos', 'info'); return }
    const prevLiked = liked; const prevLikes = likes; const prevDisliked = disliked; const prevDislikes = dislikes
    setDisliked(!disliked)
    setDislikes(disliked ? dislikes - 1 : dislikes + 1)
    if (liked) { setLiked(false); setLikes(likes - 1) }
    try {
      const res = await api.put(`/videos/${videoId}/dislike`)
      const d = res.data.data
      setDisliked(d.disliked); setLikes(d.likeCount); setDislikes(d.dislikeCount)
      if (!liked) setLiked(false)
    } catch {
      setLiked(prevLiked); setLikes(prevLikes); setDisliked(prevDisliked); setDislikes(prevDislikes)
      showToast('Something went wrong', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button className={`like-btn${liked ? ' liked' : ''}`} onClick={handleLike} id="like-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        {likes}
      </button>
      <button className={`like-btn${disliked ? ' disliked' : ''}`} onClick={handleDislike} id="dislike-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
        </svg>
        {dislikes}
      </button>
    </div>
  )
}
