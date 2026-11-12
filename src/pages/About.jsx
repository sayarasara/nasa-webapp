export default function About() {
  const pillars = [['01', 'Explore', 'See our planet from a new perspective.'], ['02', 'Decide', 'Make trade-offs with real consequences.'], ['03', 'Protect', 'Build a safer future for everyone.']]
  return (
    <section className="max-w-3xl text-center flex flex-col items-center gap-4 my-auto">
      <div className="eyebrow">— OUR MISSION —</div>
      <h2 className="font-display font-black text-4xl md:text-6xl leading-tight">Today’s Players.<br /><span className="text-neon">Tomorrow’s Space Explorers.</span></h2>
      <p className="text-[#b2bdd1] leading-relaxed max-w-2xl">Stellar Strategy turns real space history into missions you can lead. We, a team of engineering students from Mymensingh Engineering College (MEC), Bangladesh, are on a mission to inspire the next generation to look beyond Planet Earth—to explore it, make decisions, solve problems, and discover space.</p>
      <div className="grid sm:grid-cols-3 gap-3 w-full mt-4 text-left">
        {pillars.map(([n, t, d]) => <div key={n} className="card !p-4"><span className="block font-display text-[10px] text-mint mb-3">{n}</span><b className="font-display text-[13px]">{t}</b><p className="text-xs text-mute mt-2">{d}</p></div>)}
      </div>
    </section>
  )
}
