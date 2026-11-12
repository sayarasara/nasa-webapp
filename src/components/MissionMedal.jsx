import { MEDALS } from '../game/medals'

export default function MissionMedal({ tier, title, score }) {
  if (!tier || !MEDALS[tier]) return null
  const medal = MEDALS[tier]
  return (
    <section aria-label={`${medal.label} mission medal earned`} className={`w-full max-w-xl rounded-lg border p-4 text-left ${medal.className}`}>
      <div className="flex items-center gap-4">
        <div aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: medal.color }}>
          <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m16 3 3.5 7.1 7.8 1.1-5.7 5.5 1.4 7.8-7-3.7-7 3.7 1.3-7.8-5.6-5.5 7.8-1.1L16 3Z" /><circle cx="16" cy="16" r="13" /></svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[10px] font-semibold tracking-[.2em]">MISSION MEDAL AWARDED</p>
          <h3 className="font-display text-xl font-bold">{medal.label} · {title}</h3>
          <p className="text-xs opacity-80">Performance score {score}/100 · Mission complete</p>
        </div>
      </div>
      <p className="mt-3 border-t border-current/20 pt-3 text-xs opacity-80">Medals reflect mission safety, science, and decision quality. Replay to improve your award.</p>
    </section>
  )
}
