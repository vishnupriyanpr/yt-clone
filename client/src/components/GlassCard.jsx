import React from 'react'

export default function GlassCard({ children, className = '', onClick, hover = false, style }) {
  return (
    <div
      className={`glass-card ${hover ? 'glass-hover' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}
