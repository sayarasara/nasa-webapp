import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <p className="text-mute mt-20">Checking credentials…</p>
  return user ? children : <Navigate to="/login" state={{ from: loc.pathname }} replace />
}
