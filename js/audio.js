class SoundscapeEngine {
  constructor() {
    this.ctx = null;
    this.oscillators = [];
    this.gainNodes = [];
    this.lfoNodes = [];
    this.noiseNode = null;
    this.filterNode = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.currentConfig = null;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not available');
      return false;
    }
    return true;
  }

  start(config) {
    if (!this.ctx) {
      if (!this.init()) return;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop();
    this.currentConfig = config;

    const now = this.ctx.currentTime;

    if (config.type === 'noise') {
      this.createNoiseScape(config, now);
    } else if (config.type === 'pulse') {
      this.createPulseScape(config, now);
    } else {
      this.createTonalScape(config, now);
    }

    this.isPlaying = true;
  }

  createTonalScape(config, now) {
    config.chords.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = config.wave;
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 10;

      lfo.frequency.value = config.lfoRate + Math.random() * 0.05;
      lfoGain.gain.value = config.lfoDepth;

      filter.type = 'lowpass';
      filter.frequency.value = config.filterFreq;
      filter.Q.value = 2;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.12 / config.chords.length, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      lfo.start(now);

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
      this.lfoNodes.push(lfo);
      this.lfoNodes.push(lfoGain);
    });
  }

  createPulseScape(config, now) {
    const pulseRate = config.lfoRate; // e.g., 2Hz = 120bpm feel
    config.chords.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const pulseLfo = this.ctx.createOscillator();
      const pulseLfoGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = config.wave;
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 5;

      // Pulse LFO modulates gain (creates rhythmic throbbing)
      pulseLfo.frequency.value = pulseRate + (i * 0.1);
      pulseLfoGain.gain.value = 0.5;

      filter.type = 'lowpass';
      filter.frequency.value = config.filterFreq;
      filter.Q.value = 3;

      pulseLfo.connect(pulseLfoGain);
      pulseLfoGain.connect(gain.gain);

      gain.gain.value = 0.06;
      gain.gain.linearRampToValueAtTime(0.1 / config.chords.length, now + 1.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      pulseLfo.start(now);

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
      this.lfoNodes.push(pulseLfo, pulseLfoGain);
    });
  }

  createNoiseScape(config, now) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = config.filterFreq;
    filter.Q.value = 1;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(0.06, now + 2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);

    this.noiseNode = noise;
    this.filterNode = filter;
    this.gainNodes.push(gain);

    // Add subtle tonal element
    config.chords.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      oscGain.gain.value = 0;
      oscGain.gain.linearRampToValueAtTime(0.04, now + 2);

      const oscFilter = this.ctx.createBiquadFilter();
      oscFilter.type = 'lowpass';
      oscFilter.frequency.value = config.filterFreq * 0.5;

      osc.connect(oscFilter);
      oscFilter.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);

      this.oscillators.push(osc);
      this.gainNodes.push(oscGain);
    });
  }

  stop() {
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.gainNodes.forEach(g => {
      try { g.gain.linearRampToValueAtTime(0, now + 0.5); } catch(e) {}
    });
    this.oscillators.forEach(o => {
      try { o.stop(now + 0.6); } catch(e) {}
    });
    this.lfoNodes.forEach(l => {
      try { l.stop(now + 0.6); } catch(e) {}
    });
    if (this.noiseNode) {
      try { this.noiseNode.stop(now + 0.6); } catch(e) {}
    }

    this.oscillators = [];
    this.gainNodes = [];
    this.lfoNodes = [];
    this.noiseNode = null;
    this.filterNode = null;
    this.isPlaying = false;
  }

  setVolume(v) {
    if (this.masterGain) {
      this.masterGain.gain.value = v * 0.3;
    }
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

class AudioManager {
  constructor() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.currentMood = null;
    this.currentSource = 'default';
    this.uploadedBlobUrl = null;
    this.volume = 0.8;
    this.audio.volume = this.volume;
    this.fadeInterval = null;
    this.dbReady = false;
    this.db = null;
    this.soundscape = new SoundscapeEngine();

    this.initDB();
  }

  initDB() {
    if (!window.indexedDB) {
      console.warn('IndexedDB not available, MP3 upload disabled');
      return;
    }
    const request = indexedDB.open('MoodAtmosphereDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('audioFiles')) {
        db.createObjectStore('audioFiles', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => {
      this.db = e.target.result;
      this.dbReady = true;
    };
    request.onerror = () => {
      console.warn('IndexedDB open failed, MP3 upload disabled');
    };
  }

  async saveToDB(moodId, fileName, blob) {
    if (!this.dbReady) return false;
    return new Promise((resolve) => {
      const tx = this.db.transaction('audioFiles', 'readwrite');
      const store = tx.objectStore('audioFiles');
      store.put({ id: moodId, fileName, blob });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }

  async loadFromDB(moodId) {
    if (!this.dbReady) return null;
    return new Promise((resolve) => {
      const tx = this.db.transaction('audioFiles', 'readonly');
      const store = tx.objectStore('audioFiles');
      const req = store.get(moodId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async switchMood(moodId, preset, customSettings) {
    this.currentMood = moodId;
    const source = customSettings?.musicSource || 'default';
    this.currentSource = source;
    this.volume = (customSettings?.volume ?? 80) / 100;

    // Stop any existing playback
    this.stopAll();

    if (source === 'uploaded' && customSettings?.customMusicName) {
      const stored = await this.loadFromDB(moodId);
      if (stored && stored.blob) {
        if (this.uploadedBlobUrl) URL.revokeObjectURL(this.uploadedBlobUrl);
        this.uploadedBlobUrl = URL.createObjectURL(stored.blob);
        this.playAudioElement(this.uploadedBlobUrl);
        return;
      }
      // Fall back to default if uploaded not found
    }

    // Default: play MP3 audio file, fall back to soundscape
    if (preset.audioFile) {
      this.playAudioElement(preset.audioFile);
    } else {
      this.playSoundscape(preset.soundscape);
    }
  }

  playSoundscape(config) {
    this.audio.pause();
    this.soundscape.setVolume(this.volume);
    this.soundscape.start(config);
  }

  playAudioElement(url) {
    this.soundscape.stop();
    this.audio.volume = this.volume;
    this.audio.src = url;
    this.audio.play().catch(() => {});
  }

  stopAll() {
    this.soundscape.stop();
    this.audio.pause();
    if (this.fadeInterval) clearInterval(this.fadeInterval);
  }

  crossfadeTo(url, duration = 2000) {
    this.soundscape.stop();
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    const startVolume = this.audio.volume;
    const steps = 20;
    const stepTime = duration / 2 / steps;
    let step = 0;

    this.fadeInterval = setInterval(() => {
      step++;
      this.audio.volume = Math.max(0, startVolume * (1 - step / steps));
      if (step >= steps) {
        clearInterval(this.fadeInterval);
        this.audio.src = url;
        this.audio.play().catch(() => {});
        let fadeIn = 0;
        this.fadeInterval = setInterval(() => {
          fadeIn++;
          this.audio.volume = Math.min(this.volume, this.volume * (fadeIn / steps));
          if (fadeIn >= steps) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
        }, stepTime);
      }
    }, stepTime);
  }

  async handleUpload(moodId, file) {
    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
      return { success: false, error: '请选择 MP3 音频文件' };
    }
    if (file.size > 15 * 1024 * 1024) {
      return { success: false, error: '文件不能超过 15MB' };
    }

    const saved = await this.saveToDB(moodId, file.name, file);
    if (!saved && this.dbReady) {
      return { success: false, error: '保存失败，请重试' };
    }

    if (this.uploadedBlobUrl) URL.revokeObjectURL(this.uploadedBlobUrl);
    this.uploadedBlobUrl = URL.createObjectURL(file);
    this.currentSource = 'uploaded';
    this.playAudioElement(this.uploadedBlobUrl);

    return { success: true, fileName: file.name };
  }

  togglePlay() {
    // For soundscape: resume/suspend AudioContext
    if (this.soundscape.isPlaying && this.soundscape.ctx) {
      if (this.soundscape.ctx.state === 'running') {
        this.soundscape.ctx.suspend();
      } else {
        this.soundscape.ctx.resume();
      }
    }
    // For audio element
    if (this.audio.src && !this.soundscape.isPlaying) {
      if (this.audio.paused) {
        this.audio.play().catch(() => {});
      } else {
        this.audio.pause();
      }
    }
  }

  isPlaying() {
    if (this.soundscape.isPlaying && this.soundscape.ctx) {
      return this.soundscape.ctx.state === 'running';
    }
    return !this.audio.paused && this.audio.src;
  }

  setVolume(v) {
    this.volume = v;
    this.soundscape.setVolume(v);
    this.audio.volume = v;
  }

  useDefault(preset) {
    this.currentSource = 'default';
    this.stopAll();
    this.playSoundscape(preset.soundscape);
  }
}
