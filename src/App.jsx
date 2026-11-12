import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Loader from './components/Loader'
import ProtectedRoute from './components/ProtectedRoute'
import SpaceBackground from './components/SpaceBackground'
import Home from './pages/Home'
import Missions from './pages/Missions'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Mission1 from './pages/missions/Mission1'
import Mission2 from './pages/missions/Mission2'
import Mission3 from './pages/missions/Mission3'
import DataSources from './pages/DataSources'

export default function App() {
  const [ready, setReady] = useState(() => sessionStorage.getItem('ss-loaded') === '1')
  const done = () => { sessionStorage.setItem('ss-loaded', '1'); setReady(true) }
  return (
    <>
      {!ready && <Loader onDone={done} />}
      <SpaceBackground />
      <div className="relative z-[1] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/missions/1" element={<ProtectedRoute><Mission1 /></ProtectedRoute>} />
            <Route path="/missions/2" element={<ProtectedRoute><Mission2 /></ProtectedRoute>} />
            <Route path="/missions/3" element={<ProtectedRoute><Mission3 /></ProtectedRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/DataSources" element={<DataSources />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}
