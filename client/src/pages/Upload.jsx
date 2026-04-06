import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useToast } from '../components/Toast'

const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''

export default function Upload() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)

  const [videoFile, setVideoFile] = useState(null)
  const [thumbFile, setThumbFile] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', tags: '', category: 'General', visibility: 'public' })
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)

  const videoInputRef = useRef()
  const thumbInputRef = useRef()

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('video/')) {
      if (file.size > MAX_VIDEO_SIZE) {
        showToast('Video must be under 100MB', 'error')
        return
      }
      setVideoFile(file)
      if (!form.title) setForm(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, '') }))
      setStep(2)
    } else {
      showToast('Please select a valid video file', 'error')
    }
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_VIDEO_SIZE) {
      showToast('Video must be under 100MB', 'error')
      return
    }
    setVideoFile(file)
    if (!form.title) setForm(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, '') }))
    setStep(2)
  }

  const uploadToCloudinary = (file, resourceType = 'video') => {
    return new Promise(async (resolve, reject) => {
      try {
        const signRes = await api.post('/upload/sign')
        const signData = signRes.data?.data || signRes.data

        const fd = new FormData()
        fd.append('file', file)
        fd.append('api_key', signData.apiKey)
        fd.append('timestamp', signData.timestamp)
        fd.append('signature', signData.signature)
        fd.append('upload_preset', 'yt_unsigned')
        fd.append('folder', 'yt-clone')

        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error('Upload failed'))
          }
        }

        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.send(fd)
      } catch (err) {
        reject(err)
      }
    })
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!videoFile) e.video = 'Please select a video file'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setUploading(true)
    setProgress(0)

    try {
      setStatusMsg('Uploading video to Cloudinary...')
      const videoResult = await uploadToCloudinary(videoFile, 'video')

      let thumbnailUrl = ''
      if (thumbFile) {
        setStatusMsg('Uploading thumbnail...')
        setProgress(0)
        const thumbResult = await uploadToCloudinary(thumbFile, 'image')
        thumbnailUrl = thumbResult.secure_url
      } else {
        thumbnailUrl = videoResult.secure_url.replace(/\.[^.]+$/, '.jpg')
      }

      setStatusMsg('Creating video entry...')
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean)

      const res = await api.post('/videos', {
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: videoResult.secure_url,
        publicId: videoResult.public_id,
        thumbnailUrl,
        tags: tagsArray,
        category: form.category,
        visibility: form.visibility,
        duration: Math.round(videoResult.duration || 0),
      })

      const created = res.data?.data || res.data
      setDone(true)
      showToast('Video uploaded successfully!', 'success')
      setTimeout(() => navigate(`/watch/${created._id}`), 1500)
    } catch (err) {
      setStatusMsg('')
      setUploading(false)
      showToast(err.response?.data?.message || 'Upload failed. Please try again.', 'error')
    }
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  if (done) {
    return (
      <div className="upload-page">
        <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 48 }}>✅</span>
          <p style={{ fontSize: 16, fontWeight: 500 }}>Video uploaded successfully!</p>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Redirecting to your video...</p>
        </div>
      </div>
    )
  }

  if (uploading) {
    return (
      <div className="upload-page">
        <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
          <div className="spinner" />
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{statusMsg}</p>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div className="glass-progress">
              <div className="glass-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>{progress}%</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="upload-page fade-in">
        <h1 className="upload-title">Upload Video</h1>
        <div
          className={`upload-drop${dragging ? ' dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => videoInputRef.current?.click()}
        >
          <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.6 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Drag and drop your video here</p>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>or click to browse</p>
          <p style={{ color: 'var(--muted2)', fontSize: 12, marginTop: 12 }}>MP4, WebM, MOV • Max 100MB</p>
          <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="upload-page fade-in">
      <h1 className="upload-title">Upload Video</h1>

      <div style={{
        background: 'var(--accent-soft)', border: '1px solid rgba(255,0,0,0.2)',
        borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent)', flexShrink: 0 }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span style={{ color: 'var(--text)' }}>{videoFile?.name}</span>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>({(videoFile?.size / (1024 * 1024)).toFixed(1)} MB)</span>
        <button onClick={() => { setStep(1); setVideoFile(null) }} className="btn-ghost"
          style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 8px' }}>Change</button>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label className="form-label" htmlFor="upload-title">Title *</label>
          <input id="upload-title" name="title" type="text" className="form-input"
            placeholder="Enter a compelling title..." value={form.title} onChange={handleChange} maxLength={100} />
          {errors.title && <p style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{errors.title}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="upload-desc">Description</label>
          <textarea id="upload-desc" name="description" className="form-textarea"
            placeholder="Tell viewers about your video..." value={form.description} onChange={handleChange}
            rows={4} maxLength={5000} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="upload-category">Category</label>
            <select id="upload-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
              <option value="General">General</option>
              <option value="Tech">Tech</option>
              <option value="Gaming">Gaming</option>
              <option value="Music">Music</option>
              <option value="Vlog">Vlog</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="upload-visibility">Visibility</label>
            <select id="upload-visibility" name="visibility" className="form-select" value={form.visibility} onChange={handleChange}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="upload-tags">Tags (comma‑separated)</label>
          <input id="upload-tags" name="tags" type="text" className="form-input"
            placeholder="e.g. tutorial, react, programming" value={form.tags} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Thumbnail (optional)</label>
          <label className={`file-input-label${thumbFile ? ' upload-file-selected' : ''}`} htmlFor="thumb-file-input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {thumbFile ? thumbFile.name : 'Choose thumbnail image'}
            <input id="thumb-file-input" ref={thumbInputRef} type="file" accept="image/*"
              onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
          </label>
          <p style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>
            If not provided, a frame from the video will be used
          </p>
        </div>

        <button type="submit" className="form-submit" id="upload-submit-btn"
          style={{ marginTop: 8, height: 48, borderRadius: 'var(--radius)', fontSize: 15, fontWeight: 600 }}>
          Upload Video
        </button>
      </form>
    </div>
  )
}
