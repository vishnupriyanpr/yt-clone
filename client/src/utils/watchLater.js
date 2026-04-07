/**
 * Watch Later utility — localStorage based, no backend required
 * Key: 'yt_watch_later'
 */

const KEY = 'yt_watch_later'

export function getWatchLater() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function addToWatchLater(video) {
  const list = getWatchLater()
  const filtered = list.filter(v => v._id !== video._id)
  const updated = [video, ...filtered]
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function removeFromWatchLater(id) {
  const list = getWatchLater()
  localStorage.setItem(KEY, JSON.stringify(list.filter(v => v._id !== id)))
}

export function isInWatchLater(id) {
  return getWatchLater().some(v => v._id === id)
}
