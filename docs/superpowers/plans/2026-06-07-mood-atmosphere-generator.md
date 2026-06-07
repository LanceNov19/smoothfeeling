# 情绪氛围生成器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure frontend mood atmosphere generator with gradient backgrounds, Canvas particles, ambient music, and editable slogans.

**Architecture:** Single HTML page loads 4 JS modules (presets → particles → audio → app) and 1 CSS file. No build tools, no frameworks. Data persists via localStorage (settings) and IndexedDB (uploaded MP3s).

**Tech Stack:** HTML5, CSS3 (animations, transitions, flexbox), Vanilla JS ES6+ (Canvas 2D, Audio API, IndexedDB, localStorage, FileReader)

---

### Task 1: Project scaffold + HTML page structure

**Files:**
- Create: `D:\claude\demo\index.html`
- Create: `D:\claude\demo\audio\.gitkeep`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p D:/claude/demo/css D:/claude/demo/js D:/claude/demo/audio
touch D:/claude/demo/audio/.gitkeep
```

- [ ] **Step 2: Write index.html with complete DOM structure**

Create `D:\claude\demo\index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>情绪氛围生成器</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Canvas 粒子层 -->
  <canvas id="particleCanvas"></canvas>

  <!-- CSS 渐变遮罩层 -->
  <div id="gradientOverlay"></div>

  <!-- 音乐播放器 (左上角) -->
  <div id="musicPlayer">
    <span id="musicIcon">🎵</span>
    <span id="musicName">轻音乐</span>
    <button id="playPauseBtn" title="播放/暂停">▶</button>
    <button id="nextTrackBtn" title="下一首">▶▶</button>
    <input type="range" id="volumeSlider" min="0" max="100" value="80" title="音量">
    <span id="musicStatus">♫</span>
  </div>

  <!-- 标语文字 (居中) -->
  <div id="sloganContainer">
    <span id="sloganText">深呼吸，让一切慢下来</span>
    <input type="text" id="sloganInput" maxlength="30" style="display:none;">
  </div>

  <!-- 氛围切换按钮 (底部居中) -->
  <div id="moodSelector">
    <button class="mood-btn active" data-mood="relax">🌿 放松</button>
    <button class="mood-btn" data-mood="emo">🌧️ emo</button>
    <button class="mood-btn" data-mood="firedUp">🔥 热血</button>
    <button class="mood-btn" data-mood="zoneOut">☁️ 发呆</button>
  </div>

  <!-- 自定义按钮 (右下角) -->
  <button id="settingsBtn" title="自定义设置">⚙</button>

  <!-- 自定义面板遮罩 -->
  <div id="panelOverlay" style="display:none;"></div>

  <!-- 自定义面板 (右侧滑出) -->
  <div id="settingsPanel">
    <h3>自定义设置</h3>
    <label>当前氛围: <span id="panelMoodLabel">放松</span></label>

    <label>主色 1:</label>
    <input type="color" id="panelColor1" value="#a8e6cf">

    <label>主色 2:</label>
    <input type="color" id="panelColor2" value="#3b8d99">

    <label>标语文字:</label>
    <input type="text" id="panelSlogan" maxlength="30" value="深呼吸，让一切慢下来">

    <label>音乐来源:</label>
    <div class="radio-group">
      <label><input type="radio" name="musicSource" value="default" checked> 默认链接</label>
      <label><input type="radio" name="musicSource" value="uploaded"> 上传 MP3 文件</label>
    </div>

    <div id="uploadArea">
      <input type="file" id="mp3Upload" accept=".mp3,audio/mpeg" style="display:none;">
      <button id="uploadBtn">📁 选择 MP3 文件</button>
      <span id="uploadFileName">未选择文件</span>
      <p class="hint">最大 15MB</p>
    </div>

    <label>音量: <span id="volumeLabel">80%</span></label>
    <input type="range" id="panelVolume" min="0" max="100" value="80">

    <label>粒子密度: <span id="densityLabel">40%</span></label>
    <input type="range" id="panelDensity" min="10" max="100" value="40">

    <div class="panel-actions">
      <button id="resetDefaultsBtn">恢复默认</button>
      <button id="closePanelBtn">关闭</button>
    </div>
  </div>

  <!-- 提示信息 -->
  <div id="toast" class="toast-hidden"></div>

  <!-- JS 脚本 (按依赖顺序加载) -->
  <script src="js/presets.js"></script>
  <script src="js/particles.js"></script>
  <script src="js/audio.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify HTML renders**

Open `index.html` in a browser. Verify: no console errors (expect 404s for missing JS/CSS — expected at this stage), DOM elements present. All buttons and inputs visible (without styling yet).

- [ ] **Step 4: Commit**

```bash
git add index.html audio/.gitkeep
git commit -m "feat: add project scaffold and HTML structure"
```

---

### Task 2: Presets data (js/presets.js)

**Files:**
- Create: `D:\claude\demo\js\presets.js`

- [ ] **Step 1: Discover free music CDN URLs**

Search Pixabay.com for royalty-free music matching each mood. Find direct CDN download URLs (usually under `cdn.pixabay.com/download/audio/`).

Use WebSearch + WebFetch to locate these:
- Relax: calm ambient piano / meditation music
- Emo: melancholic / sad ambient music
- FiredUp: energetic / epic / upbeat music
- ZoneOut: dreamy / chill ambient music

Expected URL pattern: `https://cdn.pixabay.com/download/audio/<id>.mp3`

- [ ] **Step 2: Write presets.js with discovered URLs**

Create `D:\claude\demo\js\presets.js`:

```js
const PRESETS = {
  relax: {
    id: 'relax',
    name: '放松',
    emoji: '🌿',
    color1: '#a8e6cf',
    color2: '#3b8d99',
    slogan: '深呼吸，让一切慢下来',
    musicUrl: '<DISCOVERED_CDN_URL_FOR_CALM_AMBIENT>',  // Step 1 fills this
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
    musicUrl: '<DISCOVERED_CDN_URL_FOR_SAD_MELANCHOLIC>',
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
    musicUrl: '<DISCOVERED_CDN_URL_FOR_ENERGETIC_EPIC>',
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
    musicUrl: '<DISCOVERED_CDN_URL_FOR_DREAMY_CHILL>',
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
```

- [ ] **Step 3: Verify presets.js loads without errors**

Add `<script src="js/presets.js"></script>` before other scripts in `index.html`. Open in browser, check console for errors. Run in console: `console.log(PRESETS.relax)` — should output the relax preset object.

- [ ] **Step 4: Commit**

```bash
git add js/presets.js index.html
git commit -m "feat: add mood presets with particle and music configs"
```

---

### Task 3: CSS styles (css/style.css)

**Files:**
- Create: `D:\claude\demo\css\style.css`

- [ ] **Step 1: Write complete CSS**

Create `D:\claude\demo\css\style.css`:

```css
/* ===== Reset & Base ===== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
  -webkit-user-select: none;
}

/* ===== Canvas Layer (z-index: 0) ===== */
#particleCanvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* ===== Gradient Overlay (z-index: 1) ===== */
#gradientOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: linear-gradient(135deg, #a8e6cf 0%, #3b8d99 100%);
  opacity: 0.7;
  transition: background 1.5s ease;
}

/* ===== Music Player (左上角, z-index: 3) ===== */
#musicPlayer {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 10px 16px;
  border-radius: 28px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease;
}

#musicPlayer button {
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 50%;
  transition: background 0.2s;
}

#musicPlayer button:hover {
  background: rgba(255, 255, 255, 0.2);
}

#musicName {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  opacity: 0.9;
}

#volumeSlider {
  width: 60px;
  accent-color: #fff;
  cursor: pointer;
}

#musicStatus {
  font-size: 12px;
  opacity: 0.7;
}

/* ===== Slogan (居中, z-index: 3) ===== */
#sloganContainer {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  text-align: center;
}

#sloganText {
  font-size: clamp(1.5rem, 5vw, 3rem);
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  font-weight: 300;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: transform 0.6s ease, opacity 0.6s ease;
  display: inline-block;
}

#sloganText:hover {
  text-shadow: 0 2px 30px rgba(255, 255, 255, 0.5);
}

#sloganInput {
  font-size: clamp(1.5rem, 5vw, 3rem);
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 8px 20px;
  text-align: center;
  font-weight: 300;
  letter-spacing: 0.05em;
  outline: none;
  width: 80vw;
  max-width: 600px;
}

#sloganInput::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* ===== Mood Selector (底部居中, z-index: 3) ===== */
#moodSelector {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  gap: 12px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 36px;
}

.mood-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  white-space: nowrap;
}

.mood-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.mood-btn.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

/* ===== Settings Button (右下角, z-index: 3) ===== */
#settingsBtn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 3;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#settingsBtn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(45deg);
}

/* ===== Settings Panel (右侧滑出, z-index: 4) ===== */
#panelOverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 4;
}

#settingsPanel {
  position: fixed;
  top: 0;
  right: 0;
  width: 340px;
  max-width: 90vw;
  height: 100%;
  z-index: 5;
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #e0e0e0;
  padding: 30px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.5);
}

#settingsPanel.open {
  transform: translateX(0);
}

#settingsPanel h3 {
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
}

#settingsPanel label {
  font-size: 14px;
  color: #aaa;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

#settingsPanel input[type="color"] {
  width: 48px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  padding: 2px;
}

#settingsPanel input[type="text"] {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: border-color 0.3s;
  font-family: inherit;
}

#settingsPanel input[type="text"]:focus {
  border-color: rgba(255, 255, 255, 0.5);
}

#settingsPanel input[type="range"] {
  width: 100%;
  accent-color: #fff;
  cursor: pointer;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-group label {
  flex-direction: row;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #ccc;
}

#uploadArea {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

#uploadBtn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: background 0.3s;
}

#uploadBtn:hover {
  background: rgba(255, 255, 255, 0.2);
}

#uploadFileName {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #888;
}

.hint {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
}

.panel-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
}

#resetDefaultsBtn {
  flex: 1;
  background: rgba(255, 80, 80, 0.2);
  border: 1px solid rgba(255, 80, 80, 0.4);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

#resetDefaultsBtn:hover {
  background: rgba(255, 80, 80, 0.35);
}

#closePanelBtn {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

#closePanelBtn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ===== Toast Notification ===== */
#toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.toast-hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
  pointer-events: none;
}

.toast-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ===== Responsive (Mobile) ===== */
@media (max-width: 640px) {
  #musicPlayer {
    top: 10px;
    left: 10px;
    padding: 8px 12px;
    gap: 6px;
    font-size: 12px;
  }

  #volumeSlider {
    width: 40px;
  }

  #moodSelector {
    bottom: 16px;
    gap: 6px;
    padding: 6px 8px;
  }

  .mood-btn {
    font-size: 14px;
    padding: 8px 14px;
  }

  #settingsBtn {
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  #settingsPanel {
    width: 100%;
    max-width: 100vw;
  }
}
```

- [ ] **Step 2: Verify styles load**

Open `index.html` in browser. Verify: gradient overlay is visible (green-blue), music player is top-left, mood buttons are bottom-center, settings gear is bottom-right. All elements properly positioned.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add complete CSS styles with responsive layout"
```

---

### Task 4: Particle system (js/particles.js)

**Files:**
- Create: `D:\claude\demo\js\particles.js`

- [ ] **Step 1: Write particles.js**

Create `D:\claude\demo\js\particles.js`:

```js
class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || !this.canvas.getContext) {
      this.disabled = true;
      console.warn('Canvas not supported, particles disabled');
      return;
    }
    this.disabled = false;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.incomingParticles = [];
    this.transitionProgress = 0;  // 0 = fully old, 1 = fully new
    this.isTransitioning = false;
    this.currentConfig = null;
    this.densityMultiplier = 1.0;
    this.animationId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.maxParticles = Math.min(
      Math.floor((this.canvas.width * this.canvas.height) / 10000) * this.densityMultiplier,
      200
    );
    if (window.innerWidth < 640) {
      this.maxParticles = Math.min(this.maxParticles, Math.floor(this.maxParticles * 0.5));
    }
  }

  /** Apply config from presets and start/replace particles */
  setConfig(config, densityPercent) {
    this.currentConfig = config;
    this.densityMultiplier = (densityPercent || 40) / 100;
    this.resize();

    if (this.isTransitioning) {
      // Replace incoming particles target during transition
      this.incomingParticles = [];
      this.transitionProgress = 0;
    } else {
      this.isTransitioning = true;
      this.transitionProgress = 0;
      this.incomingParticles = [];
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    if (this.disabled) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Handle transition
    if (this.isTransitioning) {
      this.transitionProgress += 0.016; // ~1.5s for full transition at 60fps
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
        // Replace old particles with new
        this.particles = this.incomingParticles;
        this.incomingParticles = [];
      }
    }

    // Remove old particles gradually during transition
    if (this.isTransitioning) {
      const keepCount = Math.floor(this.particles.length * (1 - this.transitionProgress));
      if (this.particles.length > keepCount) {
        this.particles.length = keepCount;
      }
    }

    // Spawn incoming particles
    const targetCount = this.isTransitioning
      ? Math.floor(this.maxParticles * this.transitionProgress)
      : this.maxParticles;
    const pool = this.isTransitioning ? this.incomingParticles : this.particles;
    while (pool.length < targetCount) {
      pool.push(this.createParticle());
    }

    // Update & draw old particles
    for (const p of this.particles) {
      this.updateParticle(p);
      this.drawParticle(p, this.isTransitioning ? (1 - this.transitionProgress) : 1);
    }

    // Update & draw incoming particles
    if (this.isTransitioning) {
      for (const p of this.incomingParticles) {
        this.updateParticle(p);
        this.drawParticle(p, this.transitionProgress);
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  createParticle() {
    const cfg = this.currentConfig;
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min),
      speed: cfg.speed.min + Math.random() * (cfg.speed.max - cfg.speed.min),
      color: cfg.particleColors[Math.floor(Math.random() * cfg.particleColors.length)],
      opacity: cfg.opacity.min + Math.random() * (cfg.opacity.max - cfg.opacity.min),
      dirX: (Math.random() - 0.5) * 2,
      dirY: (Math.random() - 0.5) * 2
    };
  }

  updateParticle(p) {
    const cfg = this.currentConfig;

    switch (cfg.direction) {
      case 'up':
        p.y -= p.speed;
        p.x += (p.dirX * p.speed * 0.3);
        break;
      case 'down':
        p.y += p.speed;
        p.x += (p.dirX * p.speed * 0.3);
        break;
      case 'random':
      default:
        p.x += p.dirX * p.speed;
        p.y += p.dirY * p.speed;
        break;
    }

    // Wrap around edges
    const margin = 50;
    if (p.x < -margin) p.x = this.canvas.width + margin;
    if (p.x > this.canvas.width + margin) p.x = -margin;
    if (p.y < -margin) p.y = this.canvas.height + margin;
    if (p.y > this.canvas.height + margin) p.y = -margin;
  }

  drawParticle(p, alphaMultiplier) {
    const ctx = this.ctx;
    const alpha = p.opacity * alphaMultiplier;
    ctx.globalAlpha = alpha;

    switch (this.currentConfig.shape) {
      case 'line':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + p.size * 3);
        ctx.stroke();
        break;
      case 'circle':
      default:
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.globalAlpha = 1;
  }

  /** Update density without full mood switch */
  setDensity(percent) {
    this.densityMultiplier = percent / 100;
    this.resize();
  }
}
```

- [ ] **Step 2: Verify particles render**

Add a quick test in console after page loads:
```js
const engine = new ParticleEngine('particleCanvas');
engine.setConfig(PRESETS.relax.particleConfig, 40);
```
Expected: green-tinted circles floating randomly across the screen.

- [ ] **Step 3: Commit**

```bash
git add js/particles.js
git commit -m "feat: add Canvas particle engine with mood transitions"
```

---

### Task 5: Audio system (js/audio.js)

**Files:**
- Create: `D:\claude\demo\js\audio.js`

- [ ] **Step 1: Write audio.js**

Create `D:\claude\demo\js\audio.js`:

```js
class AudioManager {
  constructor() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.currentMood = null;
    this.currentSource = 'default';  // 'default' | 'uploaded'
    this.uploadedBlobUrl = null;
    this.volume = 0.8;
    this.audio.volume = this.volume;
    this.fadeInterval = null;
    this.dbReady = false;
    this.db = null;

    this.initDB();
  }

  /** Initialize IndexedDB for MP3 storage */
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

  /** Save uploaded MP3 blob to IndexedDB */
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

  /** Load uploaded MP3 from IndexedDB */
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

  /** Switch music source for a mood */
  async switchMood(moodId, preset, customSettings) {
    this.currentMood = moodId;
    const source = customSettings?.musicSource || 'default';
    this.currentSource = source;
    this.volume = customSettings?.volume ?? 0.8;
    this.audio.volume = this.volume;

    let playUrl = null;

    if (source === 'uploaded' && customSettings?.customMusicName) {
      const stored = await this.loadFromDB(moodId);
      if (stored && stored.blob) {
        if (this.uploadedBlobUrl) URL.revokeObjectURL(this.uploadedBlobUrl);
        this.uploadedBlobUrl = URL.createObjectURL(stored.blob);
        playUrl = this.uploadedBlobUrl;
      }
    }

    if (!playUrl) {
      playUrl = preset.musicUrl;
    }

    this.crossfadeTo(playUrl);
  }

  /** Crossfade: fade out current → switch src → fade in */
  crossfadeTo(url, duration = 2000) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    const startVolume = this.audio.volume;
    const steps = 20;
    const stepTime = duration / 2 / steps;
    let step = 0;

    // Step 1: Fade out
    this.fadeInterval = setInterval(() => {
      step++;
      this.audio.volume = Math.max(0, startVolume * (1 - step / steps));
      if (step >= steps) {
        clearInterval(this.fadeInterval);
        // Switch source
        this.audio.src = url;
        this.audio.play().catch(() => {
          // Silent fail — music load error handled by status display
        });
        // Step 2: Fade in
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

  /** Handle user-uploaded MP3 file */
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
    this.crossfadeTo(this.uploadedBlobUrl);

    return { success: true, fileName: file.name };
  }

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play().catch(() => {});
    } else {
      this.audio.pause();
    }
  }

  isPlaying() {
    return !this.audio.paused;
  }

  setVolume(v) {
    this.volume = v;
    this.audio.volume = v;
  }

  /** Use default music source (discard uploaded) */
  useDefault(preset) {
    this.currentSource = 'default';
    this.crossfadeTo(preset.musicUrl);
  }
}
```

- [ ] **Step 2: Verify audio plays**

In console after page loads:
```js
const am = new AudioManager();
am.switchMood('relax', PRESETS.relax, { musicSource: 'default', volume: 0.5 });
```
Expected: audio starts playing (check for sound). Click the page first if browser blocks autoplay.

- [ ] **Step 3: Commit**

```bash
git add js/audio.js
git commit -m "feat: add audio manager with IndexedDB storage and crossfade"
```

---

### Task 6: Main app (js/app.js) — Core logic

**Files:**
- Create: `D:\claude\demo\js\app.js`

- [ ] **Step 1: Write app.js (core: init, mood switching, persistence, events)**

Create `D:\claude\demo\js\app.js`:

```js
(function () {
  'use strict';

  // ===== State =====
  let currentMood = DEFAULT_MOOD;
  let particleEngine = null;
  let audioManager = null;

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
      // Build defaults from PRESETS
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
    // Merge with defaults in case new keys are added
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
        : (preset.name + ' · 轻音乐');
    }

    // Music player UI
    volumeSlider.value = custom.volume;
    updatePlayPauseIcon();

    // Mood buttons
    moodBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === moodId);
    });

    currentMood = moodId;
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
  }

  // ===== Init =====
  function init() {
    // Load settings
    const settings = getStoredOrDefault();
    currentMood = settings.currentMood || DEFAULT_MOOD;

    // Init particle engine
    particleEngine = new ParticleEngine('particleCanvas');

    // Init audio manager
    audioManager = new AudioManager();

    // Apply initial mood
    applyMood(currentMood, settings);

    // Bind events
    bindEvents();

    // Restore uploaded music for current mood
    restoreUploadedMusic(currentMood, settings);

    // Handle music autoplay (browsers block it, prompt user interaction)
    document.addEventListener('click', function resumeAudio() {
      if (audioManager && audioManager.audio.paused && audioManager.audio.src) {
        audioManager.audio.play().catch(() => {});
      }
    }, { once: true });

    // Set initial play button state
    setTimeout(updatePlayPauseIcon, 500);
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
```

- [ ] **Step 2: Verify end-to-end functionality**

Open `index.html` in browser. Test:
1. Click each mood button — gradient, particles, and slogan should change
2. Click the slogan text — should turn into editable input
3. Click play/pause — icon should toggle
4. Adjust volume slider — volume should change
5. Open settings with ⚙ button — panel slides in from right
6. Change color in panel — gradient updates in real time
7. Close panel — slides away
8. Refresh page — settings should persist (check localStorage)

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add main app logic with mood switching and persistence"
```

---

### Task 7: Music URL discovery and final integration

**Files:**
- Modify: `D:\claude\demo\js\presets.js` (fill actual CDN URLs)

- [ ] **Step 1: Fetch actual Pixabay CDN URLs**

Use these search queries to find direct MP3 download links:
- Relax: search "calm meditation ambient piano pixabay" → find a track, open page, extract CDN URL from the download button
- Emo: search "sad melancholic dark ambient pixabay" → extract CDN URL
- FiredUp: search "epic energetic upbeat motivational pixabay" → extract CDN URL
- ZoneOut: search "dreamy chill lofi ambient pixabay" → extract CDN URL

To extract CDN URL from a Pixabay music page (`https://pixabay.com/music/...`):
1. Use WebFetch on the page
2. Look for `cdn.pixabay.com/download/audio/` in the page source
3. The full URL will be something like `https://cdn.pixabay.com/download/audio/xxxxx.mp3`

For each mood, find one matching track and replace the placeholder in `presets.js` with the actual CDN URL.

- [ ] **Step 2: Update presets.js with real URLs**

Replace the `<DISCOVERED_CDN_URL_...>` placeholders in `js/presets.js` with the actual URLs found in Step 1.

- [ ] **Step 3: Verify music plays for each mood**

Open `index.html` in browser. Switch to each mood, verify music starts playing (may need to click page first for autoplay). Check browser console for any 404 or CORS errors on audio URLs.

- [ ] **Step 4: Final integration test**

Full test checklist:
- [ ] All 4 moods switch correctly (gradient + particles + slogan + music)
- [ ] Slogan click-to-edit works, persists on refresh
- [ ] Custom colors from panel persist on refresh
- [ ] Volume and density sliders work
- [ ] MP3 upload works (IndexedDB), survives refresh
- [ ] "恢复默认" resets all custom settings for current mood
- [ ] Music crossfade works when switching moods
- [ ] Space key toggles play/pause
- [ ] Mobile responsive: layout adapts at ≤640px
- [ ] Canvas resize handles window resize
- [ ] No console errors

- [ ] **Step 5: Commit**

```bash
git add js/presets.js
git commit -m "feat: embed actual Pixabay CDN music URLs"
```

---

### Task 8: README and polish

**Files:**
- Create: `D:\claude\demo\README.md`

- [ ] **Step 1: Write README**

Create `D:\claude\demo\README.md`:

```markdown
# 🎨 情绪氛围生成器

一键切换视觉氛围的纯前端页面 — 渐变背景、动态粒子、轻音乐、自定义标语。

## 功能

- 🌿 **放松** / 🌧️ **emo** / 🔥 **热血** / ☁️ **发呆** — 四种预设氛围
- 🎨 渐变背景 + Canvas 粒子动画，随氛围切换过渡
- 🎵 内置免费轻音乐（来自 Pixabay），支持上传自定义 MP3
- ✏️ 点击标语文字即可编辑
- ⚙ 自定义配色、音量、粒子密度
- 💾 设置自动保存到浏览器（localStorage + IndexedDB）
- 📱 响应式设计，适配桌面和移动端

## 使用方式

直接用浏览器打开 `index.html` 即可，无需任何构建工具或服务器。

```
# 方式 1：直接双击 index.html
# 方式 2：用任意静态服务器
npx serve .
# 然后访问 http://localhost:3000
```

## 快捷键

| 按键 | 功能 |
|------|------|
| 空格 | 播放/暂停音乐 |

## 自定义

1. 点击右下角 ⚙ 打开设置面板
2. 修改颜色、标语、音乐来源
3. 可上传自己的 MP3 文件（最大 15MB）
4. 点击"恢复默认"重置当前氛围的所有设置

## 技术栈

- 纯前端：HTML5 + CSS3 + 原生 JavaScript
- Canvas 2D 粒子引擎
- HTML5 Audio + IndexedDB
- 零依赖，零构建

## 项目结构

```
├── index.html          # 主页面
├── css/style.css       # 样式与动画
├── js/
│   ├── presets.js      # 预设氛围配置
│   ├── particles.js    # Canvas 粒子系统
│   ├── audio.js        # 音频管理 & IndexedDB
│   └── app.js          # 主逻辑 & 事件绑定
└── audio/              # 用户可放入自定义 MP3
```

## 音乐版权

默认音乐来自 [Pixabay Music](https://pixabay.com/music/)，免版税使用，无需署名。
```

- [ ] **Step 2: Final browser verification**

Open `index.html` in a fresh browser. Go through each mood, verify:
- No broken visuals
- Music plays (click page once first)
- Settings panel opens/closes smoothly
- All transitions are smooth

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README with usage instructions"
```

---

### Task 9: (Optional) Initialize git repository

**Files:**
- Create: `D:\claude\demo\.gitignore`

- [ ] **Step 1: Create .gitignore**

Create `D:\claude\demo\.gitignore`:

```
audio/*.mp3
.DS_Store
Thumbs.db
```

- [ ] **Step 2: Initialize git and make first commit**

```bash
cd D:/claude/demo
git init
git add -A
git commit -m "feat: 情绪氛围生成器 — 纯前端情绪氛围页面"
```

**Note:** Skip this task if the user does not want git.
