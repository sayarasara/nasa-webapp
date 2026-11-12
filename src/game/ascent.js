import Phaser from 'phaser'

// Cinematic 2D pixel-art ascent: tropical island launch site -> sky -> clouds -> space.
// Internal resolution 320x180, scaled up with crisp pixels.
export function runAscent(parent, { outcome, picks }, onDone) {
  class Scene extends Phaser.Scene {
    create() {
      const g = this.make.graphics({ add: false }); g.fillStyle(0xffffff).fillRect(0, 0, 2, 2); g.generateTexture('px', 2, 2); g.destroy()
      const R = (x, y, w, h, c, a = 1) => this.add.rectangle(x, y, w, h, c, a)

      // ---- sky (bright blue near horizon -> deeper blue above) ----
      ;[0x2563c9, 0x2a70d8, 0x2f78dc, 0x3f8ee8, 0x5aa6f0, 0x7cc0f6, 0xa5d8fa, 0xc9ebfc, 0xe3f5ff].forEach((c, i) => R(160, i * 21 + 10, 480, 21, c).setDepth(0))
      R(268, 28, 22, 22, 0xfff3a0, 0.3).setDepth(0.5); R(268, 28, 14, 14, 0xfff3a0).setDepth(0.5)
      this.overlay = R(160, 90, 480, 260, 0x040620).setAlpha(0).setDepth(1)          // fades in as we reach space
      this.stars = this.add.container(0, 0).setDepth(2).setAlpha(0)
      for (let i = 0; i < 70; i++) this.stars.add(R(Phaser.Math.Between(0, 320), Phaser.Math.Between(0, 180), 1, 1, 0xffffff))

      // ---- island + ocean (scrolls away as we climb) ----
      const gr = this.ground = this.add.container(0, 0).setDepth(5)
      const G = (x, y, w, h, c) => { const r = R(x, y, w, h, c); gr.add(r); return r }
      const E = (x, y, w, h, c) => { const e = this.add.ellipse(x, y, w, h, c); gr.add(e); return e }
      G(160, 170, 480, 80, 0x1f6fd6); G(160, 133, 480, 3, 0x7cc0f6); G(160, 136, 480, 4, 0x3b8df0)
      for (let i = 0; i < 26; i++) { const r = G(Phaser.Math.Between(0, 320), Phaser.Math.Between(142, 178), 8, 1, 0xbfe3ff); this.tweens.add({ targets: r, alpha: 0.1, duration: Phaser.Math.Between(500, 1400), yoyo: true, repeat: -1 }) }
      E(160, 150, 176, 34, 0xf0d58a)                 // sand
      E(160, 145, 148, 26, 0x2d8f3b)                 // grass shadow
      E(160, 143, 144, 22, 0x3fae4a)                 // grass
      E(145, 140, 64, 9, 0x58c85f)                   // highlight
      const palm = (x, y) => { G(x, y - 6, 2, 12, 0x7a4a21); [[-5, -13, 5], [1, -13, 5], [-3, -15, 8], [-6, -11, 3], [4, -11, 3]].forEach(([dx, dy, w]) => G(x + dx + w / 2, y + dy, w, 2, dy === -15 ? 0x4ccf5a : 0x2e9d3a)); G(x, y - 11, 2, 2, 0x5b3516) }
      const tree = (x, y) => { G(x, y - 3, 2, 6, 0x6b4423); E(x, y - 9, 12, 11, 0x1f7a2e); E(x - 1, y - 11, 8, 7, 0x3fb04c) }
      ;[[96, 146], [214, 143], [232, 148], [124, 141]].forEach(([x, y]) => palm(x, y))
      ;[[108, 148], [200, 148], [84, 150], [246, 150], [222, 140]].forEach(([x, y]) => tree(x, y))
      G(190, 147, 14, 8, 0xe9eefb); G(190, 142, 16, 3, 0xd2453a); G(190, 148, 3, 4, 0x555d7a)   // control building
      G(160, 151, 42, 4, 0x8a94b8); G(160, 154, 32, 2, 0x555d7a)                               // launch pad
      G(146, 134, 4, 34, 0x9aa4c8); G(146, 126, 6, 1, 0x555d7a); G(146, 136, 6, 1, 0x555d7a); G(151, 123, 8, 2, 0x9aa4c8); G(147, 115, 7, 4, 0xe53935)  // tower + flag

      // ---- clouds (some in front of the rocket so it pierces them) ----
      this.clouds = []
      for (let i = 0; i < 10; i++) {
        const s = Phaser.Math.FloatBetween(0.8, 1.8), c = this.add.container(Phaser.Math.Between(0, 320), Phaser.Math.Between(10, 120)).setDepth(i % 3 === 0 ? 9 : 6)
        c.add([R(0, 4 * s, 34 * s, 3 * s, 0xd5e4f7), R(0, 0, 34 * s, 7 * s, 0xffffff), R(-6 * s, -4 * s, 20 * s, 6 * s, 0xffffff), R(6 * s, -6 * s, 14 * s, 6 * s, 0xffffff)])
        c.sp = 0.8 + s * 0.5; this.clouds.push(c)
      }

      // ---- rocket ----
      this.rocket = this.add.container(160, 128).setDepth(7)
      this.flame = this.add.container(0, 22).setVisible(false)
      this.flame.add([R(0, 6, 8, 10, 0xff7a1a), R(0, 4, 5, 8, 0xffd166), R(0, 3, 2, 6, 0xffffff)])
      const nose = []
      if (picks[0] === 0) [[2, -25], [4, -23], [6, -21], [8, -19], [10, -17]].forEach(([w, y]) => nose.push(R(0, y, w, 2, 0xe53935)))
      else if (picks[0] === 1) nose.push(R(0, -19, 8, 2, 0xdde6ff), R(0, -17, 10, 2, 0xdde6ff))
      else nose.push(R(0, -20, 12, 8, 0x9d4edd), R(-2, -20, 1, 8, 0x4b3aa8), R(2, -20, 1, 8, 0x4b3aa8), R(0, -20, 12, 1, 0x4b3aa8))
      this.rocket.add([this.flame, R(-7, 10, 4, 10, 0xe53935), R(7, 10, 4, 10, 0xe53935), R(0, 18, 6, 4, 0x555d7a),
        R(0, 0, 10, 32, 0xffffff), R(4, 0, 2, 32, 0xd3dcf0), R(0, 4, 10, 2, 0xe53935), R(0, 9, 10, 1, 0x9aa4c8),
        R(0, -8, 4, 4, 0x1e3a8a), R(-1, -9, 1, 1, 0xbfe3ff), ...nose])
      this.trail = this.add.particles(0, 0, 'px', { speed: { min: 10, max: 30 }, angle: { min: 80, max: 100 }, lifespan: 800, scale: { start: 3, end: 0.5 }, alpha: { start: 0.9, end: 0 }, tint: [0xffffff, 0xffd166, 0xff8a3d], frequency: 30, emitting: false }).setDepth(6.5)

      const st = { fontFamily: 'monospace', fontSize: '24px', color: '#ffffff', stroke: '#0a0830', strokeThickness: 4 }
      this.txt = this.add.text(160, 56, '', st).setOrigin(0.5).setDepth(20)
      this.msg = this.add.text(160, 22, '', { ...st, fontSize: '10px', strokeThickness: 3 }).setOrigin(0.5).setDepth(20)
      let n = 3
      this.time.addEvent({ delay: 700, repeat: 3, callback: () => { if (n > 0) this.txt.setText(String(n--)); else { this.txt.setText(''); this.ignite() } } })
    }
    update() {
      if (!this.ascending) return
      const p = this.prog || 0
      this.overlay.setAlpha(p * 0.92); this.stars.setAlpha(p)
      this.clouds.forEach(c => { c.y += 1.6 * c.sp; if (c.y > 195) { c.y = -12; c.x = Phaser.Math.Between(0, 320) } c.setAlpha(Math.max(0, 1 - Math.max(0, p - 0.55) * 2.5)) })
    }
    burst(x, y, tints, n = 40) { this.add.particles(x, y, 'px', { speed: { min: 30, max: 130 }, lifespan: 900, scale: { start: 3, end: 0 }, tint: tints, emitting: false }).setDepth(10).explode(n) }
    splash(x, y) {
      this.add.particles(x, y, 'px', { speed: { min: 30, max: 110 }, angle: { min: 240, max: 300 }, gravityY: 200, lifespan: 900, scale: { start: 3, end: 0 }, tint: [0xffffff, 0x9ad8ff, 0x2f86f0], emitting: false }).setDepth(10).explode(50)
      const ring = this.add.ellipse(x, y + 2, 10, 3).setStrokeStyle(1, 0xffffff).setDepth(10)
      this.tweens.add({ targets: ring, scale: 5, alpha: 0, duration: 900 })
    }
    ignite() {
      this.flame.setVisible(true); this.tweens.add({ targets: this.rocket, x: 161, yoyo: true, repeat: 14, duration: 50 })
      this.add.particles(160, 148, 'px', { speed: { min: 20, max: 70 }, angle: { min: 20, max: 160 }, lifespan: 1400, scale: { start: 3, end: 7 }, alpha: { start: 0.9, end: 0 }, frequency: 25, tint: 0xffffff }).setDepth(8)
      this.trail.start(); this.trail.startFollow(this.rocket, 0, 26)
      this.tweens.add({ targets: this.flame, scaleY: 1.6, yoyo: true, repeat: -1, duration: 90 })
      this.ascending = true
      this.tweens.addCounter({ from: 0, to: 1, duration: 3200, onUpdate: t => { this.prog = t.getValue() } })
      this.tweens.add({ targets: this.ground, y: 150, duration: 3200, ease: 'Sine.easeIn' })
      const rise = outcome === 'weight' ? 80 : outcome === 'fuel' ? 90 : 60
      this.tweens.add({ targets: this.rocket, y: rise, duration: 3200, ease: 'Sine.easeIn', onComplete: () => this.finish() })
    }
    crash() {
      this.trail.stop(); this.flame.setVisible(false); this.ascending = false
      this.tweens.add({ targets: [this.overlay, this.stars], alpha: 0, duration: 1800 })
      this.tweens.add({ targets: this.ground, y: 0, duration: 1800, ease: 'Quad.easeIn' })
      this.tweens.add({ targets: this.rocket, x: 275, y: 150, angle: 150, duration: 1800, ease: 'Quad.easeIn', onComplete: () => { this.rocket.setVisible(false); this.splash(275, 150) } })
    }
    finish() {
      const x = this.rocket.x, y = this.rocket.y, end = d => this.time.delayedCall(d, () => onDone(outcome))
      const flash = (cols) => { let t = 0; this.time.addEvent({ delay: 100, repeat: 7, callback: () => { this.rocket.list.forEach(o => o.setFillStyle && o.setFillStyle(cols[t % cols.length])); t++ } }) }
      if (outcome === 'win') {
        this.trail.stop()
        const b = this.add.rectangle(x, y + 10, 10, 12, 0xe53935).setDepth(7); this.tweens.add({ targets: b, y: 220, angle: 90, duration: 1600 })
        const s = this.add.container(x, y - 6).setDepth(8); s.add([this.add.rectangle(0, 0, 5, 5, 0xffd166), this.add.rectangle(-6, 0, 6, 3, 0x38bdf8), this.add.rectangle(6, 0, 6, 3, 0x38bdf8)])
        this.tweens.add({ targets: s, x: x + 70, y: y - 36, duration: 2200 })
        this.msg.setText('STAGE SEPARATION · SATELLITE DEPLOYED'); end(2600)
      } else if (outcome === 'drag') {
        this.msg.setText('MACH 1 · OVERHEAT!'); flash([0xff3300, 0xff9900])
        this.time.delayedCall(900, () => { this.trail.stop(); this.rocket.setVisible(false); this.burst(x, y, [0xff5522, 0xffaa00, 0xffffff, 0x9d4edd], 60);  }); end(2400)
      } else if (outcome === 'weight') {
        this.msg.setText('LOSING MOMENTUM… STALL'); this.crash(); end(2800)
      } else if (picks[3] === 2 || picks[2] === 2) {
        this.msg.setText('RE-ENTRY · BURNING UP'); flash([0xff6622, 0xffcc33])
        this.time.delayedCall(700, () => { this.trail.stop(); this.rocket.setVisible(false); this.burst(x, y + 20, [0xff5522, 0xffaa00, 0x9d4edd], 60) }); end(2200)
      } else { this.msg.setText('FUEL EXHAUSTED · FALLING'); this.crash(); end(2800) }
    }
  }
  return new Phaser.Game({ type: Phaser.AUTO, parent, width: 320, height: 180, pixelArt: true, banner: false, backgroundColor: '#2563c9', scale: { mode: Phaser.Scale.ENVELOP, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: Scene })
}