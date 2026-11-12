import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { runOrbit } from '../../game/orbit'
import { useProgress } from '../../hooks/useProgress'
import MissionMedal from '../../components/MissionMedal'
import { bestMedal, medalForScore } from '../../game/medals'

const Panel = ({ children, title }) => <div className="card w-full max-w-3xl flex flex-col gap-3">{title && <h2 className="font-display font-bold text-xl">{title}</h2>}{children}</div>
const Stat = ({ n, l }) => <div className="flex-1 text-center border border-line rounded p-3"><b className="font-display text-2xl text-neon block">{n}</b><span className="text-xs text-mute">{l}</span></div>

function OrbitGame({ orbit, cb, night }) {
  const ref = useRef(null), game = useRef(null)
  useEffect(() => { game.current = runOrbit(ref.current, { orbit }, cb); return () => game.current.destroy(true) }, []) // eslint-disable-line
  useEffect(() => { game.current?.setNight(night) }, [night])
  return <div ref={ref} className="w-full aspect-video" />
}

function Forecast({ onNext }) {
  const [t, setT] = useState(0)
  const pts = [[70, 50], [160, 100], [250, 140]]
  const [x, y] = pts[t]
  const arm = 'M0 0C10-4 18 4 16 14C14 26-2 32-16 26C-32 18-34-4-22-18'
  return (
    <Panel title="Storm Forecast">
      <svg viewBox="0 0 400 240" className="w-full rounded border border-line">
        <defs>
          <radialGradient id="sea" cx="50%" cy="45%" r="80%"><stop offset="0" stopColor="#1f7fc4" /><stop offset=".6" stopColor="#0d4a86" /><stop offset="1" stopColor="#051c40" /></radialGradient>
          <filter id="b3"><feGaussianBlur stdDeviation="3.5" /></filter>
          <filter id="b1"><feGaussianBlur stdDeviation="1.4" /></filter>
        </defs>
        <rect width="400" height="240" fill="url(#sea)" />
        {[60, 120, 180].map(v => <line key={v} x1="0" x2="400" y1={v} y2={v} stroke="#9fd8ff" strokeOpacity=".08" />)}
        {[100, 200, 300].map(v => <line key={v} y1="0" y2="240" x1={v} x2={v} stroke="#9fd8ff" strokeOpacity=".08" />)}
        <g filter="url(#b3)" fill="#fff" opacity=".35"><ellipse cx="60" cy="190" rx="50" ry="12" /><ellipse cx="200" cy="30" rx="60" ry="10" /><ellipse cx="340" cy="60" rx="40" ry="9" /><ellipse cx="150" cy="210" rx="44" ry="8" /></g>
        <g><ellipse cx="302" cy="156" rx="36" ry="21" fill="#c9b27a" /><ellipse cx="300" cy="152" rx="30" ry="16" fill="#2c8a40" /><ellipse cx="293" cy="148" rx="15" ry="7" fill="#4cb85a" /><ellipse cx="308" cy="157" rx="9" ry="4" fill="#1f6a31" /><ellipse cx="300" cy="153" rx="44" ry="27" fill="none" stroke="#bfeaff" strokeOpacity=".3" /></g>
        <text x="300" y="195" fontSize="10" fill="#fff" textAnchor="middle">Isle of Solana</text>
        <circle cx="300" cy="153" r="62" fill="rgba(239,68,68,.12)" stroke="#ef4444" strokeDasharray="4" />
        <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="#facc15" strokeDasharray="5 5" strokeWidth="2" />
        <circle cx={x} cy={y} r="34" fill="rgba(250,204,21,.15)" />
        <g transform={`translate(${x},${y})`}>
          <g filter="url(#b3)" opacity=".8"><circle r="26" fill="#e8f1fb" opacity=".5" /></g>
          <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite" />
            <g filter="url(#b1)" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".85">{[0, 120, 240].map(r => <path key={r} d={arm} transform={`rotate(${r})`} />)}</g></g>
          <circle r="4" fill="#0a1b33" /><circle r="7" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        </g>
      </svg>
      <div className="flex gap-2">{['NOW', '6 HOURS', '12 HOURS'].map((l, i) => <button key={l} className={'choice flex-1 text-center ' + (t === i ? 'on' : '')} onClick={() => setT(i)}>{l}</button>)}</div>
      <p className="text-xs text-mute">⚠ This is a simulated <b>prediction</b>, not a guaranteed outcome. White spiral = storm · yellow dots = predicted track · red zone = area at risk.</p>
      <button className="btn self-end" disabled={t < 2} onClick={onNext}>{t < 2 ? 'Check the 12-hour forecast' : 'Continue →'}</button>
    </Panel>)
}

export default function Mission2() {
  const [prog, save] = useProgress()
  const [stage, setStage] = useState('brief')
  const [orbit, setOrbit] = useState(null)
  const [sensor, setSensor] = useState(null)
  const [deployed, setDeployed] = useState(false)
  const [night, setNight] = useState(false)
  const [open, setOpen] = useState(false)
  const [delayed, setDelayed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const timer = useRef(null)
  const cb = useRef({})
  cb.current = { onDeployed: () => setDeployed(true), onFlag: () => setOpen(true) }
  useEffect(() => () => clearTimeout(timer.current), [])

  const closeWeather = () => {
    setOpen(false)
    if (!night) timer.current = setTimeout(() => setNight(true), 2000)
    else if (sensor === 0) setStage('fail')
    else setStage('forecast')
  }
  const launch = () => { setDeployed(false); setNight(false); setOpen(false); setAttempt(a => a + 1); setStage('sky') }
  const finish = () => {
    const score = (orbit === 'polar' ? 35 : 20) + (sensor === 1 ? 35 : 15) + (delayed ? 20 : 30)
    save({ m2: true, medals: { ...prog.medals, m2: bestMedal(prog.medals?.m2, medalForScore(score)) } })
    setStage('complete')
  }

  if (stage === 'brief') return <Panel title="Mission 02 · The Storm Sentinel"><p className="eyebrow">MISSION BRIEFING</p>
    <p className="text-sm text-[#b2bdd1] leading-relaxed">A tropical storm is developing over the ocean near Isle of Solana. The nation has no weather satellite, so tracking it is difficult. As Director General of the National Space Agency, you will choose the satellite’s orbit and sensors.</p>
    <blockquote className="border-l-2 border-mint pl-3 text-sm italic">“Director General, a potential tropical storm has been detected over the ocean. We need a reliable weather monitoring satellite to track its movement. Your decisions will determine the success of this mission.”</blockquote>
    <button className="btn self-end" onClick={() => setStage('history')}>Continue →</button></Panel>

  if (stage === 'history') return <Panel title="THE BEGINNING OF WEATHER SATELLITES"><p className="eyebrow">THE STORY OF TIROS-1</p>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="border border-line rounded bg-black/40 min-h-[200px] flex items-center justify-center overflow-hidden">
        <img src="/tiros1.jpeg" alt="Cutaway of the TIROS-1 satellite" className="w-full h-full object-contain" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block' }} />
        <p style={{ display: 'none' }} className="text-xs text-mute p-4 text-center">Add the TIROS-1 cutaway photo as <code>public/tiros1.jpg</code></p>
      </div>
      <div className="text-sm text-[#b2bdd1] leading-relaxed flex flex-col gap-2">
        <b className="text-ink">TIROS-1: The First Successful Weather Satellite</b>
        <p>NASA launched TIROS-1 on April 1, 1960, from Cape Canaveral, Florida, aboard a Thor-Able II rocket. It tracked a large cyclonic system near Bermuda over four days and also observed tornado and jet-stream structures. On June 15, 1960, an electrical power failure ended useful transmissions.</p>
        <p>Before it, scientists relied on ground stations. TIROS-1 proved satellites give a far broader view of Earth’s weather.</p>
      </div></div>
    <div className="flex gap-2"><Stat n="23,000" l="photos returned" /><Stat n="19,000" l="useful for weather" /><Stat n="2.5 mo" l="operational" /></div>
    <p className="text-sm italic text-mint">“Imagine trying to understand a huge storm without seeing the whole picture. TIROS-1 changed that by allowing scientists to observe Earth’s clouds from space!”</p>
    <div className="border-t border-line pt-3"><h3 className="font-display text-neon">NOW IT'S YOUR TURN!</h3><p className="text-sm text-[#b2bdd1] mt-1">Isle of Solana needs its own weather monitoring satellite. Design and launch one that can protect your nation’s people.</p></div>
    <button className="btn self-end" onClick={() => setStage('decide')}>Continue to mission decisions</button></Panel>

  if (stage === 'decide') return <Panel title="Director General Decisions">
    <div><h3 className="font-display text-sm text-mint mb-2">DECISION 1 · ORBIT TRAJECTORY</h3><div className="grid sm:grid-cols-2 gap-2">
      {[['equatorial', 'Equatorial Orbit', 'Cheaper, less fuel (Earth’s rotation helps an eastward launch). Covers mainly the equator and may miss storms far north or south.'], ['polar', 'Polar Orbit', 'More fuel and a complex launch. Passes over the poles so, as Earth rotates beneath it, it sees much more of the planet over time.']].map(([k, t, d]) => <button key={k} className={'choice ' + (orbit === k ? 'on' : '')} onClick={() => setOrbit(k)}><b>{t}</b><br /><span className="text-mute text-xs">{d}</span></button>)}</div></div>
    <div><h3 className="font-display text-sm text-mint mb-2">DECISION 2 · SENSOR PACKAGE</h3><div className="grid sm:grid-cols-2 gap-2">
      <button className={'choice ' + (sensor === 0 ? 'on' : '')} onClick={() => setSensor(0)}><b>Analog Visual Camera</b><br /><span className="text-mute text-xs">Light and cheap. Clear cloud images in daylight, but nothing in darkness.</span></button>
      <button disabled={!prog.infrared} className={'choice disabled:opacity-40 disabled:cursor-not-allowed ' + (sensor === 1 ? 'on' : '')} onClick={() => setSensor(1)}><b>Infrared Thermal Sensors {!prog.infrared && '🔒'}</b><br /><span className="text-mute text-xs">{prog.infrared ? 'Heavier and costly, but reads cloud-top heat day and night.' : 'Upgrade locked — unlocked by your Mission 1 reward after your first attempt.'}</span></button></div></div>
    {prog.infrared && <p className="text-xs text-mint">Tip: polar orbit gives wider coverage, and infrared enables night observation.</p>}
    <button className="btn self-end" disabled={!orbit || sensor === null} onClick={launch}>Launch satellite</button></Panel>

  if (stage === 'sky') return (
    <section className="w-full max-w-4xl flex flex-col gap-2">
      <div className="flex justify-between text-xs font-display"><span className="text-mint">{deployed ? 'SATELLITE DEPLOYMENT SUCCESSFUL' : 'LAUNCH SEQUENCE'}</span><span className={night ? 'text-violet' : 'text-yellow-300'}>{night ? '☾ NIGHT' : '☀ DAY'}</span></div>
      <div className="relative rounded-lg border border-line overflow-hidden bg-[#02030a]">
        <div className="relative"><OrbitGame key={attempt} orbit={orbit} cb={cb} night={night} /></div>
        {deployed && !open && <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white">Tap the red flag to open the Weather Control Center</p>}
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4"><div className="card w-full max-w-md flex flex-col gap-3 !bg-panel">
        <h3 className="font-display font-bold">WEATHER CONTROL CENTER</h3>
        {night && sensor === 0 ? <>
          <p className="text-red-400 font-display">WEATHER DATA UNAVAILABLE</p>
          <p className="text-sm text-[#b2bdd1]">Your satellite's visual camera cannot capture cloud images in darkness. Nighttime weather monitoring is unavailable.</p></> : <>
          <p className="text-mint font-display text-sm">{night ? 'NIGHTTIME MONITORING ACTIVE' : 'WEATHER MONITORING ACTIVE'}</p>
          {night && <p className="text-xs text-[#b2bdd1]">Your infrared sensors are detecting thermal patterns in darkness. Weather monitoring continues throughout the night.</p>}
          <ul className="text-sm grid grid-cols-2 gap-x-3 gap-y-1"><li className="text-mute">Location</li><li>Isle of Solana</li><li className="text-mute">Cloud coverage</li><li>85%</li><li className="text-mute">Cloud temp</li><li>-65°C</li><li className="text-mute">Wind speed</li><li>110 km/h</li><li className="text-mute">Storm status</li><li>Potential Tropical Storm</li><li className="text-mute">Mode</li><li>{night ? 'Infrared' : sensor === 0 ? 'Visible light' : 'Visible + infrared'}</li></ul>
          <p className="text-[10px] text-mute">Illustrative simulation values, not live measurements.</p></>}
        <button className="btn self-end" onClick={closeWeather}>{night && sensor === 1 ? 'Continue' : 'Close'}</button></div></div>}
    </section>)

  if (stage === 'fail') return <Panel title="MISSION INCOMPLETE"><p className="text-red-400 font-display text-sm">Reason: Sensor limitation</p>
    <p className="text-sm text-[#b2bdd1]">The satellite is still in orbit, but a visual camera cannot see in darkness, so the weather-monitoring objective was not achieved. This is a technology limit, not bad luck.</p>
    <div className="flex flex-wrap gap-2 justify-end"><Link to="/missions" className="btn-ghost">Mission dashboard</Link><button className="btn-ghost" onClick={() => setStage('decide')}>Review decisions</button>
      <button className="btn" onClick={() => { save({ infrared: true }); setSensor(null); setStage('reward') }}>Retry mission</button></div></Panel>

  if (stage === 'reward') return <Panel title="MISSION 1 REWARD UNLOCKED"><p className="text-neon font-display">Technology Upgrade: Advanced Sensor Access</p>
    <p className="text-sm text-[#b2bdd1]">Your previous mission achievements have unlocked new technology! You can now upgrade your weather satellite with infrared thermal sensors.</p>
    <button className="btn self-end" onClick={() => setStage('decide')}>Back to decisions</button></Panel>

  if (stage === 'forecast') return <Forecast onNext={() => setStage('warning')} />

  if (stage === 'warning') return <Panel title="MISSION CONTROL ALERT"><p className="text-sm text-[#b2bdd1]">“A tropical storm may approach Isle of Solana. Weather monitoring data suggests that the island could be at risk.”</p>
    {delayed && <p className="text-sm text-yellow-300">More observations are useful, but every hour of delay is an hour fewer for residents to prepare. Responsible agencies warn early and keep updating.</p>}
    <div className="grid sm:grid-cols-2 gap-2"><button className="choice" onClick={finish}><b>Send Early Warning</b><br /><span className="text-xs text-mute">Notify the population and ready emergency teams.</span></button>
      {!delayed && <button className="choice" onClick={() => setDelayed(true)}><b>Continue Monitoring</b><br /><span className="text-xs text-mute">Collect more data. Risks delaying the warning.</span></button>}</div></Panel>

  const rows = [['Orbit Coverage', orbit === 'polar' ? 'Excellent' : 'Limited'], ['Fuel Consumption', orbit === 'polar' ? 'High' : 'Low'], ['Sensor Performance', 'Day + night'], ['Weather Monitoring', 'Successful'], ['Storm Tracking', 'Successful'], ['Early Warning', delayed ? 'Sent (delayed)' : 'Sent on time']]
  const missionScore = (orbit === 'polar' ? 35 : 20) + (sensor === 1 ? 35 : 15) + (delayed ? 20 : 30)
  return <Panel title="MISSION SUCCESSFUL!"><p className="text-mint font-display">The Storm Sentinel is Operational!</p>
    <p className="text-sm text-[#b2bdd1]">Your nation now has its first weather satellite, watching storms day and night and supporting early warnings for Isle of Solana.</p>
    <div className="border border-line rounded divide-y divide-line text-sm">{rows.map(([a, b]) => <div key={a} className="flex justify-between px-3 py-2"><span className="text-mute">{a}</span><b>{b}</b></div>)}</div>
    <MissionMedal tier={prog.medals?.m2 || medalForScore(missionScore)} title="Storm Sentinel" score={missionScore} />
    <Link to="/missions" className="btn self-end">Back to Missions</Link></Panel>
}

// import { useEffect, useRef, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { runOrbit } from '../../game/orbit'
// import { useProgress } from '../../hooks/useProgress'

// const Panel = ({ children, title }) => <div className="card w-full max-w-3xl flex flex-col gap-3">{title && <h2 className="font-display font-bold text-xl">{title}</h2>}{children}</div>
// const Stat = ({ n, l }) => <div className="flex-1 text-center border border-line rounded p-3"><b className="font-display text-2xl text-neon block">{n}</b><span className="text-xs text-mute">{l}</span></div>

// function OrbitGame({ orbit, cb }) {
//   const ref = useRef(null)
//   useEffect(() => { const g = runOrbit(ref.current, { orbit }, cb); return () => g.destroy(true) }, []) // eslint-disable-line
//   return <div ref={ref} className="w-full aspect-video" />
// }

// function Forecast({ onNext }) {
//   const [t, setT] = useState(0)
//   const pts = [[70, 50], [160, 100], [250, 140]]
//   const [x, y] = pts[t]
//   return (
//     <Panel title="Storm Forecast">
//       <svg viewBox="0 0 400 240" className="w-full rounded bg-blue-950 border border-line">
//         <ellipse cx="300" cy="150" rx="26" ry="16" fill="#16a34a" /><text x="300" y="185" fontSize="10" fill="#fff" textAnchor="middle">Isle of Solana</text>
//         <circle cx="300" cy="150" r="60" fill="rgba(239,68,68,.15)" stroke="#ef4444" strokeDasharray="4" />
//         <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="#facc15" strokeDasharray="5 5" strokeWidth="2" />
//         <circle cx={x} cy={y} r="30" fill="rgba(250,204,21,.2)" />
//         <g transform={`translate(${x},${y})`}><path d="M0 0a3 3 0 0 1 6 0a6 6 0 0 1-12 0a10 10 0 0 1 20 0a14 14 0 0 1-28 0" fill="none" stroke="#ef4444" strokeWidth="3"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" /></path></g>
//       </svg>
//       <div className="flex gap-2">{['NOW', '6 HOURS', '12 HOURS'].map((l, i) => <button key={l} className={'choice flex-1 text-center ' + (t === i ? 'on' : '')} onClick={() => setT(i)}>{l}</button>)}</div>
//       <p className="text-xs text-mute">⚠ This is a simulated <b>prediction</b>, not a guaranteed outcome. Red spiral = storm · yellow dots = predicted track · red zone = area at risk.</p>
//       <button className="btn self-end" disabled={t < 2} onClick={onNext}>{t < 2 ? 'Check the 12-hour forecast' : 'Continue →'}</button>
//     </Panel>)
// }

// export default function Mission2() {
//   const [prog, save] = useProgress()
//   const [stage, setStage] = useState('brief')
//   const [orbit, setOrbit] = useState(null)
//   const [sensor, setSensor] = useState(null)
//   const [deployed, setDeployed] = useState(false)
//   const [night, setNight] = useState(false)
//   const [open, setOpen] = useState(false)
//   const [delayed, setDelayed] = useState(false)
//   const [attempt, setAttempt] = useState(0)
//   const timer = useRef(null)
//   const cb = useRef({})
//   cb.current = { onDeployed: () => setDeployed(true), onFlag: () => setOpen(true) }
//   useEffect(() => () => clearTimeout(timer.current), [])

//   const closeWeather = () => {
//     setOpen(false)
//     if (!night) timer.current = setTimeout(() => setNight(true), 2000)
//     else if (sensor === 0) setStage('fail')
//     else setStage('forecast')
//   }
//   const launch = () => { setDeployed(false); setNight(false); setOpen(false); setAttempt(a => a + 1); setStage('sky') }
//   const finish = () => { save({ m2: true }); setStage('complete') }

//   if (stage === 'brief') return <Panel title="Mission 02 · The Storm Sentinel"><p className="eyebrow">MISSION BRIEFING</p>
//     <p className="text-sm text-[#b2bdd1] leading-relaxed">A tropical storm is developing over the ocean near Isle of Solana. The nation has no weather satellite, so tracking it is difficult. As Director General of the National Space Agency, you will choose the satellite’s orbit and sensors.</p>
//     <blockquote className="border-l-2 border-mint pl-3 text-sm italic">“Director General, a potential tropical storm has been detected over the ocean. We need a reliable weather monitoring satellite to track its movement. Your decisions will determine the success of this mission.”</blockquote>
//     <button className="btn self-end" onClick={() => setStage('history')}>Continue →</button></Panel>

//   if (stage === 'history') return <Panel title="THE BEGINNING OF WEATHER SATELLITES"><p className="eyebrow">THE STORY OF TIROS-1</p>
//     <div className="grid md:grid-cols-2 gap-4">
//       <div className="border border-line rounded bg-black/40 min-h-[200px] flex items-center justify-center overflow-hidden">
//         <img src="/tiros1.jpeg" alt="Cutaway of the TIROS-1 satellite" className="w-full h-full object-contain" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block' }} />
//         <p style={{ display: 'none' }} className="text-xs text-mute p-4 text-center">Add the TIROS-1 cutaway photo as <code>/tiros1.jpeg</code></p>
//       </div>
//       <div className="text-sm text-[#b2bdd1] leading-relaxed flex flex-col gap-2">
//         <b className="text-ink">TIROS-1: The First Successful Weather Satellite</b>
//         <p>NASA launched TIROS-1 on April 1, 1960, from Cape Canaveral, Florida, aboard a Thor-Able II rocket. It tracked a large cyclonic system near Bermuda over four days and also observed tornado and jet-stream structures. On June 15, 1960, an electrical power failure ended useful transmissions.</p>
//         <p>Before it, scientists relied on ground stations. TIROS-1 proved satellites give a far broader view of Earth’s weather.</p>
//       </div></div>
//     <div className="flex gap-2"><Stat n="23,000" l="photos returned" /><Stat n="19,000" l="useful for weather" /><Stat n="2.5 mo" l="operational" /></div>
//     <p className="text-sm italic text-mint">“Imagine trying to understand a huge storm without seeing the whole picture. TIROS-1 changed that by allowing scientists to observe Earth’s clouds from space!”</p>
//     <div className="border-t border-line pt-3"><h3 className="font-display text-neon">NOW IT'S YOUR TURN!</h3><p className="text-sm text-[#b2bdd1] mt-1">Isle of Solana needs its own weather monitoring satellite. Design and launch one that can protect your nation’s people.</p></div>
//     <button className="btn self-end" onClick={() => setStage('decide')}>Continue to mission decisions</button></Panel>

//   if (stage === 'decide') return <Panel title="Director General Decisions">
//     <div><h3 className="font-display text-sm text-mint mb-2">DECISION 1 · ORBIT TRAJECTORY</h3><div className="grid sm:grid-cols-2 gap-2">
//       {[['equatorial', 'Equatorial Orbit', 'Cheaper, less fuel (Earth’s rotation helps an eastward launch). Covers mainly the equator and may miss storms far north or south.'], ['polar', 'Polar Orbit', 'More fuel and a complex launch. Passes over the poles so, as Earth rotates beneath it, it sees much more of the planet over time.']].map(([k, t, d]) => <button key={k} className={'choice ' + (orbit === k ? 'on' : '')} onClick={() => setOrbit(k)}><b>{t}</b><br /><span className="text-mute text-xs">{d}</span></button>)}</div></div>
//     <div><h3 className="font-display text-sm text-mint mb-2">DECISION 2 · SENSOR PACKAGE</h3><div className="grid sm:grid-cols-2 gap-2">
//       <button className={'choice ' + (sensor === 0 ? 'on' : '')} onClick={() => setSensor(0)}><b>Analog Visual Camera</b><br /><span className="text-mute text-xs">Light and cheap. Clear cloud images in daylight, but nothing in darkness.</span></button>
//       <button disabled={!prog.infrared} className={'choice disabled:opacity-40 disabled:cursor-not-allowed ' + (sensor === 1 ? 'on' : '')} onClick={() => setSensor(1)}><b>Infrared Thermal Sensors {!prog.infrared && '🔒'}</b><br /><span className="text-mute text-xs">{prog.infrared ? 'Heavier and costly, but reads cloud-top heat day and night.' : 'Upgrade locked — unlocked by your Mission 1 reward after your first attempt.'}</span></button></div></div>
//     {prog.infrared && <p className="text-xs text-mint">Tip: polar orbit gives wider coverage, and infrared enables night observation.</p>}
//     <button className="btn self-end" disabled={!orbit || sensor === null} onClick={launch}>Launch satellite</button></Panel>

//   if (stage === 'sky') return (
//     <section className="w-full max-w-4xl flex flex-col gap-2">
//       <div className="flex justify-between text-xs font-display"><span className="text-mint">{deployed ? 'SATELLITE DEPLOYMENT SUCCESSFUL' : 'LAUNCH SEQUENCE'}</span><span className={night ? 'text-violet' : 'text-yellow-300'}>{night ? '☾ NIGHT' : '☀ DAY'}</span></div>
//       <div className="relative rounded-lg border border-line overflow-hidden bg-gradient-to-b from-sky-500 to-blue-950">
//         <div className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-[1500ms]" style={{ opacity: night ? .8 : .45 }} />
//         <div className="relative"><OrbitGame key={attempt} orbit={orbit} cb={cb} /></div>
//         {deployed && !open && <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-white">Tap the red flag to open the Weather Control Center</p>}
//       </div>
//       {open && <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4"><div className="card w-full max-w-md flex flex-col gap-3 !bg-panel">
//         <h3 className="font-display font-bold">WEATHER CONTROL CENTER</h3>
//         {night && sensor === 0 ? <>
//           <p className="text-red-400 font-display">WEATHER DATA UNAVAILABLE</p>
//           <p className="text-sm text-[#b2bdd1]">Your satellite's visual camera cannot capture cloud images in darkness. Nighttime weather monitoring is unavailable.</p></> : <>
//           <p className="text-mint font-display text-sm">{night ? 'NIGHTTIME MONITORING ACTIVE' : 'WEATHER MONITORING ACTIVE'}</p>
//           {night && <p className="text-xs text-[#b2bdd1]">Your infrared sensors are detecting thermal patterns in darkness. Weather monitoring continues throughout the night.</p>}
//           <ul className="text-sm grid grid-cols-2 gap-x-3 gap-y-1"><li className="text-mute">Location</li><li>Isle of Solana</li><li className="text-mute">Cloud coverage</li><li>85%</li><li className="text-mute">Cloud temp</li><li>-65°C</li><li className="text-mute">Wind speed</li><li>110 km/h</li><li className="text-mute">Storm status</li><li>Potential Tropical Storm</li><li className="text-mute">Mode</li><li>{night ? 'Infrared' : sensor === 0 ? 'Visible light' : 'Visible + infrared'}</li></ul>
//           <p className="text-[10px] text-mute">Illustrative simulation values, not live measurements.</p></>}
//         <button className="btn self-end" onClick={closeWeather}>{night && sensor === 1 ? 'Continue' : 'Close'}</button></div></div>}
//     </section>)

//   if (stage === 'fail') return <Panel title="MISSION INCOMPLETE"><p className="text-red-400 font-display text-sm">Reason: Sensor limitation</p>
//     <p className="text-sm text-[#b2bdd1]">The satellite is still in orbit, but a visual camera cannot see in darkness, so the weather-monitoring objective was not achieved. This is a technology limit, not bad luck.</p>
//     <div className="flex flex-wrap gap-2 justify-end"><Link to="/missions" className="btn-ghost">Mission dashboard</Link><button className="btn-ghost" onClick={() => setStage('decide')}>Review decisions</button>
//       <button className="btn" onClick={() => { save({ infrared: true }); setSensor(null); setStage('reward') }}>Retry mission</button></div></Panel>

//   if (stage === 'reward') return <Panel title="MISSION 1 REWARD UNLOCKED"><p className="text-neon font-display">Technology Upgrade: Advanced Sensor Access</p>
//     <p className="text-sm text-[#b2bdd1]">Your previous mission achievements have unlocked new technology! You can now upgrade your weather satellite with infrared thermal sensors.</p>
//     <button className="btn self-end" onClick={() => setStage('decide')}>Back to decisions</button></Panel>

//   if (stage === 'forecast') return <Forecast onNext={() => setStage('warning')} />

//   if (stage === 'warning') return <Panel title="MISSION CONTROL ALERT"><p className="text-sm text-[#b2bdd1]">“A tropical storm may approach Isle of Solana. Weather monitoring data suggests that the island could be at risk.”</p>
//     {delayed && <p className="text-sm text-yellow-300">More observations are useful, but every hour of delay is an hour fewer for residents to prepare. Responsible agencies warn early and keep updating.</p>}
//     <div className="grid sm:grid-cols-2 gap-2"><button className="choice" onClick={finish}><b>Send Early Warning</b><br /><span className="text-xs text-mute">Notify the population and ready emergency teams.</span></button>
//       {!delayed && <button className="choice" onClick={() => setDelayed(true)}><b>Continue Monitoring</b><br /><span className="text-xs text-mute">Collect more data. Risks delaying the warning.</span></button>}</div></Panel>

//   const rows = [['Orbit Coverage', orbit === 'polar' ? 'Excellent' : 'Limited'], ['Fuel Consumption', orbit === 'polar' ? 'High' : 'Low'], ['Sensor Performance', 'Day + night'], ['Weather Monitoring', 'Successful'], ['Storm Tracking', 'Successful'], ['Early Warning', delayed ? 'Sent (delayed)' : 'Sent on time']]
//   return <Panel title="MISSION SUCCESSFUL!"><p className="text-mint font-display">The Storm Sentinel is Operational!</p>
//     <p className="text-sm text-[#b2bdd1]">Your nation now has its first weather satellite, watching storms day and night and supporting early warnings for Isle of Solana.</p>
//     <div className="border border-line rounded divide-y divide-line text-sm">{rows.map(([a, b]) => <div key={a} className="flex justify-between px-3 py-2"><span className="text-mute">{a}</span><b>{b}</b></div>)}</div>
//     <p className="text-sm">🏅 Badge: <b className="text-neon">Storm Sentinel</b> · +500 XP · Next mission unlocked</p>
//     <Link to="/missions" className="btn self-end">Back to Missions</Link></Panel>
// }
