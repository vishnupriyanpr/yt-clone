import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PlayerProvider } from './context/PlayerContext'
import { ToastProvider } from './components/Toast'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import MiniPlayer from './components/MiniPlayer'
import { OrbitalSpinner } from './components/SkeletonLoader'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Search from './pages/Search'
import Upload from './pages/Upload'
import Channel from './pages/Channel'
import Library from './pages/Library'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="loading-spinner"><OrbitalSpinner label="Authenticating" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  return (
    <BrowserRouter>
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay visible" onClick={() => setSidebarOpen(false)} />
        )}
        <main className={`main-content${!sidebarOpen && !isMobile ? ' sidebar-mini' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/channel/:id" element={<Channel />} />
            <Route path="/library" element={<Library />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {/* Mini player — globally available */}
      <MiniPlayer />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </PlayerProvider>
    </AuthProvider>
  )
}
