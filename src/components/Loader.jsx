import { useEffect, useState } from 'react'
import logo from '../assets/logo.jpg'
const TIPS = ['Calibrating telescopes…', 'Fueling the rockets…', 'Contacting mission control…', 'Ready for launch']
export default function Loader({ onDone }) {
  const [p, setP] = useState(0)
  useEffect(() => { const t = setInterval(() => setP(v => Math.min(100, v + 4)), 60); return () => clearInterval(t) }, [])
  useEffect(() => { if (p >= 100) { const t = setTimeout(onDone, 400); return () => clearTimeout(t) } }, [p, onDone])
  return (
    <div role="status" className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center gap-5">
      <img src={logo} alt="" className="w-32 rounded-full animate-pulse" />
      <h1 className="font-display font-extrabold tracking-[.2em] text-2xl">Stellar Strategy</h1>
      <div className="w-72 max-w-[70vw] h-1.5 rounded bg-white/10 overflow-hidden"><i className="block h-full bg-gradient-to-r from-neon to-mint" style={{ width: p + '%' }} /></div>
      <p className="text-mute text-sm h-5">{TIPS[Math.min(3, Math.floor(p / 26))]}</p>
    </div>
  )
}
