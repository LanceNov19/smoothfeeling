const PRESETS = {
  relax: {
    id: 'relax',
    name: '放松',
    emoji: '🌿',
    color1: '#a8e6cf',
    color2: '#3b8d99',
    slogan: '深呼吸，让一切慢下来',
    audioFile: 'audio/relax.mp3',
    soundscape: {
      type: 'pad',
      baseFreq: 261.63,    // C4
      chords: [261.63, 329.63, 392.00],  // C major
      wave: 'sine',
      lfoRate: 0.15,
      lfoDepth: 8,
      filterFreq: 800
    },
    particleConfig: {
      shape: 'circle',
      speed: { min: 0.2, max: 0.5 },
      direction: 'random',
      particleColors: ['#a8e6cf', '#3b8d99', '#dcf2e6', '#ffffff'],
      size: { min: 3, max: 8 },
      opacity: { min: 0.3, max: 0.7 }
    }
  },

  emo: {
    id: 'emo',
    name: 'emo',
    emoji: '🌧️',
    color1: '#2d1b69',
    color2: '#0f0c29',
    slogan: '有些情绪需要被看见',
    audioFile: 'audio/emo.mp3',
    soundscape: {
      type: 'drone',
      baseFreq: 220.00,    // A3
      chords: [220.00, 261.63, 329.63],  // A minor
      wave: 'sawtooth',
      lfoRate: 0.08,
      lfoDepth: 4,
      filterFreq: 400
    },
    particleConfig: {
      shape: 'line',
      speed: { min: 1.0, max: 2.0 },
      direction: 'down',
      particleColors: ['#6c5ce7', '#a29bfe', '#81ecec'],
      size: { min: 1, max: 3 },
      opacity: { min: 0.4, max: 0.8 }
    }
  },

  firedUp: {
    id: 'firedUp',
    name: '热血',
    emoji: '🔥',
    color1: '#f12711',
    color2: '#f5af19',
    slogan: '全力以赴，不留遗憾',
    audioFile: 'audio/fired-up.mp3',
    soundscape: {
      type: 'pulse',
      baseFreq: 329.63,    // E4
      chords: [329.63, 392.00, 493.88],  // E major?
      wave: 'square',
      lfoRate: 2.0,
      lfoDepth: 12,
      filterFreq: 1200
    },
    particleConfig: {
      shape: 'circle',
      speed: { min: 0.8, max: 2.0 },
      direction: 'up',
      particleColors: ['#f12711', '#f5af19', '#ff6b35', '#ffd700'],
      size: { min: 2, max: 6 },
      opacity: { min: 0.5, max: 1.0 }
    }
  },

  zoneOut: {
    id: 'zoneOut',
    name: '发呆',
    emoji: '☁️',
    color1: '#e8cbc0',
    color2: '#636fa4',
    slogan: '放空也是一种充电',
    audioFile: 'audio/zone-out.mp3',
    soundscape: {
      type: 'noise',
      baseFreq: 392.00,    // G4
      chords: [392.00, 493.88, 587.33],  // G major
      wave: 'sine',
      lfoRate: 0.05,
      lfoDepth: 3,
      filterFreq: 600
    },
    particleConfig: {
      shape: 'circle',
      speed: { min: 0.1, max: 0.3 },
      direction: 'random',
      particleColors: ['#e8cbc0', '#c9d6ff', '#e2e2e2', '#ffffff'],
      size: { min: 5, max: 15 },
      opacity: { min: 0.2, max: 0.5 }
    }
  }
};

const MOOD_IDS = ['relax', 'emo', 'firedUp', 'zoneOut'];
const DEFAULT_MOOD = 'relax';
