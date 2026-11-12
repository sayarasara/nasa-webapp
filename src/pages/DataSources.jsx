import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const CATS = [
  { id: 'all', label: 'All sources', icon: '✦' },
  { id: 'history', label: 'Early Satellites', icon: '🛰' },
  { id: 'data', label: 'Planetary Data', icon: '🪐' },
  { id: 'mars', label: 'Mars 2020', icon: '🔴' },
  { id: 'weather', label: 'Space Weather', icon: '☀' },
]

const MISSIONS = {
  1: 'The Kármán Breach',
  2: 'The Storm Sentinel',
  3: 'Project Red Horizon',
}

const SOURCES = [
  { cat: 'history', title: 'Explorer 1', by: 'NASA Science', desc: 'Mission page for America’s first satellite, launched in 1958 and the start of the space-science era.', url: 'https://science.nasa.gov/mission/explorer-1/', missions: [1] },
  { cat: 'history', title: 'Launch of TIROS-1, the World’s First Weather Satellite', by: 'NASA History · Goddard', desc: 'The story of the first successful weather satellite, which proved that clouds and storms can be watched from orbit.', url: 'https://www.nasa.gov/history/launch-of-tiros-1-worlds-1st-weather-satellite-this-week-in-goddard-history-march-31-april-6/', missions: [2] },
  { cat: 'data', title: 'Planetary Fact Sheet', by: 'NASA NSSDC', desc: 'Reference tables for planetary data such as surface gravity, orbital radius, and day length.', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', missions: [3] },
  { cat: 'data', title: 'JPL Horizons System', by: 'NASA JPL · Solar System Dynamics', desc: 'The ephemeris tool used to find where planets and spacecraft are at any moment, the basis of transfer planning.', url: 'https://ssd.jpl.nasa.gov/horizons/', missions: [3] },
  { cat: 'mars', title: 'Mars 2020 Landing — Quick Facts', by: 'NASA JPL · Press Kit', desc: 'Key numbers for Perseverance’s journey, entry, descent and landing at Jezero Crater.', url: 'https://www.jpl.nasa.gov/news/press_kits/mars_2020/landing/quick_facts', missions: [3] },
  { cat: 'mars', title: 'First Radiation Measurements from the Surface of Mars', by: 'Southwest Research Institute', desc: 'Press release on the first radiation measurements taken on the Martian surface, important for protecting future crews.', url: 'https://www.swri.org/press-release/swri-scientists-publish-first-radiation-measurements-surface-mars', missions: [3] },
  { cat: 'mars', title: 'Team Assessing SHERLOC Instrument on Perseverance (2024)', by: 'NASA · Mars 2020', desc: 'How the SHERLOC instrument searches for organics and minerals, and how engineers handled a stuck dust cover.', url: 'https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/team-assessing-sherloc-instrument-on-nasas-perseverance-rover', missions: [3] },
  { cat: 'mars', title: 'The Nuclear Battery Aboard Perseverance (MMRTG)', by: 'POWER Magazine', desc: 'Explains the radioisotope power system that keeps the rover running through dust, night and winter.', url: 'https://www.powermag.com/the-nuclear-battery-aboard-perseverance-the-next-gen-mars-rover', missions: [3] },
  { cat: 'weather', title: 'NOAA Space Weather Scales — Explanation', by: 'NOAA · Space Weather Prediction Center', desc: 'The official G, S and R scales used to rate geomagnetic storms, solar radiation storms and radio blackouts.', url: 'https://www.spaceweather.gov/noaa-scales-explanation', missions: [3] },
  { cat: 'weather', title: 'Solar Radiation Storm', by: 'NOAA · Space Weather Prediction Center', desc: 'Overview of how energetic protons from flares and coronal mass ejections affect spacecraft and astronauts.', url: 'https://www.spaceweather.gov/phenomena/solar-radiation-storm', missions: [3] },
].map((s, i) => ({ ...s, n: i + 1, host: new URL(s.url).hostname.replace('www.', '') }))

const Stat = ({ n, l }) => <div className="flex-1 text-center border border-line rounded p-3"><b className="font-display text-2xl text-neon block">{n}</b><span className="text-xs text-mute">{l}</span></div>

function SourceCard({ s }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(s.url); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { window.prompt('Copy this link:', s.url) }
  }
  const cat = CATS.find(c => c.id === s.cat)
  return (
    <article className="card flex flex-col gap-2 hover:border-neon transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[9px] tracking-widest text-mint">SOURCE {String(s.n).padStart(2, '0')} · {cat.icon} {cat.label.toUpperCase()}</span>
      </div>
      <h3 className="font-display font-bold text-lg leading-snug">{s.title}</h3>
      <p className="text-xs text-neon">{s.by}</p>
      <p className="text-sm text-mute flex-1">{s.desc}</p>
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-mute">
        <span>USED IN</span>
        {s.missions.map(m => <Link key={m} to={'/missions/' + m} className="border border-line rounded px-2 py-0.5 hover:text-neon hover:border-neon transition-colors">Mission 0{m} · {MISSIONS[m]}</Link>)}
      </div>
      <p className="text-[11px] text-mute font-mono truncate" title={s.url}>{s.host}</p>
      <div className="flex gap-2 justify-end mt-1">
        <button className="btn-ghost" onClick={copy} aria-live="polite">{copied ? '✓ Copied' : 'Copy link'}</button>
        <a className="btn" href={s.url} target="_blank" rel="noopener noreferrer">Open source ↗</a>
      </div>
    </article>)
}

export default function DataSources() {
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')

  const counts = useMemo(() => Object.fromEntries(CATS.map(c => [c.id, c.id === 'all' ? SOURCES.length : SOURCES.filter(s => s.cat === c.id).length])), [])
  const publishers = useMemo(() => new Set(SOURCES.map(s => s.by.split(' · ')[0])).size, [])
  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return SOURCES.filter(s => (cat === 'all' || s.cat === cat) && (!t || [s.title, s.by, s.desc, s.host].join(' ').toLowerCase().includes(t)))
  }, [cat, q])

  return (
    <section className="w-full max-w-5xl flex flex-col items-center gap-3 text-center">
      <div className="eyebrow">— DATA SOURCES —</div>
      <h2 className="font-display font-black text-4xl md:text-5xl">Where our <span className="text-neon">Facts</span> come from</h2>
      <p className="text-sm text-[#b2bdd1] max-w-2xl leading-relaxed">Every number in the missions is based on real research. Explore the NASA, JPL and NOAA references behind the rockets, satellites, and the Mars rover, and check the facts yourself.</p>

      <div className="flex gap-2 w-full max-w-2xl mt-2">
        <Stat n={SOURCES.length} l="sources" />
        <Stat n={CATS.length - 1} l="topics" />
        <Stat n={publishers} l="publishers" />
      </div>

      <div className="w-full max-w-2xl mt-2 relative">
        <input
          type="search" value={q} onChange={e => setQ(e.target.value)} aria-label="Search data sources"
          placeholder="Search sources, e.g. radiation, TIROS, Horizons…"
          className="w-full rounded border border-line bg-black/30 px-4 py-3 text-sm outline-none focus:border-neon transition-colors"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Source topics">
        {CATS.map(c => (
          <button key={c.id} role="tab" aria-selected={cat === c.id} className={'choice !w-auto text-center ' + (cat === c.id ? 'on' : '')} onClick={() => setCat(c.id)}>
            {c.icon} {c.label} <span className="text-mute text-xs">({counts[c.id]})</span>
          </button>))}
      </div>

      <p className="text-xs text-mute" aria-live="polite">Showing {list.length} of {SOURCES.length} sources</p>

      {list.length === 0
        ? <div className="card w-full max-w-md flex flex-col items-center gap-2 mt-2">
            <p className="font-display text-neon">NO SIGNAL</p>
            <p className="text-sm text-mute">No source matches “{q}”. Try a different word or topic.</p>
            <button className="btn-ghost" onClick={() => { setQ(''); setCat('all') }}>Reset filters</button>
          </div>
        : <div className="grid md:grid-cols-2 gap-4 w-full mt-2 text-left">{list.map(s => <SourceCard key={s.url} s={s} />)}</div>}

      <p className="text-[11px] text-mute mt-4 max-w-xl">Links compiled 12 November 2026. External sites may change or move. Mission values are simplified for gameplay; always check the original source for official figures.</p>
      <Link to="/missions" className="btn-ghost">← Back to Missions</Link>
    </section>
  )
}