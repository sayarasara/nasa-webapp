import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PixelDiagram from '../../components/PixelDiagram'
import RocketWire from '../../components/RocketWire'
import { runAscent } from '../../game/ascent'
import { useProgress } from '../../hooks/useProgress'
import MissionMedal from '../../components/MissionMedal'

const PHASES = [
  { key: 'nose', title: 'PHASE 1 · AERODYNAMICS', sub: 'Nosecone Shape', data: 'Historical records indicate that atmospheric friction at Mach speeds will rip unstable designs apart. Minimizing the cross-sectional drag coefficient is paramount when running on restricted engine fuel margins.', choices: ['Sharp-Pointed Cone', 'Blunt / Flat Hull', 'Square Grid Configuration'], correct: 0, notes: [['Sharp cone', 'Low drag at Mach 1+'], ['Flat hull', 'High drag, overheats'], ['Square grid', 'Turbulent, unstable']] },
  { key: 'payload', title: 'PHASE 2 · PAYLOAD & WEIGHT', sub: 'Chassis Material', data: 'Superpowers use exotic heavy shielding, but our tight budget dictates that every extra kilogram of deadweight exponentially increases fuel costs. We need structural integrity without overloading the thrust-to-weight ratio.', choices: ['Lightweight Composite Chassis', 'Heavy Titanium Core Shielding'], correct: 0, notes: [['Composite', 'Light, high T/W ratio'], ['Titanium', 'Heavy, fuel hungry']] },
  { key: 'engine', title: 'PHASE 3 · PROPULSION', sub: 'Fuel System', data: 'Solid boosters are cheap but cannot be throttled or shut off once lit. Liquid cryogenic fuel is volatile and complex, but lets our flight computer adjust thrust dynamically in the thinner upper atmosphere.', choices: ['Uncontrolled Solid Fuel Booster', 'Cryogenic Liquid Fuel Engine', 'Solar-Powered Ion Thruster'], correct: 1, notes: [['Solid booster', 'No throttle control'], ['Cryogenic liquid', 'Throttleable thrust'], ['Ion thruster', 'Far too weak for liftoff']] },
  { key: 'angle', title: 'PHASE 4 · TRAJECTORY', sub: 'Launch Angle', data: 'Our land sits near the equator. A perfectly vertical launch wastes fuel fighting gravity. A slight 85° eastward tilt uses Earth’s rotation and starts a gravity turn toward stable orbit; a steep 45° angle sends us into thick air too early.', choices: ['90° Straight Vertical Ascent', '85° Eastward Trajectory', '45° Sharp Atmospheric Angle'], correct: 1, notes: [['90° vertical', 'Wastes fuel on gravity'], ['85° eastward', 'Uses Earth rotation'], ['45° sharp', 'Burns in thick air']] },
]
const Wrap = ({ children }) => <section className="w-full max-w-4xl flex flex-col gap-4">{children}</section>
const judge = p => (p[0] !== 0 ? 'drag' : p[1] !== 0 ? 'weight' : p[2] !== 1 || p[3] !== 1 ? 'fuel' : 'win')

export default function Mission1() {
  const [progress, save] = useProgress()
  const [step, setStep] = useState(0)        // 0-3 phases, 4 inspect, 5 launch, 6 result
  const [reading, setReading] = useState(true)
  const [picks, setPicks] = useState([null, null, null, null])
  const [outcome, setOutcome] = useState(null)
  const box = useRef(null)
  const ph = PHASES[step]

  useEffect(() => {
    if (step !== 5) return
    const o = judge(picks)
    const game = runAscent(box.current, { outcome: o, picks }, () => { setOutcome(o); setStep(6); if (o === 'win') save({ m1: true, medals: { ...progress.medals, m1: 'gold' } }) })
    return () => game.destroy(true)
  }, [step]) // eslint-disable-line

  const pick = i => { const n = [...picks]; n[step] = i; setPicks(n) }
  const next = () => { if (step === 3) setStep(4); else { setStep(step + 1); setReading(true) } }
  const retry = () => { setStep(0); setReading(true); setOutcome(null) }
  if (step <= 3) return (
    <Wrap>
      <div className="card">
        <p className="eyebrow">MISSION 01 · LEAD ENGINEER'S LOG</p>
        {step === 0 && reading && <p className="text-sm text-[#b2bdd1] mt-2 leading-relaxed">Russia and America have raced far ahead in space for decades. Now it is time for our land to build its own space program. We are a new nation with a severe budget deficit—<b className="text-neon">we cannot afford mistakes</b>. You have one attempt to choose the right technology.</p>}
        <h2 className="font-display font-bold text-xl mt-3">{ph.title}</h2>
        <p className="text-mute text-xs">{ph.sub} · {step + 1}/4</p>
        <div className="grid md:grid-cols-2 gap-5 mt-4 items-center">
          <div className="flex justify-center"><PixelDiagram kind={ph.key === 'nose' ? 'nose' : ph.key} /></div>
          <div>
            <p className="text-sm text-[#b2bdd1] leading-relaxed">{ph.data}</p>
            {reading
              ? <button className="btn mt-4" onClick={() => setReading(false)}>Next →</button>
              : <div className="flex flex-col gap-2 mt-4">{ph.choices.map((c, i) => <button key={c} className={'choice ' + (picks[step] === i ? 'on' : '')} onClick={() => pick(i)}>{i + 1}. {c}</button>)}</div>}
          </div>
        </div>
        {!reading && <div className="flex justify-end mt-4"><button className="btn" disabled={picks[step] === null} onClick={next}>{step === 3 ? 'Lock in & Inspect' : 'Lock in →'}</button></div>}
      </div>
    </Wrap>)

  if (step === 4) return (
    <Wrap><div className="card flex flex-col items-center gap-3">
      <p className="eyebrow">3D INSPECTION WINDOW</p>
      <RocketWire picks={picks} notes={PHASES.map((p, i) => p.notes[picks[i]])} />
      <div className="flex gap-3"><button className="btn-ghost" onClick={retry}>Re-configure</button><button className="btn" onClick={() => setStep(5)}>Confirm & Ignition</button></div>
    </div></Wrap>)

  if (step === 5) return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div ref={box} className="pixelated absolute inset-0" />
      <button className="btn-ghost absolute top-3 right-3 z-[70]" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.())}>⛶ Fullscreen</button>
    </div>)

  const win = outcome === 'win'
  return (
    <Wrap><div className="card text-center flex flex-col gap-3 items-center">
      {win ? <>
        <h2 className="font-display font-black text-3xl text-mint">MISSION SUCCESSFUL!</h2>
        <p className="text-[#b2bdd1] max-w-xl">Our land has joined the stars. Despite our limited financial beginnings, our space program is now fully funded and recognized globally!</p>
        <MissionMedal tier={progress.medals?.m1 || 'gold'} title="Kármán Breach" score={100} />
        <Link to="/missions" className="btn">Continue to Missions →</Link>
      </> : <>
        <h2 className="font-display font-black text-2xl text-red-400">MISSION FAILED</h2>
        <div className="w-full max-w-lg text-left font-mono text-sm p-4 border border-green-500/50 rounded bg-black" style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,.12) 1px,transparent 1px)', backgroundSize: '16px 16px' }}>
          <p className="text-green-400 mb-2">&gt; DIAGNOSTIC GRID · BUDGET-CONSTRAINED FLIGHT</p>
          {PHASES.map((p, i) => <p key={p.key} className={picks[i] === p.correct ? 'text-green-400' : 'text-red-400'}>{picks[i] === p.correct ? '[ OK ]' : '[FAIL]'} {p.sub}: {p.choices[picks[i]]}</p>)}
        </div>
        <button className="btn" onClick={retry}>Return to configuration</button>
      </>}
    </div></Wrap>)
}
