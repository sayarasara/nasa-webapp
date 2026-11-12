import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setLoading(false) }), [])
  const value = {
    user, loading,
    register: async (name, email, pw) => {
      const c = await createUserWithEmailAndPassword(auth, email, pw)
      await updateProfile(c.user, { displayName: name })
      setUser({ ...c.user, displayName: name })
    },
    login: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
    google: () => signInWithPopup(auth, googleProvider),
    logout: () => signOut(auth),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
