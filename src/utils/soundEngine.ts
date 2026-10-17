// Procedural Synthesizer using Native Web Audio API
// Zero external audio files required, fully client-side and safe.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Browser autoplay policy might reject until user gesture
    });
  }

  return audioCtx;
}

/**
 * Play a gentle pentatonic chime note
 */
export function playChime(isMuted: boolean, freq = 523.25) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Envelope: quick attack, smooth exponential decay
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  } catch (err) {
    console.debug('Audio playback suppressed or unavailable', err);
  }
}

/**
 * Play a crisp crystalline harmonic click when a puzzle shard snaps into place
 */
export function playSnap(isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Fundamental
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1046.5, now); // C6
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2093.0, now); // C7

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.26);
    osc2.stop(now + 0.26);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

/**
 * Play an ascending arpeggio when completing a project, star discovery, or celestial event
 * Notes: C5 (523.25), E5 (659.25), G5 (783.99), B5 (987.77), C6 (1046.50)
 */
export function playSparkle(isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.14, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  } catch (err) {
    console.debug('Audio error', err);
  }
}

/**
 * Play a soft gentle whoosh for flight or navigation
 */
export function playWhoosh(isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.5);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.52);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

/**
 * Play a minor soft tap for error or incorrect puzzle placement
 */
export function playGentleNudge(isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// Shared echo bus so music-box notes ring out like a tiny tin comb in a big dome.
let musicBoxBus: GainNode | null = null;

function getMusicBoxBus(ctx: AudioContext): GainNode {
  if (musicBoxBus) return musicBoxBus;
  const input = ctx.createGain();
  const delay = ctx.createDelay(1);
  const feedback = ctx.createGain();
  const wet = ctx.createGain();

  delay.delayTime.value = 0.28;
  feedback.gain.value = 0.32;
  wet.gain.value = 0.35;

  input.connect(ctx.destination);
  input.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(ctx.destination);

  musicBoxBus = input;
  return input;
}

/**
 * Play one music-box note: a bright sine tine plus a soft inharmonic overtone and a long decay.
 */
export function playMusicBoxNote(isMuted: boolean, freq: number, volume = 0.16) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bus = getMusicBoxBus(ctx);
    const gain = ctx.createGain();
    const tine = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();

    tine.type = 'sine';
    tine.frequency.setValueAtTime(freq, now);
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(freq * 4.2, now);
    shimmerGain.gain.setValueAtTime(0.25, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    tine.connect(gain);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(gain);
    gain.connect(bus);

    tine.start(now);
    shimmer.start(now);
    tine.stop(now + 1.65);
    shimmer.stop(now + 0.35);
  } catch (err) {
    console.debug('Audio error', err);
  }
}
