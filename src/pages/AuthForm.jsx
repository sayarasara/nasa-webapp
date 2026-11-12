import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthForm({ mode }) {
  const isReg = mode === 'register'
  const { login, register, google } = useAuth()
  const nav = useNavigate()
  const from = useLocation().state?.from || '/missions'
  const [f, setF] = useState({ name: '', email: '', pw: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const run = async fn => {
    setErr(''); setBusy(true)
    try { await fn(); nav(from, { replace: true }) }
    catch (e) { setErr(e.code?.replace('auth/', '').replace(/-/g, ' ') || 'Something went wrong') }
    setBusy(false)
  }
  return (
    <section className="card w-full max-w-sm my-auto flex flex-col gap-3">
      <h2 className="font-display font-bold text-xl text-center">{isReg ? 'Join the Crew' : 'Welcome Back'}</h2>
      <form className="flex flex-col gap-3" onSubmit={e => { e.preventDefault(); run(() => isReg ? register(f.name, f.email, f.pw) : login(f.email, f.pw)) }}>
        {isReg && <input className="input" placeholder="Name" required value={f.name} onChange={set('name')} />}
        <input className="input" type="email" placeholder="Email" required value={f.email} onChange={set('email')} />
        <input className="input" type="password" placeholder="Password (min 6)" minLength={6} required value={f.pw} onChange={set('pw')} />
        {err && <p role="alert" className="text-sm text-red-400 capitalize">{err}</p>}
        <button className="btn" disabled={busy}>{isReg ? 'Register' : 'Login'}</button>
      </form>
      <button className="btn-ghost" disabled={busy} onClick={() => run(google)}>Continue with Google</button>
      <p className="text-xs text-mute text-center">{isReg ? <>Already a member? <Link className="text-neon" to="/login">Login</Link></> : <>New here? <Link className="text-neon" to="/register">Register</Link></>}</p>
    </section>
  )
}
