import { useEffect, useRef } from 'react'

const C = { bg: '#0a0830', grid: '#15124d', b: '#074e8d', p: '#033b68', w: '#ffffff', d: '#0d373fe3', r: '#4d88ff', y: '#04011b' }
const DIG = { 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '111', '001', '111'] }
const CAPTION = {
  nose: 'Airflow around each nosecone. Blue lines = air flowing. Red dots = turbulence and drag. The numbers match your choices.',
  payload: 'White arrow = engine thrust (up). Blue/purple arrow = weight pulling the rocket down. A longer arrow means more weight to lift.',
  engine: 'Inside each engine type: 1 solid fuel block, 2 liquid fuel tanks + chamber, 3 ion thruster with solar panels.',
  angle: 'Launch angles seen from the side of Earth. The yellow arrow shows Earth spinning east; launching east gets a free speed boost.',
}

function draw(ctx, kind) {
  const px = (x, y, c) => { ctx.fillStyle = C[c]; ctx.fillRect(Math.round(x), Math.round(y), 1, 1) }
  const rect = (x, y, w, h, c) => { ctx.fillStyle = C[c]; ctx.fillRect(Math.round(x), Math.round(y), w, h) }
  const line = (x0, y0, x1, y1, c) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1)
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let e = dx + dy
    for (;;) { px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx } if (e2 <= dx) { e += dx; y0 += sy } }
  }
  const num = (n, x, y, c = 'w') => DIG[n].forEach((row, j) => [...row].forEach((v, i) => v === '1' && px(x + i, y + j, c)))
  const arrowUp = (x, y0, y1, c) => { line(x, y0, x, y1, c); line(x, y1, x - 2, y1 + 2, c); line(x, y1, x + 2, y1 + 2, c) }
  const arrowDown = (x, y0, y1, c) => { line(x, y0, x, y1, c); line(x, y1, x - 2, y1 - 2, c); line(x, y1, x + 2, y1 - 2, c) }

  rect(0, 0, 96, 64, 'bg')
  for (let i = 0; i < 96; i += 8) rect(i, 0, 1, 64, 'grid')
  for (let i = 0; i < 64; i += 8) rect(0, i, 96, 1, 'grid')

  if (kind === 'nose') {
    ;[16, 48, 80].forEach((cx, k) => {
      rect(cx - 5, 28, 11, 24, 'w'); rect(cx - 5, 36, 11, 1, 'd')
      rect(cx - 8, 46, 3, 6, 'p'); rect(cx + 6, 46, 3, 6, 'p')
      if (k === 0) { for (let y = 14; y < 28; y++) { const hw = Math.round(((y - 14) / 13) * 5); rect(cx - hw, y, hw * 2 + 1, 1, 'w') } }
      if (k === 1) rect(cx - 5, 26, 11, 2, 'w')
      if (k === 2) { rect(cx - 7, 22, 15, 6, 'p'); rect(cx - 3, 22, 1, 6, 'd'); rect(cx + 1, 22, 1, 6, 'd'); rect(cx - 7, 25, 15, 1, 'd') }
      const top = [14, 26, 22][k]
      ;[-1, 1].forEach(s => {
        if (k === 0) { line(cx + s * 4, 3, cx + s * 4, 12, 'b'); line(cx + s * 4, 12, cx + s * 9, 27, 'b'); line(cx + s * 9, 27, cx + s * 9, 50, 'b') }
        else { line(cx + s * 4, 3, cx + s * 4, top - 4, 'b'); line(cx + s * 4, top - 4, cx + s * 12, top + 2, 'b'); line(cx + s * 12, top + 2, cx + s * 12, 50, 'b') }
      })
      if (k > 0) for (let i = 0; i < 6; i++) px(cx - 5 + ((i * 7) % 11), top - 8 + (i % 3) * 2, 'r')
      num(k + 1, cx - 1, 57)
    })
  } else if (kind === 'payload') {
    ;[24, 72].forEach((cx, k) => {
      if (k === 0) { rect(cx - 5, 12, 11, 24, 'b'); rect(cx - 5, 20, 11, 1, 'd'); rect(cx - 5, 28, 11, 1, 'd') }
      else { rect(cx - 9, 10, 19, 28, 'p'); line(cx - 9, 10, cx + 9, 38, 'd'); line(cx + 9, 10, cx - 9, 38, 'd'); rect(cx - 9, 24, 19, 1, 'd') }
      arrowUp(cx - 14, 48, 22, 'w')
      arrowDown(cx + 14, 14, k === 0 ? 28 : 46, k === 0 ? 'b' : 'r')
      num(k + 1, cx - 1, 56)
    })
  } else if (kind === 'engine') {
    ;[16, 48, 80].forEach((cx, k) => {
      if (k === 0) { rect(cx - 7, 8, 15, 34, 'p'); rect(cx - 2, 8, 5, 34, 'd'); rect(cx - 4, 42, 9, 3, 'w'); line(cx, 46, cx, 52, 'y') }
      if (k === 1) {
        rect(cx - 9, 8, 8, 18, 'b'); rect(cx + 2, 8, 8, 18, 'w')
        line(cx - 5, 26, cx - 2, 33, 'w'); line(cx + 6, 26, cx + 2, 33, 'w')
        rect(cx - 4, 33, 9, 8, 'p')
        for (let y = 0; y < 9; y++) { const g = Math.floor(y / 2); rect(cx - 4 - g, 41 + y, 9 + 2 * g, 1, 'b') }
        line(cx, 52, cx, 55, 'y')
      }
      if (k === 2) {
        rect(cx - 15, 14, 9, 12, 'b'); rect(cx + 7, 14, 9, 12, 'b'); rect(cx - 11, 14, 1, 12, 'd'); rect(cx + 11, 14, 1, 12, 'd')
        rect(cx - 4, 10, 9, 22, 'w'); rect(cx - 4, 32, 9, 2, 'p')
        for (let y = 36; y < 52; y += 3) { px(cx - 2, y, 'b'); px(cx, y + 1, 'b'); px(cx + 2, y, 'b') }
      }
      num(k + 1, cx - 1, 57)
    })
  } else {
    for (let x = 0; x < 96; x++) { const y = Math.round(122 - Math.sqrt(3600 - (x - 48) ** 2 || 0)); if (isFinite(y) && y < 64) { rect(x, y, 1, 64 - y, 'd'); px(x, y, 'b') } }
    rect(46, 57, 5, 2, 'w')
    line(48, 56, 48, 10, 'w'); num(1, 42, 3)
    line(48, 56, 54, 10, 'b'); num(2, 57, 3)
    line(48, 56, 84, 22, 'p'); num(3, 85, 16)
    line(10, 44, 26, 44, 'y'); line(26, 44, 23, 42, 'y'); line(26, 44, 23, 46, 'y')
  }
}

export default function PixelDiagram({ kind }) {
  const ref = useRef(null)
  useEffect(() => { draw(ref.current.getContext('2d'), kind) }, [kind])
  return (
    <figure className="w-full max-w-md">
      <canvas ref={ref} width="96" height="64" className="w-full border border-neon/40 rounded" style={{ imageRendering: 'pixelated' }} />
      <figcaption className="text-[11px] text-mute mt-2 leading-snug">{CAPTION[kind]}</figcaption>
    </figure>
  )
}