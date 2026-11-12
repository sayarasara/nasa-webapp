import Phaser from 'phaser'

// ---------- tiny procedural-noise toolkit (no external assets) ----------
const TAU = Math.PI * 2
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
const mix = (a, b, t) => a + (b - a) * t
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t) }
function hash(x, y, z) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf)
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz)
  return mix(mix(mix(c(0, 0, 0), c(1, 0, 0), u), mix(c(0, 1, 0), c(1, 1, 0), u), v), mix(mix(c(0, 0, 1), c(1, 0, 1), u), mix(c(0, 1, 1), c(1, 1, 1), u), v), w)
}
function fbm(x, y, z, o) { let a = 0.5, f = 1, s = 0, n = 0; for (let i = 0; i < o; i++) { s += a * noise3(x * f, y * f, z * f); n += a; a *= 0.5; f *= 2.03 } return s / n }

// ---------- procedural Earth: oceans, continents, deserts, ice caps, clouds ----------
function buildEarth(Rr, ix, iy) {
  const D = Rr * 2 + 2, c = Rr + 1, N = D * D, CW = 384, CH = 192, tilt = 0.45, ct = Math.cos(tilt), st = Math.sin(tilt), sea = 0.53
  const cloud = new Float32Array(CW * CH)
  for (let v = 0; v < CH; v++) {
    const lat = (v / CH - 0.5) * Math.PI, cl = Math.cos(lat), y = Math.sin(lat)
    for (let u = 0; u < CW; u++) { const lon = (u / CW) * TAU - Math.PI; cloud[v * CW + u] = smooth(0.5, 0.74, fbm(cl * Math.sin(lon) * 2.4 + 11, y * 3.2 + 5, cl * Math.cos(lon) * 2.4 + 2, 5)) }
  }
  const E = { D, N, CW, cloud, nx: new Float32Array(N), ny: new Float32Array(N), nz: new Float32Array(N), lonI: new Uint16Array(N), latI: new Uint16Array(N), base: new Uint8Array(N * 3), alpha: new Uint8Array(N), ocean: new Uint8Array(N), lights: new Float32Array(N) }
  for (let py = 0; py < D; py++) for (let px = 0; px < D; px++) {
    const i = py * D + px, dx = (px - c) / Rr, dy = (py - c) / Rr, r2 = dx * dx + dy * dy
    if (r2 > 1.05) continue
    const nz = Math.sqrt(Math.max(0, 1 - r2))
    E.alpha[i] = Math.round(255 * clamp((1 - Math.sqrt(r2)) * Rr + 0.5)); E.nx[i] = dx; E.ny[i] = dy; E.nz[i] = nz
    const wx = dx, wy = dy * ct - nz * st, wz = dy * st + nz * ct
    E.lonI[i] = Math.floor((Math.atan2(wx, wz) / TAU + 0.5) * CW) % CW
    E.latI[i] = Math.floor(clamp(Math.asin(clamp(-wy, -1, 1)) / Math.PI + 0.5, 0, 0.999) * CH)
    let e = (fbm(wx * 1.7 + 3.1, wy * 1.7 + 1.3, wz * 1.7 + 7.7, 5) - 0.5) * 1.9 + 0.5
    const d = Math.hypot(px - c - ix, py - c - iy); let isl = false
    if (d < 75) e -= (1 - d / 75) * 0.45            // open ocean around Isle of Solana
    if (d < 8) { e = Math.max(e, sea + 0.03 + (1 - d / 8) * 0.12); isl = true }
    const m = fbm(wx * 3.2 + 9, wy * 3.2, wz * 3.2 + 4, 3), ice = smooth(0.78, 0.92, Math.abs(wy) + (m - 0.5) * 0.12)
    let R, G, B, land = false
    if (e < sea) {
      const dep = clamp((sea - e) / 0.28), shore = (1 - smooth(0, 0.05, sea - e)) * 0.6
      R = mix(mix(36, 6, dep), 60, shore); G = mix(mix(130, 30, dep), 190, shore); B = mix(mix(185, 92, dep), 205, shore); E.ocean[i] = 1
    } else {
      land = true; const el = clamp((e - sea) / 0.25)
      if (e < sea + 0.012) { R = 224; G = 206; B = 150 }
      else if (m < 0.42 && Math.abs(wy) < 0.62 && !isl) { R = mix(205, 170, el); G = mix(176, 140, el); B = mix(116, 95, el) }
      else { R = mix(32, 92, el * el); G = mix(112, 118, el); B = mix(46, 64, el); if (el > 0.55) { const t = smooth(0.55, 0.9, el); R = mix(R, 135, t); G = mix(G, 118, t); B = mix(B, 98, t) } }
      if (el > 0.9) { R = 240; G = 244; B = 250 }
      E.lights[i] = d < 3 ? 1 : clamp((fbm(wx * 16, wy * 16, wz * 16, 2) - 0.58) * 5)
    }
    E.base[i * 3] = mix(R, 238, ice); E.base[i * 3 + 1] = mix(G, 244, ice); E.base[i * 3 + 2] = mix(B, 252, ice)
    if (ice > 0.5) E.lights[i] = 0
  }
  return E
}

function renderEarth(E, data, sun, off) {
  const { N, nx, ny, nz, lonI, latI, base, alpha, ocean, lights, cloud, CW } = E
  const [sx, sy, sz] = sun
  let hx = sx, hy = sy, hz = sz + 1; const hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl
  for (let i = 0; i < N; i++) {
    const a = alpha[i], o = i * 4
    if (!a) { data[o + 3] = 0; continue }
    const dot = nx[i] * sx + ny[i] * sy + nz[i] * sz, day = smooth(-0.08, 0.28, dot)
    const cl = cloud[latI[i] * CW + ((lonI[i] + off) % CW)]
    let r = base[i * 3], g = base[i * 3 + 1], b = base[i * 3 + 2]
    if (ocean[i]) { const s = Math.pow(Math.max(0, nx[i] * hx + ny[i] * hy + nz[i] * hz), 70) * (1 - cl) * day * 0.9 * 255; r += s; g += s; b += s }
    const ca = cl * 0.88; r = mix(r, 250, ca); g = mix(g, 252, ca); b = mix(b, 255, ca)
    const shade = 0.045 + 0.955 * Math.pow(clamp(dot * 1.15 + 0.08), 0.85)
    r = r * shade + 6 * (1 - day); g = g * shade + 10 * (1 - day); b = b * shade + 26 * (1 - day)
    if (lights[i] > 0) { const nl = (1 - smooth(0, 0.2, dot)) * lights[i] * (1 - cl * 0.7); r += 255 * nl; g += 190 * nl; b += 100 * nl }
    const tw = Math.exp(-(dot * dot) / 0.006) * 0.5; r += 150 * tw; g += 70 * tw; b += 15 * tw
    const rim = Math.pow(1 - nz[i], 3) * (0.2 + 0.8 * day) * 0.8; r += 70 * rim; g += 140 * rim; b += 255 * rim
    data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = a
  }
}

// ---------- scene ----------
export function runOrbit(parent, { orbit }, cb) {
  const cx = 320, cy = 190, Rr = 108, ox = 30, oy = 10, ix = cx + ox, iy = cy + oy
  let nightTarget = 0
  const pos = a => orbit === 'polar' ? { x: cx + 0.2 * 150 * Math.sin(a), y: cy - 150 * Math.cos(a), z: Math.sin(a) } : { x: cx + 205 * Math.cos(a), y: cy + 205 * 0.22 * Math.sin(a), z: Math.sin(a) }
  const norm = v => { const l = Math.hypot(...v); return v.map(x => x / l) }
  const DAY = norm([-0.55, -0.35, 0.75]), NIGHT = norm([0.85, -0.15, -0.5])

  class Scene extends Phaser.Scene {
    create() {
      const g = this.make.graphics({ add: false }); g.fillStyle(0xffffff).fillRect(0, 0, 2, 2); g.generateTexture('px', 2, 2); g.destroy()
      // deep space
      this.add.rectangle(320, 180, 640, 360, 0x02030a).setDepth(-3)
      this.add.circle(110, 70, 190, 0x3b2a8a, 0.07).setDepth(-2); this.add.circle(540, 300, 220, 0x14508a, 0.07).setDepth(-2); this.add.circle(560, 60, 120, 0x6b2a7a, 0.05).setDepth(-2)
      for (let i = 0; i < 170; i++) {
        const s = this.add.rectangle(Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 360), Math.random() < 0.15 ? 2 : 1, Math.random() < 0.15 ? 2 : 1, Phaser.Utils.Array.GetRandom([0xffffff, 0xbfd9ff, 0xffe9c4]), Phaser.Math.FloatBetween(0.25, 0.95)).setDepth(-1)
        if (i % 4 === 0) this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(900, 3000), yoyo: true, repeat: -1 })
      }
      // atmosphere glow + Earth
      this.glow = this.add.container(0, 0).setDepth(2)
      for (let k = 0; k < 10; k++) this.glow.add(this.add.circle(cx, cy, Rr + 2 + k * 3, 0x4aa3ff, 0.1 * (1 - k / 10)))
      this.E = buildEarth(Rr, ox, oy)
      this.tex = this.textures.createCanvas('earth', this.E.D, this.E.D)
      this.img = this.tex.context.createImageData(this.E.D, this.E.D)
      this.add.image(cx, cy, 'earth').setDepth(3)
      this.nt = 0; this.cloudPos = 0; this.lastKey = ''; this.acc = 0
      // developing storm swirl west of the island
      this.storm = this.add.container(ix - 55, iy - 26).setDepth(4)
      const sw = this.add.graphics(); for (let k = 0; k < 3; k++) { sw.lineStyle(5, 0xffffff, 0.45).beginPath(); for (let r = 2; r < 26; r += 1) { const a = k * 2.1 + r * 0.2; sw.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.85) } sw.strokePath() }
      this.storm.add(sw); this.tweens.add({ targets: this.storm, angle: 360, duration: 14000, repeat: -1 })
      // orbit path (back half hidden behind the Earth)
      const back = this.add.graphics().setDepth(1), front = this.add.graphics().setDepth(6)
      for (let i = 0; i < 150; i++) { const p = pos((i / 150) * TAU), gg = p.z >= 0 ? front : back; gg.fillStyle(0x7fd4ff, p.z >= 0 ? 0.6 : 0.28).fillRect(p.x, p.y, 2, 2) }
      this.scan = this.add.graphics().setDepth(7)
      // rocket
      this.rocket = this.add.container(ix, iy - 8).setDepth(9)
      this.rocket.add([this.add.rectangle(0, 13, 4, 8, 0xff8a3d), this.add.rectangle(0, 0, 6, 18, 0xffffff), this.add.triangle(0, -13, 0, -5, -3, 4, 3, 4, 0xe53935), this.add.rectangle(-4, 6, 2, 7, 0xe53935), this.add.rectangle(4, 6, 2, 7, 0xe53935)])
      this.trail = this.add.particles(0, 0, 'px', { speed: { min: 10, max: 30 }, angle: { min: 80, max: 100 }, lifespan: 700, scale: { start: 2, end: 0.3 }, alpha: { start: 0.9, end: 0 }, tint: [0xffffff, 0xffd166, 0xff8a3d], frequency: 30, emitting: false }).setDepth(8)
      this.txt = this.add.text(320, 36, '', { fontFamily: 'Orbitron, monospace', fontSize: '30px', color: '#fff', stroke: '#02030a', strokeThickness: 5 }).setOrigin(0.5).setDepth(20)
      const seq = ['T-10', 'T-5', 'T-3', 'T-2', 'T-1', 'LAUNCH!']; let k = 0
      this.time.addEvent({ delay: 550, repeat: seq.length - 1, callback: () => { this.txt.setText(seq[k++]); if (k === seq.length) this.lift() } })
    }
    lift() {
      this.trail.start(); this.trail.startFollow(this.rocket, 0, 18)
      this.tweens.add({ targets: this.rocket, y: 30, x: ix + 18, scale: 0.6, duration: 2400, ease: 'Sine.easeIn', onComplete: () => this.deploy() })
    }
    deploy() {
      this.trail.stop(); this.rocket.setVisible(false); this.txt.setText('')
      const ring = this.add.circle(this.rocket.x, this.rocket.y, 4).setStrokeStyle(2, 0xffffff).setDepth(9); this.tweens.add({ targets: ring, scale: 6, alpha: 0, duration: 700 })
      const sg = this.add.graphics()
      sg.fillStyle(0x1b3a8a).fillRect(-21, -4, 14, 8).fillRect(7, -4, 14, 8); sg.lineStyle(1, 0x6fb1ff, 0.9).strokeRect(-21, -4, 14, 8).strokeRect(7, -4, 14, 8)
      sg.lineBetween(-14, -4, -14, 4).lineBetween(14, -4, 14, 4).lineBetween(-21, 0, -7, 0).lineBetween(7, 0, 21, 0)
      sg.fillStyle(0xd9a441).fillRect(-5, -4, 10, 8).fillStyle(0xf6d27a).fillRect(-4, -3, 8, 3); sg.fillStyle(0xdddddd).fillRect(-1, -9, 2, 5).fillCircle(0, -10, 2)
      this.sat = this.add.container(0, 0, [sg]); this.a = 0.3; this.deployed = true
      const flag = this.add.container(ix, iy - 4).setDepth(8)
      flag.add([this.add.rectangle(0, -8, 2, 22, 0xffffff), this.add.triangle(7, -15, 0, -6, 0, 6, 14, 0, 0xef4444)])
      flag.setSize(32, 36).setInteractive({ useHandCursor: true }).on('pointerdown', () => cb.current.onFlag())
      const pulse = this.add.circle(ix, iy, 6).setStrokeStyle(2, 0xfacc15).setDepth(7)
      this.tweens.add({ targets: pulse, scale: 3.2, alpha: 0, duration: 1400, repeat: -1 })
      cb.current.onDeployed()
    }
    update(_, dt) {
      this.nt += (nightTarget - this.nt) * Math.min(1, dt / 450); if (Math.abs(nightTarget - this.nt) < 0.003) this.nt = nightTarget
      this.cloudPos += dt * 0.008; this.acc += dt
      const off = Math.floor(this.cloudPos) % this.E.CW, key = off + '|' + this.nt.toFixed(3)
      if (key !== this.lastKey && this.acc > 30) {
        this.acc = 0; this.lastKey = key
        const s = norm(DAY.map((v, i) => mix(v, NIGHT[i], this.nt)))
        renderEarth(this.E, this.img.data, s, off); this.tex.context.putImageData(this.img, 0, 0); this.tex.refresh()
        this.glow.setAlpha(1 - 0.65 * this.nt); this.storm.setAlpha(0.8 - 0.55 * this.nt)
      }
      if (!this.deployed) return
      this.a += dt * 0.0008
      const p = pos(this.a); this.sat.setPosition(p.x, p.y).setDepth(p.z >= 0 ? 6.5 : 1).setScale(1 + 0.2 * p.z)
      const s = this.scan.clear()
      if (p.z > 0 && Phaser.Math.Distance.Between(p.x, p.y, ix, iy) < 150) { s.fillStyle(0x7fd4ff, 0.1 + 0.06 * Math.random()).fillTriangle(p.x, p.y, ix - 16, iy, ix + 16, iy); s.lineStyle(1, 0x7fd4ff, 0.5).lineBetween(p.x, p.y, ix, iy) }
    }
  }
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, width: 640, height: 360, backgroundColor: '#02030a', banner: false, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: Scene })
  game.setNight = v => { nightTarget = v ? 1 : 0 }
  return game
}

// import Phaser from 'phaser'

// // Launch + orbit scene for Mission 2. cb.current = { onDeployed, onFlag } (kept fresh by React).
// export function runOrbit(parent, { orbit }, cb) {
//   const cx = 320, cy = 190, ix = cx + 30, iy = cy + 10
//   const pos = a => orbit === 'polar' ? [cx + Math.cos(a) * 55, cy + Math.sin(a) * 160] : [cx + Math.cos(a) * 215, cy + Math.sin(a) * 45]
//   class Scene extends Phaser.Scene {
//     create() {
//       const g = this.make.graphics({ add: false }); g.fillStyle(0xffffff).fillRect(0, 0, 2, 2); g.generateTexture('px', 2, 2); g.destroy()
//       for (let i = 0; i < 70; i++) this.add.rectangle(Phaser.Math.Between(0, 640), Phaser.Math.Between(0, 360), 2, 2, 0xffffff, Phaser.Math.FloatBetween(.2, .8))
//       this.add.circle(cx, cy, 98, 0x60a5fa, .25)
//       this.add.circle(cx, cy, 92, 0x1d4ed8)
//       ;[[-30, -40, 40, 26], [40, 30, 36, 22], [-50, 30, 26, 18]].forEach(([x, y, w, h]) => this.add.ellipse(cx + x, cy + y, w, h, 0x16a34a, .85))
//       this.add.circle(ix, iy, 5, 0xfacc15)
//       const path = this.add.graphics().fillStyle(0xffffff, .5)
//       for (let i = 0; i < 120; i += 2) { const [x, y] = pos(i / 120 * Math.PI * 2); path.fillRect(x, y, 2, 2) }
//       this.scan = this.add.graphics()
//       this.rocket = this.add.container(ix, iy - 8)
//       this.rocket.add([this.add.rectangle(0, 0, 8, 22, 0xffffff), this.add.triangle(0, -16, 0, -6, -4, 5, 4, 5, 0xef4444), this.add.rectangle(0, 14, 4, 7, 0xfb923c)])
//       this.txt = this.add.text(320, 40, '', { fontFamily: 'Orbitron, monospace', fontSize: '30px', color: '#fff' }).setOrigin(.5).setDepth(5)
//       const seq = ['T-10', 'T-5', 'T-3', 'T-2', 'T-1', 'LAUNCH!']; let k = 0
//       this.time.addEvent({ delay: 550, repeat: seq.length - 1, callback: () => { this.txt.setText(seq[k++]); if (k === seq.length) this.lift() } })
//     }
//     lift() {
//       this.tweens.add({ targets: this.rocket, y: 28, duration: 2200, ease: 'Sine.easeIn', onComplete: () => this.deploy() })
//     }
//     deploy() {
//       this.rocket.setVisible(false); this.txt.setText('')
//       this.sat = this.add.container(0, 0); this.sat.add([this.add.rectangle(0, 0, 8, 6, 0xfcd34d), this.add.rectangle(-9, 0, 9, 5, 0x38bdf8), this.add.rectangle(9, 0, 9, 5, 0x38bdf8)])
//       this.a = -Math.PI / 2; this.deployed = true
//       const flag = this.add.container(ix, iy - 4)
//       flag.add([this.add.rectangle(0, -8, 2, 22, 0xffffff), this.add.triangle(7, -15, 0, -6, 0, 6, 14, 0, 0xef4444)])
//       flag.setSize(30, 34).setInteractive({ useHandCursor: true }).on('pointerdown', () => cb.current.onFlag())
//       this.tweens.add({ targets: flag, scale: 1.2, yoyo: true, repeat: -1, duration: 600 })
//       cb.current.onDeployed()
//     }
//     update(_, dt) {
//       if (!this.deployed) return
//       this.a += dt * 0.0008
//       const [x, y] = pos(this.a); this.sat.setPosition(x, y)
//       const d = Phaser.Math.Distance.Between(x, y, ix, iy), s = this.scan.clear()
//       if (d < 110) s.lineStyle(1, 0xfacc15, .4 + .4 * Math.random()).lineBetween(x, y, ix, iy)
//     }
//   }
//   return new Phaser.Game({ type: Phaser.AUTO, parent, width: 640, height: 360, transparent: true, banner: false, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: Scene })
// }
