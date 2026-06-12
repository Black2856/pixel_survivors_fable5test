// audio.js — 音楽再生(HTMLAudio) + 効果音シンセ(WebAudio)
(function () {
  'use strict';

  const MUSIC = {
    title:  'music/title-menu.mp3',
    field1: 'music/field1.mp3',
    field2: 'music/field2.mp3',
    field3: 'music/field3.mp3',
    boss1:  'music/boss1.mp3',
    boss2:  'music/boss2.mp3',
    boss3:  'music/boss3.mp3',
  };

  const A = {
    ctx: null,
    unlocked: false,
    muted: false,
    music: null,
    musicName: null,
    musicVol: 0.55,

    unlock() {
      if (!this.unlocked) {
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          this.unlocked = true;
        } catch (e) { /* WebAudio非対応でも音楽以外は動く */ }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    toggleMute() {
      this.muted = !this.muted;
      if (this.music) this.music.volume = this.muted ? 0 : this.musicVol;
      return this.muted;
    },

    _ramp(el, to, dur, done) {
      if (el._iv) clearInterval(el._iv);
      const from = el.volume, t0 = performance.now();
      el._iv = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / (dur * 1000));
        el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
        if (k >= 1) { clearInterval(el._iv); el._iv = null; if (done) done(); }
      }, 33);
    },

    playMusic(name, fade = 0.8) {
      if (this.musicName === name) return;
      this.musicName = name;
      const old = this.music;
      if (old) this._ramp(old, 0, fade, () => { old.pause(); old.src = ''; });
      const el = new Audio(MUSIC[name]);
      el.loop = true;
      el.volume = 0;
      this.music = el;
      const p = el.play();
      if (p) p.catch(() => { this.musicName = null; }); // 自動再生ブロック時は次の操作で再試行
      if (!this.muted) this._ramp(el, this.musicVol, fade);
    },

    stopMusic(fade = 0.8) {
      if (this.music) {
        const old = this.music;
        this._ramp(old, 0, fade, () => { old.pause(); old.src = ''; });
        this.music = null;
        this.musicName = null;
      }
    },

    pauseMusic() { if (this.music) this.music.pause(); },
    resumeMusic() { if (this.music) this.music.play().catch(() => {}); },

    // ---------- SFXシンセ ----------
    tone(f0, f1, dur, opt = {}) {
      if (!this.ctx || this.muted) return;
      const c = this.ctx, t = c.currentTime + (opt.delay || 0);
      const o = c.createOscillator(), g = c.createGain();
      o.type = opt.type || 'square';
      o.frequency.setValueAtTime(Math.max(1, f0), t);
      o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
      g.gain.setValueAtTime(opt.vol || 0.15, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.02);
    },

    noise(dur, opt = {}) {
      if (!this.ctx || this.muted) return;
      const c = this.ctx, t = c.currentTime + (opt.delay || 0);
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf;
      const flt = c.createBiquadFilter(); flt.type = 'lowpass';
      flt.frequency.setValueAtTime(opt.f || 900, t);
      flt.frequency.exponentialRampToValueAtTime(80, t + dur);
      const g = c.createGain();
      g.gain.setValueAtTime(opt.vol || 0.2, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(flt); flt.connect(g); g.connect(c.destination);
      src.start(t);
    },

    // ---------- ゲーム用SFX ----------
    shoot()  { this.tone(900, 320, 0.07, { vol: 0.04 }); },
    hit()    { this.tone(230, 140, 0.05, { type: 'sawtooth', vol: 0.05 }); },
    kill()   { this.tone(330, 70, 0.16, { type: 'sawtooth', vol: 0.1 }); this.noise(0.1, { vol: 0.05, f: 600 }); },
    gem(n)   {
      const p = 660 + Math.min(n || 0, 24) * 55;
      this.tone(p, p, 0.05, { type: 'sine', vol: 0.09 });
      this.tone(p * 1.4, p * 1.4, 0.1, { type: 'sine', vol: 0.09, delay: 0.05 });
    },
    levelup() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 0.13, { vol: 0.12, delay: i * 0.09 })); },
    chest()  { [392, 494, 587, 784, 988].forEach((f, i) => this.tone(f, f, 0.12, { vol: 0.12, delay: i * 0.08 })); },
    hurt()   { this.tone(280, 80, 0.22, { type: 'sawtooth', vol: 0.22 }); this.noise(0.15, { vol: 0.12, f: 500 }); },
    boom()   { this.noise(0.5, { vol: 0.3, f: 350 }); this.tone(150, 38, 0.5, { type: 'sawtooth', vol: 0.2 }); },
    zap()    { this.tone(1900, 180, 0.14, { type: 'sawtooth', vol: 0.1 }); this.noise(0.08, { vol: 0.07, f: 2200 }); },
    roar()   { this.tone(110, 42, 0.7, { type: 'sawtooth', vol: 0.28 }); this.noise(0.6, { vol: 0.16, f: 280 }); },
    warning(){ this.tone(190, 190, 0.18, { type: 'square', vol: 0.18 }); this.tone(190, 190, 0.18, { type: 'square', vol: 0.18, delay: 0.26 }); },
    click()  { this.tone(620, 620, 0.04, { vol: 0.07 }); },
    select() { this.tone(880, 1320, 0.1, { vol: 0.12 }); },
    heal()   { this.tone(520, 1040, 0.18, { type: 'sine', vol: 0.14 }); },
    magnetS(){ this.tone(300, 1600, 0.3, { type: 'sine', vol: 0.14 }); },
    fireS()  { this.noise(0.12, { vol: 0.05, f: 1400 }); this.tone(320, 140, 0.12, { type: 'sawtooth', vol: 0.04 }); },
    blizzS() { this.noise(0.45, { vol: 0.07, f: 800 }); this.tone(950, 380, 0.35, { type: 'sine', vol: 0.04 }); },
    slashS() { this.noise(0.08, { vol: 0.09, f: 2600 }); this.tone(820, 240, 0.06, { type: 'sawtooth', vol: 0.05 }); },
    bholeS() { this.tone(900, 50, 0.55, { type: 'sine', vol: 0.14 }); this.noise(0.4, { vol: 0.08, f: 240 }); },
    artifact(){ [330, 415, 523, 659, 880, 1108].forEach((f, i) => this.tone(f, f, 0.16, { vol: 0.12, delay: i * 0.07 })); },
    death()  { this.tone(420, 40, 1.0, { type: 'sawtooth', vol: 0.25 }); this.noise(0.8, { vol: 0.2, f: 400 }); },
  };

  window.AudioMan = A;
})();
