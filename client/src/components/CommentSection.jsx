import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'
import { formatAge } from '../utils/formatTime'

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

  return (
    <div className="comments-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 className="comments-title" style={{ marginBottom: 0 }}>
          {total} Comment{total !== 1 ? 's' : ''}
        </h3>
        <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}
          style={{ width: 'auto', height: 32, fontSize: 13, padding: '0 28px 0 10px' }}>
          <option value="newest">Newest first</option>
          <option value="top">Top comments</option>
        </select>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit}>
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
              />
              {focused && (
                <div className="comment-actions">
                  <button type="button" className="btn btn-ghost"
                    onClick={() => { setFocused(false); setText('') }}>Cancel</button>
                  <button type="submit" className="btn btn-primary"
                    disabled={!text.trim() || submitting} id="comment-submit-btn">
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

      {loading ? (
        <div className="loading-spinner" style={{ padding: 40 }}><div className="spinner" /></div>
      ) : (
        <div className="comment-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment-item fade-in">
              <Avatar src={comment.author?.avatar} username={comment.author?.username} size="sm" />
              <div className="comment-content">
                <div className="comment-author">
                  {comment.author?.username || 'Unknown'}
                  <span className="comment-date">{formatAge(comment.createdAt)}</span>
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>No comments yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  )
}
