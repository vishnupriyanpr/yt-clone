import React, { createContext, useState, useCallback } from 'react'

export const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [miniPlayer, setMiniPlayer] = useState(null)
  // miniPlayer: { src, title, videoId, currentTime } | null

  const showMiniPlayer = useCallback((info) => {
    setMiniPlayer(info)
  }, [])

  const hideMiniPlayer = useCallback(() => {
    setMiniPlayer(null)
  }, [])

  const updateMiniPlayerTime = useCallback((time) => {
    setMiniPlayer(prev => prev ? { ...prev, currentTime: time } : prev)
  }, [])

  return (
    <PlayerContext.Provider value={{ miniPlayer, showMiniPlayer, hideMiniPlayer, updateMiniPlayerTime }}>
      {children}
    </PlayerContext.Provider>
  )
}
