import { Link } from 'react-router-dom'
import logo from '../assets/logo.jpg'

export default function Home() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center gap-3 max-w-3xl">
      <div className="eyebrow flex items-center gap-3"><i className="w-6 h-px bg-current opacity-50" /> YOUR NEXT GREAT SPACE ADVENTURE <i className="w-6 h-px bg-current opacity-50" /></div>
      <img src={logo} alt="Stellar Strategy logo" className="w-28 aspect-square rounded-full object-cover shadow-[0_0_45px_rgba(102,221,255,.22)] animate-bounce [animation-duration:6s]" />
      <h1 className="font-display font-black leading-[.92] tracking-[.075em] flex flex-col text-5xl sm:text-7xl md:text-8xl">
        <span className="bg-gradient-to-b from-white to-[#aebbd4] bg-clip-text text-transparent">STELLAR</span>
        <span className="bg-gradient-to-r from-[#a8f5ff] via-neon to-[#ad91ff] bg-clip-text text-transparent">STRATEGY</span>
      </h1>
      <p className="text-[#b2bdd1] text-base md:text-lg leading-relaxed max-w-xl">Gamifying space data to empower today's children—ensuring the world never loses their future potential.</p>
      <Link to="/missions" className="btn mt-2">▶ &nbsp;Begin your adventure ↗</Link>
      <div className="mt-4 grid sm:grid-cols-3 w-full border border-line rounded-lg bg-[rgba(9,16,35,.52)] backdrop-blur text-left">
        {[['UP NEXT', 'Mission 1: The Kármán Breach'], ['MISSIONS', '2 available'], ['MISSION STATUS', '● Ready for launch']].map(([a, b], i) => (
          <div key={a} className={`px-5 py-3 ${i ? 'sm:border-l border-t sm:border-t-0 border-line' : ''}`}>
            <span className="block font-display text-[9px] font-semibold tracking-widest text-mute mb-1.5">{a}</span><b className="text-[13px] font-semibold">{b}</b>
          </div>))}
      </div>
    </section>
  )
}
