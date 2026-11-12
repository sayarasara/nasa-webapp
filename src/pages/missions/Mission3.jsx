import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../../hooks/useProgress'
import MissionMedal from '../../components/MissionMedal'
import { bestMedal, medalForScore } from '../../game/medals'

/* Mission 03 · Project Red Horizon (Mars Rover Deployment)
   Images live in /public: phase01.jpeg, phase02.jpeg, phase03.jpeg, phase04.jpeg */

const IMG = { p1: '/phase01.jpeg', p2: '/phase02.jpeg', p3: '/phase03.jpeg', p4: '/phase04.jpeg' }

const START = { integrity: 100, power: 100, propellant: 100, mobility: 100, science: 0, budget: 100 }
const HUD = [
  ['integrity', 'Hull integrity', '%'], ['power', 'Power', '%'], ['propellant', 'Propellant', '%'],
  ['mobility', 'Mobility', '%'], ['science', 'Science', 'pts'], ['budget', 'Budget', '%'],
]
const RATING = {
  optimal: { label: 'OPTIMAL', pts: 100, cls: 'text-mint' },
  acceptable: { label: 'ACCEPTABLE', pts: 60, cls: 'text-yellow-300' },
  poor: { label: 'HIGH RISK', pts: 20, cls: 'text-red-400' },
}

const STAGES = [
  {
    id: "phase1",
    tag: "Phase 1",
    short: "Transit",
    title: "Earth to Mars transit",
    cardTitle: "NASA Mission Telemetry — Cruise Stage & Aeroshell",
    image: {
      src: IMG.p1,
      alt: "Mars approaching the spacecraft, showing the ring-shaped solar-powered cruise stage and the white aeroshell capsule.",
      caption:
        "The ring-shaped cruise stage (solar arrays, thrusters, antennas) and the white aeroshell that will protect the rover through the interplanetary journey and Mars entry.",
    },
    telemetry: [
      ["Launch mass (spacecraft)", "≈ 3,650 kg"],
      ["Rover mass", "≈ 1,025 kg"],
      ["Earth–Mars launch window", "every ≈ 26 months"],
      ["Mars orbital radius", "1.524 AU"],
      ["Hohmann transfer time", "≈ 259 days"],
      ["Launch energy (C3)", "≈ 14 km²/s²"],
    ],
    brief:
      "The cruise stage supplies power, propulsion, and communications on the way to Mars. The aeroshell holds the rover and descent stage. Your transfer trajectory sets the fuel bill, the cruise duration, and the entry conditions at Mars.",
    calc: {
      title: "Transfer-time calculation",
      lines: [
        "Semi-major axis a = (1 AU + 1.524 AU) / 2 = 1.262 AU",
        "Kepler: T = a^1.5 = 1.262^1.5 ≈ 1.418 years (full ellipse)",
        "Transfer = T / 2 ≈ 0.709 years ≈ 259 days",
      ],
    },
    question: "Select the transfer trajectory for the cruise stage.",
    options: [
      {
        id: "a",
        label: "Type-I Hohmann-class transfer (~259 days)",
        detail: "Minimum-energy ellipse, launched in the optimal window.",
        rating: "optimal",
        effects: { propellant: -5, budget: -5, power: -3 },
        feedback:
          "The minimum-energy ellipse needs the least departure energy (C3 ≈ 14 km²/s²) and gives a moderate arrival speed, so the aeroshell and entry system see manageable loads. About 7 months of cruise is well within the solar-array and thermal design of the cruise stage.",
      },
      {
        id: "b",
        label: "Fast Type-II transfer (~180 days)",
        detail: "Shorter cruise with a higher-energy departure.",
        rating: "poor",
        effects: { propellant: -25, budget: -15, integrity: -8 },
        feedback:
          "Cutting about 79 days of cruise requires a much higher departure energy and a larger heavier-lift budget, and arrival speed at Mars rises. A faster arrival means higher entry heating and tighter margins for the aeroshell, for a benefit the science mission does not need.",
      },
      {
        id: "c",
        label: "Low-thrust solar-electric transfer (~2 years)",
        detail: "Efficient propellant use, very long spiral-style cruise.",
        rating: "acceptable",
        effects: { propellant: 0, budget: -20, power: -15, integrity: -3 },
        feedback:
          "Electric propulsion saves propellant mass, but a two-year cruise extends operations costs, ages the arrays, and exposes the spacecraft to the deep-space radiation environment for far longer. It works, but it is not efficient for this mission.",
      },
    ],
  },
  {
    id: "phase2",
    tag: "Phase 2",
    short: "Jezero",
    title: "Jezero Crater & chassis engineering",
    cardTitle: "NASA Mission Telemetry — Jezero Crater Landing Site",
    image: {
      src: IMG.p2,
      alt: "Aerial view of the Mars Perseverance landing site in Jezero Crater, with the landing zone marked by a white circle (4.8 mi x 4.1 mi, 7.7 km x 6.6 km).",
      caption:
        "Jezero Crater from orbit. The white circle marks the 7.7 km × 6.6 km landing zone beside an ancient river delta.",
    },
    telemetry: [
      ["Landing zone (ellipse)", "7.7 km × 6.6 km"],
      ["Crater diameter", "≈ 45 km"],
      ["Mars surface gravity", "3.71 m/s²"],
      ["Rover mass", "≈ 1,025 kg"],
      ["Wheel count", "6 (rocker-bogie)"],
      ["Terrain", "sharp rocks, sand ripples, delta deposits"],
    ],
    brief:
      "Jezero once held a lake and its delta is a prime target for signs of ancient life. The terrain is rocky and abrasive, so the wheels must carry the rover's weight and resist punctures and tearing over many kilometres.",
    calc: {
      title: "Wheel load calculation",
      lines: [
        "Weight on Mars = 1,025 kg × 3.71 m/s² ≈ 3,803 N",
        "Load per wheel (6 wheels) ≈ 3,803 / 6 ≈ 634 N",
        "Each wheel must handle this load plus impact shock on rocks",
      ],
    },
    question: "Select the wheel configuration for the rover chassis.",
    options: [
      {
        id: "a",
        label: "6 rocker-bogie wheels, ~52.5 cm machined aluminum, thicker skin, 48 chevron cleats",
        detail: "Wider, more rugged wheels with titanium spokes.",
        rating: "optimal",
        effects: { mobility: -2, budget: -5, integrity: 0, science: 10 },
        feedback:
          "Six wheels on a rocker-bogie suspension keep all wheels in contact over uneven ground and spread the ≈ 634 N load per wheel. A thicker skin with more, shallower cleats resists the tearing and punctures that sharp Jezero rocks cause, and keeps traction on sand.",
      },
      {
        id: "b",
        label: "6 thin-skin aluminum wheels, 24 cleats (earlier-generation design)",
        detail: "Lighter, proven on a previous rover.",
        rating: "acceptable",
        effects: { mobility: -15, budget: 0, integrity: -3, science: 5 },
        feedback:
          "Saves a little mass, but thin skins are more vulnerable to punctures and cracks on sharp rocks. The rover can still operate, but wheel damage will limit how far you can drive and which routes you can take.",
      },
      {
        id: "c",
        label: "4 rigid lightweight wheels, no suspension linkage",
        detail: "Lowest mass and simplest build.",
        rating: "poor",
        effects: { mobility: -35, integrity: -8, science: 0, budget: 3 },
        feedback:
          "Without a rocker-bogie linkage, a wheel can lose contact on uneven terrain, and with four wheels the load per wheel rises to ≈ 951 N. This risks high-centering and tipping in a boulder field, which is a mission-ending failure far from help.",
      },
    ],
  },
  {
    id: "phase3",
    tag: "Phase 3",
    short: "Payload",
    title: "Science payload & instruments",
    cardTitle: "NASA Mission Telemetry — Rover Imaging System (Mastcam-Z)",
    image: {
      src: IMG.p3,
      alt: "Perseverance rover mast head with the two Mastcam-Z cameras highlighted.",
      caption:
        "The rover's mast head. The two circled Mastcam-Z cameras act as the rover's eyes: stereo, zoomable, color imaging.",
    },
    telemetry: [
      ["Science instruments", "7 on the rover"],
      ["Instrument payload mass", "≈ 43 kg"],
      ["Mastcam-Z cameras", "2 (stereo pair)"],
      ["Mastcam-Z stereo baseline", "≈ 24 cm"],
      ["Mastcam-Z zoom range", "≈ 26–110 mm"],
      ["Primary science goal", "seek signs of ancient life, cache samples"],
    ],
    brief:
      "Mass and power are limited, so you cannot fly everything. The instruments you choose decide whether the rover can find biosignatures, collect samples worth returning to Earth, or support future human exploration.",
    calc: {
      title: "Stereo imaging principle",
      lines: [
        "Two cameras 24 cm apart see the same rock from slightly different angles",
        "The shift (parallax) between the two images gives distance and 3D shape",
        "Zoom lets the team pick targets for close-up instruments before driving",
      ],
    },
    question: "Select the science payload package.",
    options: [
      {
        id: "a",
        label: "Astrobiology suite: Mastcam-Z + SuperCam + SHERLOC/WATSON + PIXL + sample caching",
        detail: "Imaging, remote chemistry, fine-scale mineral and organic mapping.",
        rating: "optimal",
        effects: { science: 60, power: -12, budget: -10 },
        feedback:
          "This matches the mission goal. Mastcam-Z finds targets, SuperCam analyzes rock from a distance, SHERLOC and PIXL map minerals and organics at close range, and the caching system preserves the best samples for return to Earth.",
      },
      {
        id: "b",
        label: "Resource suite: MOXIE + RIMFAX + MEDA + Mastcam-Z",
        detail: "Oxygen production, subsurface radar, and weather monitoring.",
        rating: "acceptable",
        effects: { science: 35, power: -18, budget: -8 },
        feedback:
          "Valuable for preparing human missions (oxygen from CO₂, subsurface layering, weather), but without close-up chemistry and sample caching the rover cannot answer the central question about ancient life at Jezero.",
      },
      {
        id: "c",
        label: "Camera-only package: Mastcam-Z + navigation + hazard cameras",
        detail: "Lowest mass and power draw.",
        rating: "poor",
        effects: { science: 12, power: 0, budget: 5 },
        feedback:
          "Great pictures but no chemical or mineral analysis. Cameras can show where life might have lived, but cannot test for it, so the science return is very low for a billion-dollar mission.",
      },
    ],
  },
  {
    id: "hazardA",
    tag: "Hazard A",
    short: "Solar storm",
    title: "Solar particle event",
    cardTitle: "NASA / NOAA Radiation Telemetry — Solar Flare & CME",
    image: {
      src: IMG.p4,
      alt: "Illustration of a solar flare and coronal mass ejection showing energetic protons, ions, and magnetic field lines reaching a spacecraft.",
      caption:
        "A flare and coronal mass ejection (CME) launch energetic protons and ions along magnetic field lines toward spacecraft in the inner solar system.",
    },
    telemetry: [
      ["Event", "X-class flare + Earth-directed CME"],
      ["NOAA radiation scale", "S3 (strong)"],
      ["Proton flux (≥10 MeV)", "≈ 1,000 pfu"],
      ["Particle arrival", "tens of minutes to hours"],
      ["CME transit to Mars distance", "≈ 2–4 days"],
      ["Rover computer", "radiation-hardened"],
    ],
    brief:
      "Energetic protons can flip memory bits, degrade electronics, and damage solar cells. The spacecraft has a few hours to react. Ground teams can send one command sequence.",
    calc: {
      title: "Warning-time estimate",
      lines: [
        "Energetic protons travel at a large fraction of light speed",
        "Typical arrival: 20 min to a few hours after the flare",
        "Commands to the spacecraft take minutes one-way, so decide quickly",
      ],
    },
    question: "Select the response to the radiation event.",
    options: [
      {
        id: "a",
        label: "Command safe mode: shut down non-essential electronics and ride out the storm",
        detail: "Minimal power state, orient for best protection, resume after flux drops.",
        rating: "optimal",
        effects: { integrity: -2, power: -5, science: 5 },
        feedback:
          "Safe mode reduces the number of active circuits that can suffer a radiation upset, keeps core systems alive, and lets the team verify health when the flux subsides. You lose a few hours of operations, but you keep the mission.",
      },
      {
        id: "b",
        label: "Continue nominal operations and rely on the hardened computer",
        detail: "Keep all systems running to maintain the schedule.",
        rating: "poor",
        effects: { integrity: -22, power: -10, science: -5 },
        feedback:
          "Hardened electronics tolerate a lot, but not unlimited particle fluxes. Running everything at S3 increases the chance of memory corruption and sensor damage. A schedule saved here could cost the mission later.",
      },
      {
        id: "c",
        label: "Fire thrusters to try to dodge the particle stream",
        detail: "Maneuver off the magnetic field line.",
        rating: "poor",
        effects: { integrity: -12, propellant: -20, power: -5 },
        feedback:
          "You cannot dodge a particle storm: it spreads over a huge region and arrives within hours, so no maneuver can leave it. The burn wastes propellant that you need for trajectory correction before Mars entry.",
      },
    ],
  },
  {
    id: "hazardB",
    tag: "Hazard B",
    short: "Entry",
    title: "Martian atmospheric entry",
    cardTitle: "NASA EDL Telemetry — Entry, Descent & Landing",
    image: null,
    telemetry: [
      ["Entry interface altitude", "≈ 125 km"],
      ["Entry speed", "≈ 5.4 km/s (≈ 19,500 km/h)"],
      ["Peak heat shield temperature", "≈ 1,300 °C"],
      ["Parachute diameter", "≈ 21.5 m"],
      ["Parachute deploy", "≈ Mach 1.7, ≈ 11 km altitude"],
      ["Entry-to-touchdown time", "≈ 7 minutes"],
      ["Landing zone", "7.7 km × 6.6 km"],
    ],
    brief:
      "Radio signals take minutes to reach Earth, so the rover lands autonomously. The Martian atmosphere is thin: too thin to slow you with only a parachute, but thick enough to heat the aeroshell to extreme temperatures. The moment you deploy the parachute decides how precisely you land.",
    calc: {
      title: "Why timing matters",
      lines: [
        "Entry speed 5.4 km/s ≈ 19,500 km/h, decelerating to a few m/s at touchdown",
        "Small errors in entry state spread into many km of landing error",
        "Landing zone is only 7.7 km × 6.6 km, with hazardous rocks and cliffs nearby",
      ],
    },
    question: "Select how the parachute deployment will be triggered.",
    options: [
      {
        id: "a",
        label: "Range Trigger: deploy when the estimated distance to the target reaches a threshold",
        detail: "Deployment time adapts to where the spacecraft actually is.",
        rating: "optimal",
        effects: { integrity: 0, science: 25, budget: -3 },
        feedback:
          "A range trigger uses navigation to deploy when the spacecraft is at the right distance from the target, shrinking the landing ellipse. Combined with terrain-relative navigation, it lets the rover land safely in the 7.7 km × 6.6 km zone near Jezero's delta.",
      },
      {
        id: "b",
        label: "Velocity trigger: deploy when speed falls below a threshold",
        detail: "Protects the parachute from overspeed, ignores position.",
        rating: "acceptable",
        effects: { integrity: -4, science: 8 },
        feedback:
          "Safe for the parachute, but it ignores position error, so the landing ellipse stays large. It would not guarantee a landing away from Jezero's hazardous terrain.",
      },
      {
        id: "c",
        label: "Fixed timer: deploy a set time after entry begins",
        detail: "Simplest approach, no extra navigation logic.",
        rating: "poor",
        effects: { integrity: -20, science: -10 },
        feedback:
          "A fixed timer cannot account for variations in atmosphere, entry angle, or drift. The spacecraft could deploy too early or late, increasing landing dispersion and the chance of landing in unsafe terrain.",
      },
    ],
  },
];

const clamp = v => Math.max(0, Math.min(100, v))
const apply = (s, fx) => { const n = { ...s }; Object.entries(fx).forEach(([k, d]) => { n[k] = k === 'science' ? Math.max(0, n[k] + d) : clamp(n[k] + d) }); return n }

const Panel = ({ children, title }) => <div className="card w-full max-w-3xl flex flex-col gap-3">{title && <h2 className="font-display font-bold text-xl">{title}</h2>}{children}</div>

function Hud({ status, delta }) {
  return (
    <div className="card w-full max-w-3xl !p-3">
      <p className="eyebrow mb-2">ROVER STATUS</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {HUD.map(([k, l, u]) => {
          const v = status[k], d = delta[k] || 0
          const bar = k === 'science' ? 'bg-neon' : v > 60 ? 'bg-mint' : v > 30 ? 'bg-yellow-400' : 'bg-red-500'
          return (
            <div key={k}>
              <div className="flex justify-between text-xs"><span className="text-mute">{l}</span>
                <b>{v}{u}{d !== 0 && <span className={d > 0 ? 'text-mint' : 'text-red-400'}> {d > 0 ? '+' : ''}{d}</span>}</b></div>
              <div className="h-1.5 rounded bg-line mt-1 overflow-hidden"><div className={'h-full transition-all duration-700 ' + bar} style={{ width: (k === 'science' ? Math.min(100, v) : v) + '%' }} /></div>
            </div>)
        })}
      </div>
    </div>)
}

function StageImage({ image }) {
  const [bad, setBad] = useState(false)
  return (
    <figure className="border border-line rounded bg-black/40 overflow-hidden">
      <div className="flex justify-center p-2">
        {bad
          ? <p className="text-xs text-mute p-6 text-center">Add the image as <code>{image.src}</code> in the public folder</p>
          : <img src={image.src} alt={image.alt} loading="eager" onError={() => setBad(true)} className="block h-auto w-auto max-w-full max-h-[420px]" />}
      </div>
      <figcaption className="text-xs text-mute text-center px-3 pb-3">{image.caption}</figcaption>
    </figure>)
}

function Telemetry({ s }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center gap-2">
        <h3 className="font-display text-sm text-mint">{s.cardTitle}</h3>
        <span className="font-display text-[9px] tracking-widest text-mute shrink-0">{s.tag.toUpperCase()}</span>
      </div>
      {s.image && <StageImage image={s.image} />}
      <div className="grid sm:grid-cols-2 border border-line rounded divide-y sm:divide-y-0 divide-line text-sm">
        {s.telemetry.map(([a, b]) => <div key={a} className="flex justify-between gap-3 px-3 py-2 sm:border-b sm:border-line"><span className="text-mute">{a}</span><b className="text-right">{b}</b></div>)}
      </div>
      <p className="text-sm text-[#b2bdd1] leading-relaxed">{s.brief}</p>
      <div className="border border-line rounded p-3 bg-black/30">
        <p className="font-display text-xs text-neon mb-1">{s.calc.title}</p>
        {s.calc.lines.map(l => <p key={l} className="font-mono text-xs text-[#b2bdd1]">&gt; {l}</p>)}
      </div>
    </div>)
}

export default function Mission3() {
  const [progress, save] = useProgress()
  const [step, setStep] = useState(-1)       // -1 briefing, 0-4 stages, 5 result
  const [sel, setSel] = useState(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState(START)
  const [delta, setDelta] = useState({})
  const [log, setLog] = useState([])
  const s = STAGES[step]

  const lockIn = () => {
    const o = s.options[sel]
    setLocked(true); setDelta(o.effects); setStatus(v => apply(v, o.effects)); setLog(l => [...l, { s, o }])
  }
  const next = () => {
    const done = step === STAGES.length - 1
    if (done) {
      const score = Math.round(log.reduce((a, h) => a + RATING[h.o.rating].pts, 0) / STAGES.length)
      if (status.integrity > 0 && status.mobility > 0 && score >= 60) {
        const medal = medalForScore(score)
        save({ m3: true, medals: { ...progress.medals, m3: bestMedal(progress.medals?.m3, medal) } })
      }
    }
    setStep(step + 1); setSel(null); setLocked(false); setDelta({})
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }
  const retry = () => { setStep(-1); setSel(null); setLocked(false); setStatus(START); setDelta({}); setLog([]) }

  if (step === -1) return (
    <Panel title="Mission 03 · Project Red Horizon"><p className="eyebrow">MISSION BRIEFING</p>
      <p className="text-sm text-[#b2bdd1] leading-relaxed">With a weather satellite watching over Isle of Solana, your nation is ready for its boldest goal yet: a rover on Mars. You will choose the transfer trajectory, the wheels, and the science instruments, then survive a solar storm and the final seven minutes of entry.</p>
      <blockquote className="border-l-2 border-mint pl-3 text-sm italic">“Director General, the launch window is open. Every decision trades mass, energy, risk, and science. Choose carefully — the rover cannot be repaired once it leaves Earth.”</blockquote>
      <button className="btn self-end" onClick={() => setStep(0)}>Begin mission →</button></Panel>)

  if (step === STAGES.length) {
    const score = Math.round(log.reduce((a, h) => a + RATING[h.o.rating].pts, 0) / STAGES.length)
    const win = status.integrity > 0 && status.mobility > 0 && score >= 60
    return (
      <Panel title={win ? 'MISSION SUCCESSFUL!' : 'MISSION FAILED'}>
        {win
          ? <><p className="text-mint font-display">The rover is operational in Jezero Crater!</p>
            <p className="text-sm text-[#b2bdd1]">Your rover survived the journey and is beginning its search for signs of ancient life on Mars.</p></>
          : <p className="text-sm text-[#b2bdd1]">The mission did not meet its safety or science goals. Review the diagnostic grid and try a different set of trade-offs.</p>}
        <div className="w-full text-left font-mono text-sm p-4 border border-green-500/50 rounded bg-black" style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,.12) 1px,transparent 1px)', backgroundSize: '16px 16px' }}>
          <p className="text-green-400 mb-2">&gt; DIAGNOSTIC GRID · DECISION SCORE {score}/100</p>
          {log.map(({ s: st, o }) => <p key={st.id} className={o.rating === 'optimal' ? 'text-green-400' : o.rating === 'acceptable' ? 'text-yellow-300' : 'text-red-400'}>[{o.rating === 'optimal' ? ' OK ' : o.rating === 'acceptable' ? 'WARN' : 'FAIL'}] {st.tag}: {o.label}</p>)}
        </div>
        {win && <MissionMedal tier={progress.medals?.m3 || medalForScore(score)} title="Red Horizon Pathfinder" score={score} />}
        <div className="flex flex-wrap gap-2 justify-end">
          <button className="btn-ghost" onClick={retry}>{win ? 'Replay' : 'Return to mission start'}</button>
          {win && <Link to="/missions" className="btn">Back to Missions</Link>}
        </div>
      </Panel>)
  }

  const chosen = locked ? s.options[sel] : null
  const best = s.options.find(o => o.rating === 'optimal')
  return (
    <section className="w-full max-w-3xl flex flex-col gap-3 items-center">
      <Hud status={status} delta={delta} />
      <Panel title={s.title}>
        <p className="eyebrow">MISSION 03 · {s.tag.toUpperCase()} · {step + 1}/{STAGES.length}</p>
        <Telemetry s={s} />
        <div>
          <h3 className="font-display text-sm text-mint mb-2">{s.question}</h3>
          <div className="flex flex-col gap-2">
            {s.options.map((o, i) => (
              <button key={o.id} disabled={locked} className={'choice disabled:cursor-not-allowed ' + (sel === i ? 'on' : locked ? 'opacity-60' : '')} onClick={() => setSel(i)}>
                <div className="flex justify-between gap-2"><b>{i + 1}. {o.label}</b>{locked && <span className={'font-display text-[9px] tracking-widest shrink-0 ' + RATING[o.rating].cls}>{RATING[o.rating].label}</span>}</div>
                <span className="text-mute text-xs">{o.detail}</span>
              </button>))}
          </div>
        </div>
        {!locked && <div className="flex justify-end"><button className="btn" disabled={sel === null} onClick={lockIn}>Lock in →</button></div>}
        {locked && (
          <div className="border-t border-line pt-3 flex flex-col gap-2">
            <p className={'font-display text-sm ' + RATING[chosen.rating].cls}>DECISION REVIEW · {RATING[chosen.rating].label}</p>
            <p className="text-sm text-[#b2bdd1] leading-relaxed">{chosen.feedback}</p>
            {chosen.rating !== 'optimal' && <p className="text-xs text-mint">Recommended: <b>{best.label}</b>. {best.feedback}</p>}
            <button className="btn self-end" onClick={next}>{step === STAGES.length - 1 ? 'View mission result' : 'Continue →'}</button>
          </div>)}
      </Panel>
    </section>)
}
