(function () {
  'use strict';

  // ===== State =====
  let currentMood = DEFAULT_MOOD;
  let particleEngine = null;
  let audioManager = null;
  let moodTimers = { relax: 0, emo: 0, firedUp: 0, zoneOut: 0 };
  let tickInterval = null;

  // ===== DOM refs =====
  const $ = (sel) => document.querySelector(sel);
  const gradientOverlay = $('#gradientOverlay');
  const sloganText = $('#sloganText');
  const sloganInput = $('#sloganInput');
  const musicName = $('#musicName');
  const musicStatus = $('#musicStatus');
  const playPauseBtn = $('#playPauseBtn');
  const volumeSlider = $('#volumeSlider');
  const moodBtns = document.querySelectorAll('.mood-btn');
  const settingsBtn = $('#settingsBtn');
  const settingsPanel = $('#settingsPanel');
  const panelOverlay = $('#panelOverlay');
  const panelColor1 = $('#panelColor1');
  const panelColor2 = $('#panelColor2');
  const panelSlogan = $('#panelSlogan');
  const panelVolume = $('#panelVolume');
  const panelDensity = $('#panelDensity');
  const volumeLabel = $('#volumeLabel');
  const densityLabel = $('#densityLabel');
  const panelMoodLabel = $('#panelMoodLabel');
  const uploadBtn = $('#uploadBtn');
  const mp3Upload = $('#mp3Upload');
  const uploadFileName = $('#uploadFileName');
  const resetDefaultsBtn = $('#resetDefaultsBtn');
  const closePanelBtn = $('#closePanelBtn');
  const toast = $('#toast');
  const clockDisplay = $('#clockDisplay');
  const timerItems = document.querySelectorAll('.timer-item');

  // ===== localStorage helpers =====
  function loadSettings() {
    try {
      const raw = localStorage.getItem('moodSettings');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* localStorage not available */ }
    return null;
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem('moodSettings', JSON.stringify(settings));
    } catch (e) { /* silently fail */ }
  }

  function getStoredOrDefault() {
    const stored = loadSettings();
    if (!stored) {
      const defaults = { currentMood: DEFAULT_MOOD };
      MOOD_IDS.forEach(id => {
        defaults[id] = {
          color1: PRESETS[id].color1,
          color2: PRESETS[id].color2,
          slogan: PRESETS[id].slogan,
          particleDensity: 40,
          customMusicName: null,
          musicSource: 'default',
          volume: 80
        };
      });
      return defaults;
    }
    MOOD_IDS.forEach(id => {
      if (!stored[id]) {
        stored[id] = {
          color1: PRESETS[id].color1,
          color2: PRESETS[id].color2,
          slogan: PRESETS[id].slogan,
          particleDensity: 40,
          customMusicName: null,
          musicSource: 'default',
          volume: 80
        };
      }
    });
    return stored;
  }

  // ===== Timer helpers =====
  function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }

  function loadTimers() {
    try {
      const raw = localStorage.getItem('moodTimers');
      if (raw) {
        const parsed = JSON.parse(raw);
        moodTimers = { relax: 0, emo: 0, firedUp: 0, zoneOut: 0, ...parsed };
      }
    } catch (e) { /* use defaults */ }
  }

  function saveTimers() {
    try {
      localStorage.setItem('moodTimers', JSON.stringify(moodTimers));
    } catch (e) { /* silently fail */ }
  }

  function updateTimerDisplay() {
    timerItems.forEach(item => {
      const mood = item.dataset.mood;
      const valueEl = item.querySelector('.timer-value');
      if (valueEl) {
        valueEl.textContent = formatTime(moodTimers[mood] || 0);
      }
      item.classList.toggle('active-timer', mood === currentMood);
    });
  }

  function updateClock() {
    clockDisplay.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  }

  function tick() {
    updateClock();
    moodTimers[currentMood] = (moodTimers[currentMood] || 0) + 1;
    updateTimerDisplay();
  }

  function startTick() {
    stopTick();
    updateClock();
    updateTimerDisplay();
    tickInterval = setInterval(tick, 1000);
  }

  function stopTick() {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  }

  // ===== Toast =====
  let toastTimer;
  function showToast(msg, duration = 2500) {
    toast.textContent = msg;
    toast.className = 'toast-visible';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast-hidden'; }, duration);
  }

  // ===== Apply mood =====
  function applyMood(moodId, settings) {
    const preset = PRESETS[moodId];
    const custom = settings[moodId];

    // Gradient
    gradientOverlay.style.background =
      `linear-gradient(135deg, ${custom.color1} 0%, ${custom.color2} 100%)`;

    // Particles
    if (particleEngine && !particleEngine.disabled) {
      particleEngine.setConfig(preset.particleConfig, custom.particleDensity);
    }

    // Slogan
    sloganText.textContent = custom.slogan;
    sloganInput.value = custom.slogan;

    // Music
    if (audioManager) {
      audioManager.switchMood(moodId, preset, custom);
      musicName.textContent = custom.musicSource === 'uploaded'
        ? (custom.customMusicName || '自定义音乐')
        : (preset.name + ' · 环境音效');
    }

    // Music player UI
    volumeSlider.value = custom.volume;
    updatePlayPauseIcon();

    // Mood buttons
    moodBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === moodId);
    });

    currentMood = moodId;
    // Update timer active state
    updateTimerDisplay();
  }

  function updatePlayPauseIcon() {
    if (audioManager && audioManager.isPlaying()) {
      playPauseBtn.textContent = '⏸';
      musicStatus.textContent = '♫';
    } else {
      playPauseBtn.textContent = '▶';
      musicStatus.textContent = '⏹';
    }
  }

  // ===== Settings panel =====
  function openPanel() {
    const settings = getStoredOrDefault();
    const custom = settings[currentMood];

    panelMoodLabel.textContent = PRESETS[currentMood].name;
    panelColor1.value = custom.color1;
    panelColor2.value = custom.color2;
    panelSlogan.value = custom.slogan;
    panelVolume.value = custom.volume;
    panelDensity.value = custom.particleDensity;
    volumeLabel.textContent = custom.volume + '%';
    densityLabel.textContent = custom.particleDensity + '%';

    const radios = document.getElementsByName('musicSource');
    radios.forEach(r => {
      r.checked = r.value === custom.musicSource;
    });

    uploadFileName.textContent = custom.customMusicName || '未选择文件';

    settingsPanel.classList.add('open');
    panelOverlay.style.display = 'block';
  }

  function closePanel() {
    settingsPanel.classList.remove('open');
    panelOverlay.style.display = 'none';
  }

  function applyPanelChanges() {
    const settings = getStoredOrDefault();
    const custom = settings[currentMood];

    custom.color1 = panelColor1.value;
    custom.color2 = panelColor2.value;
    custom.slogan = panelSlogan.value;
    custom.volume = parseInt(panelVolume.value);
    custom.particleDensity = parseInt(panelDensity.value);

    const selectedSource = document.querySelector('input[name="musicSource"]:checked');
    custom.musicSource = selectedSource ? selectedSource.value : 'default';

    saveSettings(settings);
    applyMood(currentMood, settings);
  }

  // ===== Event bindings =====
  function bindEvents() {
    // Mood buttons
    moodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const moodId = btn.dataset.mood;
        if (moodId === currentMood) return;
        const settings = getStoredOrDefault();
        settings.currentMood = moodId;
        saveSettings(settings);
        applyMood(moodId, settings);
      });
    });

    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
      if (audioManager) {
        audioManager.togglePlay();
        updatePlayPauseIcon();
      }
    });

    // Volume slider (main)
    volumeSlider.addEventListener('input', () => {
      const v = parseInt(volumeSlider.value);
      if (audioManager) audioManager.setVolume(v / 100);
      const settings = getStoredOrDefault();
      settings[currentMood].volume = v;
      saveSettings(settings);
    });

    // Slogan click to edit
    sloganText.addEventListener('click', () => {
      sloganText.style.display = 'none';
      sloganInput.style.display = 'inline-block';
      sloganInput.value = sloganText.textContent;
      sloganInput.focus();
    });

    sloganInput.addEventListener('blur', () => {
      const newSlogan = sloganInput.value.trim() || sloganText.textContent;
      sloganText.textContent = newSlogan;
      sloganText.style.display = 'inline-block';
      sloganInput.style.display = 'none';
      const settings = getStoredOrDefault();
      settings[currentMood].slogan = newSlogan;
      saveSettings(settings);
    });

    sloganInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sloganInput.blur();
    });

    // Settings panel
    settingsBtn.addEventListener('click', openPanel);
    closePanelBtn.addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);

    // Panel live preview
    [panelColor1, panelColor2].forEach(input => {
      input.addEventListener('input', applyPanelChanges);
    });
    panelSlogan.addEventListener('input', applyPanelChanges);
    panelVolume.addEventListener('input', () => {
      volumeLabel.textContent = panelVolume.value + '%';
      applyPanelChanges();
    });
    panelDensity.addEventListener('input', () => {
      densityLabel.textContent = panelDensity.value + '%';
      applyPanelChanges();
    });

    // Music source radio
    document.querySelectorAll('input[name="musicSource"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const settings = getStoredOrDefault();
        const custom = settings[currentMood];
        custom.musicSource = radio.value;
        saveSettings(settings);
        applyMood(currentMood, settings);
      });
    });

    // MP3 upload
    uploadBtn.addEventListener('click', () => mp3Upload.click());
    mp3Upload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!audioManager) return;

      const result = await audioManager.handleUpload(currentMood, file);
      if (result.success) {
        uploadFileName.textContent = result.fileName;
        const settings = getStoredOrDefault();
        settings[currentMood].customMusicName = result.fileName;
        settings[currentMood].musicSource = 'uploaded';
        saveSettings(settings);
        document.querySelector('input[name="musicSource"][value="uploaded"]').checked = true;
        musicName.textContent = result.fileName;
        showToast('✅ 音乐已上传');
      } else {
        showToast('❌ ' + result.error);
      }
    });

    // Reset defaults
    resetDefaultsBtn.addEventListener('click', () => {
      const preset = PRESETS[currentMood];
      const settings = getStoredOrDefault();
      settings[currentMood] = {
        color1: preset.color1,
        color2: preset.color2,
        slogan: preset.slogan,
        particleDensity: 40,
        customMusicName: null,
        musicSource: 'default',
        volume: 80
      };
      saveSettings(settings);
      applyMood(currentMood, settings);
      closePanel();
      showToast('🔄 已恢复默认设置');
    });

    // Keyboard shortcut: Space = play/pause
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        if (audioManager) {
          audioManager.togglePlay();
          updatePlayPauseIcon();
        }
      }
    });

    // Long-press timer item to reset (2 seconds)
    let longPressTimer = null;
    timerItems.forEach(item => {
      item.addEventListener('mousedown', () => {
        const mood = item.dataset.mood;
        longPressTimer = setTimeout(() => {
          moodTimers[mood] = 0;
          saveTimers();
          updateTimerDisplay();
          showToast('🔄 已重置「' + PRESETS[mood].name + '」计时');
        }, 2000);
      });

      item.addEventListener('mouseup', () => clearTimeout(longPressTimer));
      item.addEventListener('mouseleave', () => clearTimeout(longPressTimer));

      // Touch events for mobile
      item.addEventListener('touchstart', () => {
        const mood = item.dataset.mood;
        longPressTimer = setTimeout(() => {
          moodTimers[mood] = 0;
          saveTimers();
          updateTimerDisplay();
          showToast('🔄 已重置「' + PRESETS[mood].name + '」计时');
        }, 2000);
      });

      item.addEventListener('touchend', () => clearTimeout(longPressTimer));
      item.addEventListener('touchcancel', () => clearTimeout(longPressTimer));
    });
  }

  // ===== Init =====
  function init() {
    const settings = getStoredOrDefault();
    currentMood = settings.currentMood || DEFAULT_MOOD;

    particleEngine = new ParticleEngine('particleCanvas');
    audioManager = new AudioManager();

    applyMood(currentMood, settings);
    loadTimers();
    startTick();
    bindEvents();
    restoreUploadedMusic(currentMood, settings);

    document.addEventListener('click', function resumeAudio() {
      if (audioManager && audioManager.audio.paused && audioManager.audio.src) {
        audioManager.audio.play().catch(() => {});
      }
    }, { once: true });

    setTimeout(updatePlayPauseIcon, 500);
    // Persist timers on unload
    window.addEventListener('beforeunload', saveTimers);
  }

  async function restoreUploadedMusic(moodId, settings) {
    const custom = settings[moodId];
    if (custom.musicSource === 'uploaded' && custom.customMusicName && audioManager) {
      const stored = await audioManager.loadFromDB(moodId);
      if (stored && stored.blob) {
        if (audioManager.uploadedBlobUrl) URL.revokeObjectURL(audioManager.uploadedBlobUrl);
        audioManager.uploadedBlobUrl = URL.createObjectURL(stored.blob);
        audioManager.currentSource = 'uploaded';
        audioManager.crossfadeTo(audioManager.uploadedBlobUrl);
        musicName.textContent = custom.customMusicName;
      }
    }
  }

  // ===== Start =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
