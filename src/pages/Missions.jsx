import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../hooks/useProgress'
import Solanacard from './missions/solanacard'
import { MEDALS } from '../game/medals'



export default function Missions() {
  const { user } = useAuth()
  const [p] = useProgress()
  const list = [
    { n: 1, to: '/missions/1', title: 'The Kármán Breach', tag: 'ROCKET ENGINEERING', body: 'Design a rocket on a tiny national budget and cross the Kármán Line in one attempt.', done: p.m1, locked: false, req: null },
    { n: 2, to: '/missions/2', title: 'The Storm Sentinel', tag: 'WEATHER SATELLITE', body: 'Launch Solana’s first weather satellite inspired by NASA’s TIROS-1 and warn your people.', done: p.m2, locked: !p.m1, req: 1 },
    { n: 3, to: '/missions/3', title: 'Project Red Horizon', tag: 'MARS ROVER DEPLOYMENT', body: 'Guide a rover from Earth to Jezero Crater: choose your transfer, wheels and instruments, then survive a solar storm and the seven minutes of Mars entry.', done: p.m3, locked: !p.m2, req: 2 },
  ]
  return (
    <section className="w-full max-w-5xl flex flex-col items-center gap-3 text-center">
      <div className="eyebrow">— MISSION CONTROL —</div>
      <Solanacard />
      <h2 className="font-display font-black text-4xl md:text-5xl">Choose your <span className="text-neon">Mission</span></h2>
  
      {!user && <p className="text-mute text-sm">Please <Link className="text-neon underline" to="/login">log in</Link> to play and save progress.</p>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-4 text-left">
        {list.map(m => (
          <article key={m.n} className={`card flex flex-col gap-2 ${m.locked ? 'opacity-60' : ''}`}>
            <span className="font-display text-[9px] tracking-widest text-mint">MISSION 0{m.n} · {m.tag}</span>
            <h3 className="font-display font-bold text-xl">{m.title}</h3>
            <p className="text-sm text-mute flex-1">{m.body}</p>
            <div className="flex items-center justify-between mt-2 gap-2">
              <span className="font-display text-[10px] text-neon">{m.done ? '✓ COMPLETE' : m.locked ? `🔒 Complete Mission ${m.req}` : 'READY'}</span>
              {m.locked ? <button className="btn-ghost" disabled>Locked</button> : <Link to={m.to} className="btn-ghost">{m.done ? 'Replay' : 'Launch'} →</Link>}
            </div>
            {p.medals?.[`m${m.n}`] && <div className={`mt-1 flex items-center gap-2 rounded border px-3 py-2 text-xs ${MEDALS[p.medals[`m${m.n}`]]?.className || ''}`}>
              <span aria-hidden="true">✦</span><span className="font-display font-semibold">{MEDALS[p.medals[`m${m.n}`]]?.label} medal earned</span>
            </div>}
          </article>))}
      </div>
    </section>
  )
}

// import { Link } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { useProgress } from '../hooks/useProgress'
// import Solanacard from './missions/solanacard'



// export default function Missions() {
//   const { user } = useAuth()
//   const [p] = useProgress()
//   const list = [
//     { n: 1, to: '/missions/1', title: 'The Kármán Breach', tag: 'ROCKET ENGINEERING', body: 'Design a rocket on a tiny national budget and cross the Kármán Line in one attempt.', done: p.m1, locked: false },
//     { n: 2, to: '/missions/2', title: 'The Storm Sentinel', tag: 'WEATHER SATELLITE', body: 'Launch Solana’s first weather satellite inspired by NASA’s TIROS-1 and warn your people.', done: p.m2, locked: !p.m1 },
//   ]
//   return (
//     <section className="w-full max-w-4xl flex flex-col items-center gap-3 text-center">
//       <div className="eyebrow">— MISSION CONTROL —</div>
//       <Solanacard />
//       <h2 className="font-display font-black text-4xl md:text-5xl">Choose your <span className="text-neon">Mission</span></h2>
  
//       {!user && <p className="text-mute text-sm">Please <Link className="text-neon underline" to="/login">log in</Link> to play and save progress.</p>}
//       <div className="grid md:grid-cols-2 gap-4 w-full mt-4 text-left">
//         {list.map(m => (
//           <article key={m.n} className={`card flex flex-col gap-2 ${m.locked ? 'opacity-60' : ''}`}>
//             <span className="font-display text-[9px] tracking-widest text-mint">MISSION 0{m.n} · {m.tag}</span>
//             <h3 className="font-display font-bold text-xl">{m.title}</h3>
//             <p className="text-sm text-mute flex-1">{m.body}</p>
//             <div className="flex items-center justify-between mt-2">
//               <span className="font-display text-[10px] text-neon">{m.done ? '✓ COMPLETE' : m.locked ? '🔒 Complete Mission 1' : 'READY'}</span>
//               {m.locked ? <button className="btn-ghost" disabled>Locked</button> : <Link to={m.to} className="btn-ghost">{m.done ? 'Replay' : 'Launch'} →</Link>}
//             </div>
//           </article>))}
//       </div>
//     </section>
//   )
// }
