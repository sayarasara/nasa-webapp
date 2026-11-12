import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
const DEFAULT = { m1: false, m2: false, m3: false, infrared: false, medals: {} }
export function useProgress() {
  const { user } = useAuth()
  const key = 'ss-progress-' + (user?.uid || 'guest')
  const [p, setP] = useState(() => { try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(key)) } } catch { return DEFAULT } })
  const update = patch => setP(o => { const n = { ...o, ...patch }; localStorage.setItem(key, JSON.stringify(n)); return n })
  return [p, update]
}
