const ctx = new (window.AudioContext || window.webkitAudioContext)()
// unlockAudioContext(ctx);
const fft = new AnalyserNode(ctx, { fftSize: 2048 })
createWaveCanvas({ element: 'section', analyser: fft })


function tone(type, pitch, time, duration) {
  const t = time || ctx.currentTime
  const dur = duration || 1
  const osc = new OscillatorNode(ctx, {
    type: type || 'sine',
    frequency: pitch || 440
  })
  const lvl = new GainNode(ctx, { gain: 0.001 })
  osc.connect(lvl)
  lvl.connect(ctx.destination)
  lvl.connect(fft)
  osc.start(t)
  osc.stop(t + dur)
  adsr({
    param: lvl.gain,
    time: t,
    duration: dur
  })
}
function adsr (opts) {
  const param = opts.param
  const peak = opts.peak || 0.2
  const hold = opts.peak || 0.1
  const time = opts.time || ctx.currentTime
  const dur = opts.duration || 1
  const a = opts.attack || 0.2 * dur
  const d = opts.decay || 0.1 * dur
  const s = opts.sustain || 0.5 * dur
  const r = opts.release || 0.2 * dur

  const initVal = param.value
  param.setValueAtTime(initVal, time)
  param.linearRampToValueAtTime(peak, time+a)
  param.linearRampToValueAtTime(hold, time+a+d)
  param.linearRampToValueAtTime(hold, time+a+d+s)
  param.linearRampToValueAtTime(initVal, time+a+d+s+r)
}
function step (rootFreq, steps) {
  let tr2 = Math.pow(2, 1/12)
  let rnd = rootFreq * Math.pow(tr2, steps)
  return Math.round(rnd * 100) /100
}
function r (scale) {
  return Math.floor(Math.random() * scale.length)
}

const major = [0, 2, 4, 5, 7, 9, 11, 12]
const minor = [0, 2, 3, 5, 7, 8, 10, 12]

const delayStart = 1
const tempo = 140 * 2
const beat = 60 / tempo
const bar = beat * 4
const root = 440
const majorNotes = [
  0,0,2,0,
  4,11,r(major),9,
  11,9,r(major),12,
  9,r(major),9,12
]
const minorNotes = [
  5,5,3,5,
  3,r(minor),3,5,
  3,3,5,3,
  3,0,0,0,
  3,0,0,0
]

const types1 = ['sawtooth','square']
const types2 = ['sine','triangle']

function playMajor() {
  for (j=0; j<3; j++) {
    const delayj = j * bar
    for (i = 0; i < majorNotes.length; i++) {
        const time = i * beat + delayStart + delayj
        const dur = beat
        const pitch = step(root, majorNotes[i])
        type = types1[Math.floor(Math.random() * types1.length)]
        tone(type, pitch, time, dur)
    }
  }
}

function playMinor() {
  for (i = 0; i < minorNotes.length; i++) {
      const time = i * beat
      const dur = beat + 1
      const pitch = step(root, minorNotes[i])
      type = types2[Math.floor(Math.random() * types2.length)]
      tone(type, pitch, time, dur)
  }


  const whiteBuffer = ctx.createBuffer(2, ctx.sampleRate*1, ctx.sampleRate)
  for (let ch=0; ch<whiteBuffer.numberOfChannels; ch++) {
      let samples = whiteBuffer.getChannelData(ch)
      for (let s=0; s<whiteBuffer.length; s++) samples[s] = Math.random()*2-1
  }

  let white = new AudioBufferSourceNode(ctx, {buffer:whiteBuffer})
  white.connect(ctx.destination)
  white.connect(fft)
  white.start(ctx.currentTime+6)
  
}


// function unlockAudioContext(ctx) {
//   if (ctx.state !== 'suspended') return;
//   const b = document.body;
//   const events = ['touchstart','touchend', 'mousedown','keydown'];
//   events.forEach(e => b.addEventListener(e, unlock, false));
//   function unlock() { ctx.resume().then(clean); }
//   function clean() { events.forEach(e => b.removeEventListener(e, unlock)); }
// }

