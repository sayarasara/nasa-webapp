import { useEffect, useRef } from 'react'

const N = 12

// Builds a wireframe rocket from the player's four choices.
function build(p) {
  const V = [], E = []
  const pt = (x, y, z) => V.push([x, y, z]) - 1
  const ring = (y, r, cx = 0) => { const s = V.length; for (let i = 0; i < N; i++) { const a = (i / N) * Math.PI * 2; V.push([cx + Math.cos(a) * r, y, Math.sin(a) * r]) } for (let i = 0; i < N; i++) E.push([s + i, s + ((i + 1) % N)]); return s }
  const link = (a, b) => { for (let i = 0; i < N; i++) E.push([a + i, b + i]) }
  const chain = rings => rings.reduce((a, b) => { link(a, b); return b })
  const R = p[1] === 1 ? 24 : 17            // chassis: heavy titanium is thicker

  // body
  const body = [-80, -50, -20, 10, 40, 62].map(y => ring(y, R)); chain(body)
  ring(-20, R + 2)                                                  // stage separation band
  if (p[1] === 1) [-62, -35, -5, 25].forEach(y => ring(y, R + 4))   // armour plating bands

  // nosecone
  if (p[0] === 0) {
    const L = 75, rs = [0.2, 0.4, 0.6, 0.8].map(t => ring(-80 - L * t, R * Math.pow(1 - t, 0.85)))
    link(body[0], rs[0]); chain(rs); const apex = pt(0, -80 - L, 0); for (let i = 0; i < N; i++) E.push([rs[3] + i, apex])
  } else if (p[0] === 1) {
    const a = ring(-84, R * 0.97), b = ring(-88, R * 0.9), c = ring(-88, R * 0.55), d = ring(-88, R * 0.2)
    link(body[0], a); link(a, b); link(b, c); link(c, d)
  } else {
    const a = ring(-80, R * 1.25), b = ring(-104, R * 1.25), c = ring(-104, R * 0.6), d = ring(-104, R * 0.2)
    link(a, b); link(b, c); link(c, d)
  }

  // fins
  for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2, c = Math.cos(a), s = Math.sin(a), t = pt(c * R, 22, s * R), u = pt(c * R, 62, s * R), v = pt(c * (R + 22), 84, s * (R + 22)); E.push([t, v], [u, v], [t, u]) }

  // propulsion
  if (p[2] === 0) {
    chain([ring(70, R * 0.55), ring(84, R * 0.7)]); link(body[5], V.length - 2 * N)
    ;[-1, 1].forEach(s => { const cx = s * (R + 11), a = ring(-30, 8, cx), b = ring(62, 8, cx); link(a, b); const tip = pt(cx, -48, 0); for (let i = 0; i < N; i++) E.push([a + i, tip]); E.push([pt(cx, 62, 0), pt(s * R, 56, 0)]) })
  } else if (p[2] === 1) {
    const r1 = ring(70, R * 0.45), r2 = ring(84, R * 0.8), r3 = ring(100, R * 1.2); link(body[5], r1); chain([r1, r2, r3])
  } else {
    const r1 = ring(70, R * 0.3), r2 = ring(78, R * 0.45); link(body[5], r1); chain([r1, r2])
    ;[-1, 1].forEach(s => { const x0 = s * (R + 4), x1 = s * (R + 56), a = pt(x0, -45, 0), b = pt(x1, -45, 0), c = pt(x1, 15, 0), d = pt(x0, 15, 0), m1 = pt(x0 + s * 17, -45, 0), m2 = pt(x0 + s * 17, 15, 0), n1 = pt(x0 + s * 36, -45, 0), n2 = pt(x0 + s * 36, 15, 0); E.push([a, b], [b, c], [c, d], [d, a], [m1, m2], [n1, n2], [pt(x0, -15, 0), pt(x1, -15, 0)]) })
  }

  const nodes = [[0, p[0] === 0 ? -150 : -100, 0], [R, -35, 0], [0, p[2] === 1 ? 98 : 84, 0], [-(R + 22), 84, 0]]
  return { V, E, nodes }
}

export default function RocketWire({ picks, notes }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d'), W = cv.width, H = cv.height
    const { V, E, nodes } = build(picks)
    const tilt = ([90, 85, 45][picks[3]] === 90 ? 0 : (90 - [90, 85, 45][picks[3]]) * Math.PI / 180)
    const label = ['NOSECONE', 'CHASSIS', 'PROPULSION', 'TRAJECTORY']
    const f = 360
    let ang = 0, raf
    const proj = ([x, y, z]) => {
      const x1 = x * Math.cos(ang) + z * Math.sin(ang), z1 = -x * Math.sin(ang) + z * Math.cos(ang), y0 = y + 30
      const x2 = x1 * Math.cos(tilt) - y0 * Math.sin(tilt), y2 = x1 * Math.sin(tilt) + y0 * Math.cos(tilt)
      const s = (f / (f + z1 + 80)) * 1.25
      return [W / 2 + x2 * s, H / 2 + y2 * s, z1]
    }
    const draw = () => {
      ang += 0.005
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(157,78,221,.25)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10); ctx.stroke(); ctx.setLineDash([])
      ctx.lineWidth = 1.2
      const P = V.map(proj)
      E.forEach(([a, b]) => {
        const t = Math.min(1, Math.max(0, ((P[a][2] + P[b][2]) / 2 + 30) / 60))
        ctx.strokeStyle = t < 0.33 ? 'rgba(255,255,255,.95)' : t < 0.66 ? 'rgba(0,229,255,.8)' : 'rgba(120,80,230,.45)'
        ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.stroke()
      })
      ctx.font = '11px monospace'
      nodes.forEach((n, i) => {
        const [x, y] = proj(n), right = x >= W / 2, bx = right ? W - 160 : 8, by = 14 + i * 98
        ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(right ? bx : bx + 152, by + 28); ctx.stroke()
        ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = '#040611'; ctx.fill(); ctx.stroke()
        ctx.fillStyle = 'rgba(10,6,40,.92)'; ctx.fillRect(bx, by, 152, 56); ctx.strokeStyle = '#9d4edd'; ctx.strokeRect(bx, by, 152, 56)
        ctx.fillStyle = '#00e5ff'; ctx.fillText(label[i], bx + 6, by + 15)
        ctx.fillStyle = '#fff'; ctx.fillText(notes[i][0], bx + 6, by + 32)
        ctx.fillStyle = '#a2abc0'; ctx.fillText(notes[i][1], bx + 6, by + 47)
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [picks.join(','), JSON.stringify(notes)]) // eslint-disable-line
  return <canvas ref={ref} width="640" height="420" className="w-full max-w-2xl border border-violet/50 rounded bg-black" />
}