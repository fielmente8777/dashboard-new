// TRIAL (2026-11-25): "Clear voice" for call recordings. If the team keeps it, keep this file;
// to take it out, delete this file and the "Clear voice" switch in
// pages/Calls/components/RecordingPlayer.jsx.
//
// Cleans a recording in the browser, nothing goes to the server:
//  1. a speech band: cuts rumble and hum below 150 Hz and hiss above 3.6 kHz (a phone call
//     carries no voice outside that), and lifts 2-3 kHz a little so words are clearer;
//  2. a compressor, so the quiet far side and the loud near side come out closer in volume;
//  3. a noise gate: the background between words is turned down (to about a sixth), using the
//     recording's own quietest parts as the measure of its noise;
//  4. the whole thing raised to a steady loudness.
// It can't bring back a voice the line lost; it makes what is there easier to hear.
export class VoiceCleaner {
  static FRAME_SECONDS = 0.02;
  static GATE_FLOOR = 0.16; // how far the background is turned down (1 = not at all)

  // Blob (mp3 ...) -> Blob (wav) of the cleaned recording
  async clean(blob) {
    const decoded = await this.decode(await blob.arrayBuffer());
    const filtered = await this.filter(decoded);
    const samples = filtered.getChannelData(0);
    this.gate(samples, filtered.sampleRate);
    this.normalize(samples);
    return VoiceCleaner.toWav(samples, filtered.sampleRate);
  }

  async decode(data) {
    const Context = window.AudioContext || window.webkitAudioContext;
    const context = new Context();
    try {
      return await context.decodeAudioData(data);
    } finally {
      context.close();
    }
  }

  // the speech band and the compressor, rendered offline (faster than playing it)
  async filter(buffer) {
    const offline = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
    const source = offline.createBufferSource();
    source.buffer = buffer;

    const node = (type, frequency, extra = {}) => {
      const filter = offline.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = frequency;
      if (extra.Q) filter.Q.value = extra.Q;
      if (extra.gain) filter.gain.value = extra.gain;
      return filter;
    };
    const highpass = node("highpass", 150, { Q: 0.7 });
    const lowpass = node("lowpass", 3600, { Q: 0.7 });
    const presence = node("peaking", 2500, { Q: 1, gain: 4 });

    const compressor = offline.createDynamicsCompressor();
    compressor.threshold.value = -30;
    compressor.knee.value = 20;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.2;

    source.connect(highpass).connect(lowpass).connect(presence).connect(compressor).connect(offline.destination);
    source.start();
    return offline.startRendering();
  }

  // turns down the frames quieter than the noise (the background between words)
  gate(samples, sampleRate) {
    const size = Math.max(1, Math.round(sampleRate * VoiceCleaner.FRAME_SECONDS));
    const frames = Math.ceil(samples.length / size);
    const levels = new Float32Array(frames);
    for (let f = 0; f < frames; f++) {
      let sum = 0;
      const end = Math.min(samples.length, (f + 1) * size);
      for (let i = f * size; i < end; i++) sum += samples[i] * samples[i];
      levels[f] = Math.sqrt(sum / Math.max(1, end - f * size));
    }

    // the noise: the level of the quietest 15 % of the recording
    const sorted = Array.from(levels).sort((a, b) => a - b);
    const noise = sorted[Math.floor(sorted.length * 0.15)] || 0;
    const threshold = Math.max(noise * 2.5, 0.002);

    // per frame: open fast when someone speaks, close slowly (no chopped word endings)
    const gains = new Float32Array(frames);
    let gain = 1;
    for (let f = 0; f < frames; f++) {
      const target = levels[f] > threshold ? 1 : VoiceCleaner.GATE_FLOOR;
      gain += (target - gain) * (target > gain ? 0.6 : 0.12);
      gains[f] = gain;
    }

    // applied smoothly, sample by sample, between frame centres
    for (let i = 0; i < samples.length; i++) {
      const position = i / size - 0.5;
      const f = Math.max(0, Math.min(frames - 1, Math.floor(position)));
      const next = Math.min(frames - 1, f + 1);
      const t = Math.max(0, Math.min(1, position - f));
      samples[i] *= gains[f] + (gains[next] - gains[f]) * t;
    }
  }

  // peak to 95 %, at most 6x louder
  normalize(samples) {
    let peak = 0;
    for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
    if (!peak) return;
    const gain = Math.min(0.95 / peak, 6);
    for (let i = 0; i < samples.length; i++) samples[i] *= gain;
  }

  // 16-bit mono WAV
  static toWav(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const text = (offset, value) => {
      for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
    };
    text(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    text(8, "WAVE");
    text(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    text(36, "data");
    view.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([buffer], { type: "audio/wav" });
  }
}

export const voiceCleaner = new VoiceCleaner();
