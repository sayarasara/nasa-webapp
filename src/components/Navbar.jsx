import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.jpg'

const link = ({ isActive }) => `px-4 py-2 rounded-md text-sm font-semibold transition ${isActive ? 'text-neon bg-neon/10' : 'text-mute hover:text-ink hover:bg-white/5'}`

export default function Navbar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-12 py-3 bg-bg/70 backdrop-blur-xl border-b border-line">
      <Link to="/" className="flex items-center gap-3 font-display font-extrabold text-[13px] tracking-widest uppercase">
        <img src={logo} alt="" className="w-9 h-9 rounded-full object-cover shadow-[0_0_20px_rgba(102,221,255,.3)]" />
        <span>Stellar Strategy</span>
      </Link>
      <nav aria-label="Main navigation" className="order-3 w-full md:order-none md:w-auto flex justify-center gap-1">
        <NavLink to="/" end className={link}>Home</NavLink>
        <NavLink to="/missions" className={link}>Missions</NavLink>
        <NavLink to="/DataSources" className={link}>Data Sources</NavLink>
        <NavLink to="/about" className={link}>About</NavLink>
      </nav>
      <div className="flex items-center gap-2">
        {user ? <>
          <span className="hidden sm:block text-xs text-mint max-w-[140px] truncate">{user.displayName || user.email}</span>
          <button className="btn-ghost" onClick={async () => { await logout(); nav('/') }}>Logout</button>
        </> : <>
          <NavLink to="/login" className="btn-ghost">Login</NavLink>
          <NavLink to="/register" className="btn-ghost !text-mint !border-mint/40">Register</NavLink>
        </>}
      </div>
    </header>
  )
}
