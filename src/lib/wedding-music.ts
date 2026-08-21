let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let scheduledTimer: ReturnType<typeof setTimeout> | null = null;
let isPlaying = false;

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function noteFreq(note: string): number {
  const notes: Record<string, number> = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  };
  return notes[note] || 440;
}

function playNote(ctx: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = "sine", vol = 0.15) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.05);
  gain.gain.setValueAtTime(vol, start + dur - 0.1);
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain);
  gain.connect(masterGain!);
  osc.start(start);
  osc.stop(start + dur);
}

function playChord(ctx: AudioContext, freqs: number[], start: number, dur: number, type: OscillatorType = "sine", vol = 0.08) {
  freqs.forEach(f => playNote(ctx, f, start, dur, type, vol));
}

type MelodyGenerator = (ctx: AudioContext, masterStart: number) => void;

const melodies: Record<string, { name: string; gen: MelodyGenerator }> = {
  wedding_classical: {
    name: "Wedding March",
    gen: (ctx, t) => {
      const beat = 0.4;
      const melody = [
        ["G4", 2], ["E4", 1], ["F4", 1], ["G4", 2], ["C4", 2],
        ["D4", 1], ["E4", 1], ["F4", 2], ["E4", 1], ["D4", 1],
        ["C4", 2], ["E4", 2], ["A4", 2], ["G4", 1], ["F4", 1],
        ["E4", 1], ["D4", 1], ["C4", 2], ["D4", 1], ["E4", 1],
      ];
      let time = t;
      const bassProg = [[261.63, 329.63], [349.23, 440], [392, 493.88], [261.63, 329.63]];
      melody.forEach(([note, len], i) => {
        const dur = (len as number) * beat;
        playNote(ctx, noteFreq(note as string), time, dur, "sine", 0.12);
        if (i % 8 === 0) {
          const b = bassProg[(i / 8) % bassProg.length];
          playChord(ctx, b, time, beat * 4, "sine", 0.05);
        }
        time += dur;
      });
    },
  },
  wedding_romantic: {
    name: "Romantic Love",
    gen: (ctx, t) => {
      const beat = 0.5;
      const chords = [
        [261.63, 329.63, 392],
        [349.23, 440, 523.25],
        [392, 493.88, 587.33],
        [261.63, 329.63, 392],
      ];
      const melody = ["E5", "D5", "C5", "D5", "E5", "G5", "E5", "D5", "C5", "E5", "D5", "C5"];
      let time = t;
      for (let rep = 0; rep < 4; rep++) {
        chords.forEach((ch, ci) => {
          playChord(ctx, ch, time, beat * 3, "sine", 0.06);
          for (let m = 0; m < 3; m++) {
            const noteI = (rep * 12 + ci * 3 + m) % melody.length;
            playNote(ctx, noteFreq(melody[noteI]), time + m * beat, beat, "sine", 0.1);
          }
          time += beat * 3;
        });
      }
    },
  },
  wedding_traditional: {
    name: "Traditional Khmer",
    gen: (ctx, t) => {
      const beat = 0.35;
      const penta = [261.63, 293.66, 329.63, 392, 440];
      const melody = [0, 2, 4, 3, 2, 1, 0, 2, 4, 2, 3, 1, 0, 2, 1, 0];
      let time = t;
      for (let rep = 0; rep < 6; rep++) {
        melody.forEach((ni) => {
          playNote(ctx, penta[ni], time, beat * 0.8, "triangle", 0.15);
          time += beat;
        });
        playChord(ctx, [penta[0], penta[2], penta[4]], t + rep * melody.length * beat, beat * 2, "sine", 0.04);
      }
    },
  },
  wedding_celebration: {
    name: "Celebration",
    gen: (ctx, t) => {
      const beat = 0.25;
      const melody = [
        "C5", "E5", "G5", "C5", "E5", "G5", "A5", "G5",
        "F5", "A5", "C5", "F5", "A5", "G5", "E5", "C5",
      ];
      let time = t;
      for (let rep = 0; rep < 4; rep++) {
        melody.forEach((note, i) => {
          const len = (i % 4 === 0) ? beat * 1.5 : beat;
          playNote(ctx, noteFreq(note), time, len, "square", 0.06);
          if (i % 2 === 0) playNote(ctx, noteFreq(note) / 2, time, beat, "sine", 0.08);
          time += beat;
        });
      }
    },
  },
  wedding_gentle: {
    name: "Gentle Piano",
    gen: (ctx, t) => {
      const beat = 0.6;
      const progression = [
        [261.63, 329.63, 392],
        [220, 277.18, 329.63],
        [246.94, 311.13, 370],
        [261.63, 329.63, 392],
      ];
      let time = t;
      for (let rep = 0; rep < 3; rep++) {
        progression.forEach((ch) => {
          ch.forEach((f, i) => {
            playNote(ctx, f, time + i * 0.1, beat * 2.5, "sine", 0.07);
          });
          const topNotes = [noteFreq("G4"), noteFreq("A4"), noteFreq("G4"), noteFreq("E4")];
          playNote(ctx, topNotes[Math.floor(Math.random() * 4)], time + 0.2, beat, "sine", 0.1);
          time += beat * 2;
        });
      }
    },
  },
  wedding_ethereal: {
    name: "Ethereal",
    gen: (ctx, t) => {
      const dur = 3;
      const chords = [
        [261.63, 329.63, 392, 523.25],
        [220, 277.18, 329.63, 440],
        [246.94, 311.13, 370, 493.88],
        [261.63, 329.63, 392, 523.25],
      ];
      let time = t;
      for (let rep = 0; rep < 2; rep++) {
        chords.forEach((ch) => {
          ch.forEach((f) => playNote(ctx, f, time, dur, "sine", 0.04));
          time += dur;
        });
      }
    },
  },
};

export function startBuiltinMusic(presetId: string) {
  stopMusic();
  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") audioCtx.resume();
  isPlaying = true;

  function loop() {
    if (!isPlaying) return;
    const gen = melodies[presetId];
    if (!gen) return;
    gen.gen(audioCtx, audioCtx.currentTime + 0.05);
    const totalBeats = 48;
    const loopMs = totalBeats * 350;
    scheduledTimer = setTimeout(loop, loopMs - 500);
  }
  loop();
}

export function stopMusic() {
  isPlaying = false;
  if (scheduledTimer) clearTimeout(scheduledTimer);
  scheduledTimer = null;
}

export function resumeMusic() {
  isPlaying = true;
  const gen = melodies[Object.keys(melodies).find(k => true) || ""];
  if (ctx && ctx.state === "suspended") ctx.resume();
}

export function pauseMusic() {
  isPlaying = false;
  if (scheduledTimer) clearTimeout(scheduledTimer);
}

export function isBuiltinMusic(id: string): boolean {
  return !!melodies[id];
}

export const musicPresetList = Object.entries(melodies).map(([id, m]) => ({ id, name: m.name }));
