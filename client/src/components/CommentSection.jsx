import React, { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'
import { formatAge, formatViews } from '../utils/formatTime'

/* ── CommentItem — supports depth 0/1/2 ── */
function CommentItem({ comment, depth = 0, videoId, onReplyAdded }) {
  const { isAuthenticated, user } = useAuth()
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [localLiked, setLocalLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(comment.likes || 0)
  const [localReplies, setLocalReplies] = useState(comment.replies || [])
  const textareaRef = useRef(null)

  const avatarSize = depth === 0 ? 'md' : 'sm'

  const handleToggleReplyInput = () => {
    if (!isAuthenticated) return
    setShowReplyInput(prev => !prev)
    setReplyText(`@${comment.author?.username || ''} `)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setSubmittingReply(true)
    try {
      const res = await api.post(`/comments/${videoId}`, {
        text: replyText.trim(),
        parentId: comment._id,
      })
      const newReply = res.data?.data || res.data
      const replyItem = newReply || {
        _id: `local-${Date.now()}`,
        text: replyText.trim(),
        author: user,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
      }
      setLocalReplies(prev => [...prev, replyItem])
      if (onReplyAdded) onReplyAdded(replyItem)
      setReplyText('')
      setShowReplyInput(false)
      setShowReplies(true)
    } catch {
      // On API error, still show optimistic reply in UI
      const optimisticReply = {
        _id: `local-${Date.now()}`,
        text: replyText.trim(),
        author: user,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
      }
      setLocalReplies(prev => [...prev, optimisticReply])
      setReplyText('')
      setShowReplyInput(false)
      setShowReplies(true)
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleLikeComment = () => {
    setLocalLiked(prev => !prev)
    setLocalLikes(prev => localLiked ? prev - 1 : prev + 1)
  }

  return (
    <div className={`comment-item-2025 depth-${depth}`}>
      <Avatar src={comment.author?.avatar} username={comment.author?.username} size={avatarSize} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div className="comment-author">
          {comment.author?.username || 'Unknown'}
          <span className="comment-date">{formatAge(comment.createdAt)}</span>
        </div>

        {/* Text */}
        <div className="comment-text" style={{ whiteSpace: 'pre-wrap', marginBottom: 4 }}>
          {comment.text}
        </div>

        {/* Action row */}
        <div className="comment-actions-row">
          <button
            className={`comment-action-btn${localLiked ? ' active' : ''}`}
            onClick={handleLikeComment}
            aria-label="Like comment"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={localLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
              <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            {localLikes > 0 && formatViews(localLikes)}
          </button>

          {depth < 2 && (
            <button className="comment-action-btn" onClick={handleToggleReplyInput} aria-label="Reply">
              ↩ Reply
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="comment-reply-input">
            <form onSubmit={handleSubmitReply}>
              <div className="comment-input-row" style={{ marginBottom: 8 }}>
                <Avatar src={user?.avatar} username={user?.username} size="sm" />
                <div className="comment-input-area">
                  <textarea
                    ref={textareaRef}
                    className="comment-textarea"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    placeholder={`Reply to @${comment.author?.username}...`}
                    style={{ borderRadius: 8 }}
                  />
                  <div className="comment-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowReplyInput(false)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!replyText.trim() || submittingReply}
                    >
                      {submittingReply ? 'Posting...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Replies toggle */}
        {localReplies.length > 0 && depth < 2 && (
          <>
            <button
              className="comment-replies-toggle"
              onClick={() => setShowReplies(prev => !prev)}
            >
              {showReplies
                ? `▲ Hide replies`
                : `▼ View ${localReplies.length} repl${localReplies.length !== 1 ? 'ies' : 'y'}`}
            </button>

            {showReplies && localReplies.map(reply => (
              <CommentItem
                key={reply._id}
                comment={reply}
                depth={depth + 1}
                videoId={videoId}
                onReplyAdded={null}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Main CommentSection ── */
export default function CommentSection({ videoId }) {
  const { isAuthenticated, user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const [sort, setSort] = useState('newest')
  const [total, setTotal] = useState(0)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const sortRef = useRef(null)

  useEffect(() => {
    if (!videoId) return
    setLoading(true)
    api.get(`/comments/${videoId}?sort=${sort}`)
      .then(res => {
        const data = res.data?.data || res.data
        setComments(data.comments || data || [])
        setTotal(data.total || (data.comments || data || []).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [videoId, sort])

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSortMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post(`/comments/${videoId}`, { text: text.trim() })
      const comment = res.data?.data || res.data
      setComments(prev => [comment, ...prev])
      setTotal(prev => prev + 1)
      setText('')
      setFocused(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const sortLabels = { newest: 'Newest first', top: 'Top comments' }

  return (
    <div className="comments-section">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
          {total} Comment{total !== 1 ? 's' : ''}
        </h3>

        <div className="comment-sort-dropdown" ref={sortRef} style={{ marginLeft: 'auto' }}>
          <button
            className="comment-sort-btn"
            onClick={() => setShowSortMenu(prev => !prev)}
            aria-label="Sort comments"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Sort by: {sortLabels[sort]}
          </button>

          {showSortMenu && (
            <div className="comment-sort-menu">
              {Object.entries(sortLabels).map(([val, label]) => (
                <button
                  key={val}
                  className={`comment-sort-option${sort === val ? ' active' : ''}`}
                  onClick={() => { setSort(val); setShowSortMenu(false) }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div className="comment-input-row">
            <Avatar src={user?.avatar} username={user?.username} size="sm" />
            <div className="comment-input-area">
              <textarea
                className="comment-textarea"
                placeholder="Add a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setFocused(true)}
                rows={focused ? 3 : 1}
                id="comment-input"
                style={{ borderRadius: 8 }}
              />
              {focused && (
                <div className="comment-actions" style={{ animation: 'fadeIn 0.15s ease' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setFocused(false); setText('') }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!text.trim() || submitting}
                    id="comment-submit-btn"
                  >
                    {submitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              )}
              {error && <div className="form-error" style={{ marginTop: 8 }}>{error}</div>}
            </div>
          </div>
        </form>
      ) : (
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>
          <a href="/login" style={{ color: 'var(--accent)' }}>Sign in</a> to add a comment
        </p>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="loading-spinner" style={{ padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="comment-list">
          {comments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              depth={0}
              videoId={videoId}
              onReplyAdded={null}
            />
          ))}
          {comments.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>No comments yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  )
}
