# 时间显示功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在页面右上角新增时间面板，显示系统时钟和四种氛围的累计使用时长

**Architecture:** 在 `app.js` 中新增计时引擎模块，通过单一 `setInterval` 每秒同时更新系统时钟和活跃模式的计时器。计时数据从 localStorage 加载/持久化。HTML 新增 `#timePanel` 结构，CSS 新增毛玻璃风格样式。

**Tech Stack:** 纯前端 HTML5 + CSS3 + 原生 JavaScript（与现有项目一致）

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `index.html` | 新增 `#timePanel` 的 HTML 结构 |
| `css/style.css` | 新增时间面板、时钟、计时器条目、活跃态、移动端适配样式 |
| `js/app.js` | 新增计时引擎：loadTimers / saveTimers / formatTime / updateClock / tick / 长按重置 |

---

### Task 1: 添加 HTML 结构

**Files:**
- Modify: `index.html:25-28`

- [ ] **Step 1: 在音乐播放器之后插入时间面板 HTML**

在 `index.html` 中，`<!-- 音乐播放器 (左上角) -->` 区块结束标签 `</div>`（`#musicPlayer` 的闭合标签，约第 23 行）之后、`<!-- 标语文字 (居中) -->` 之前，插入以下 HTML：

```html
<!-- 时间面板 (右上角) -->
<div id="timePanel">
  <div id="clockDisplay">00:00:00</div>
  <div id="timerList">
    <div class="timer-item" data-mood="relax">
      <span class="timer-emoji">🌿</span>
      <span class="timer-label">放松</span>
      <span class="timer-value">00:00:00</span>
    </div>
    <div class="timer-item" data-mood="emo">
      <span class="timer-emoji">🌧️</span>
      <span class="timer-label">emo</span>
      <span class="timer-value">00:00:00</span>
    </div>
    <div class="timer-item" data-mood="firedUp">
      <span class="timer-emoji">🔥</span>
      <span class="timer-label">热血</span>
      <span class="timer-value">00:00:00</span>
    </div>
    <div class="timer-item" data-mood="zoneOut">
      <span class="timer-emoji">☁️</span>
      <span class="timer-label">发呆</span>
      <span class="timer-value">00:00:00</span>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat: add time panel HTML structure"
```

---

### Task 2: 添加 CSS 样式

**Files:**
- Modify: `css/style.css:40-57` (追加在 `#musicPlayer` 样式之后)

- [ ] **Step 1: 在 musicPlayer 样式块后添加时间面板基础样式**

在 `css/style.css` 的 `#musicStatus` 样式块结束（约第 92 行）之后，追加：

```css
/* ===== Time Panel (右上角, z-index: 3) ===== */
#timePanel {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 12px 18px;
  border-radius: 28px;
  color: #fff;
  min-width: 140px;
  transition: all 0.3s ease;
}

#clockDisplay {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-align: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

#timerList {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 3px 8px;
  border-radius: 12px;
  transition: background 0.3s ease;
  cursor: pointer;
}

.timer-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.timer-item.active-timer {
  background: rgba(255, 255, 255, 0.15);
}

.timer-emoji {
  font-size: 14px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.timer-label {
  flex: 1;
  opacity: 0.8;
}

.timer-value {
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-size: 12px;
  opacity: 0.9;
  min-width: 52px;
  text-align: right;
}

/* 活跃指示圆点 */
.timer-item.active-timer::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.6);
  animation: pulse-dot 1.5s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

- [ ] **Step 2: 在响应式媒体查询中添加移动端适配**

在 `@media (max-width: 640px)` 块内（约第 405 行之后，`#settingsBtn` 规则之后）追加：

```css
#timePanel {
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  min-width: auto;
}

#clockDisplay {
  font-size: 15px;
  margin-bottom: 4px;
  padding-bottom: 4px;
}

.timer-item {
  font-size: 12px;
  padding: 2px 6px;
  gap: 4px;
}

.timer-label {
  display: none;
}

.timer-value {
  font-size: 11px;
  min-width: 46px;
}
```

- [ ] **Step 3: 提交**

```bash
git add css/style.css
git commit -m "feat: add time panel CSS styles with mobile responsive"
```

---

### Task 3: 添加计时引擎逻辑

**Files:**
- Modify: `js/app.js`

This task covers: timer state management, localStorage persistence, formatTime helper, and the tick loop. All code is added to `app.js` and integrates with the existing `init()` / `applyMood()` / `bindEvents()` flow.

- [ ] **Step 1: 在 State 区域添加计时器状态变量**

在 `app.js` 的 `// ===== State =====` 块中，`let audioManager = null;` 之后添加：

```js
let moodTimers = { relax: 0, emo: 0, firedUp: 0, zoneOut: 0 };
let tickInterval = null;
```

- [ ] **Step 2: 添加计时器 DOM 引用**

在 `app.js` 的 `// ===== DOM refs =====` 块中，`const toast = $('#toast');` 之后添加：

```js
const clockDisplay = $('#clockDisplay');
const timerValues = document.querySelectorAll('.timer-value');
const timerItems = document.querySelectorAll('.timer-item');
```

- [ ] **Step 3: 添加计时器工具函数**

在 `app.js` 的 `// ===== localStorage helpers =====` 块之后（即 `saveSettings` 函数之后），添加：

```js
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
```

- [ ] **Step 4: 在 applyMood 中更新活跃计时器显示**

在 `applyMood()` 函数末尾（`currentMood = moodId;` 之前），添加：

```js
// Update timer active state
updateTimerDisplay();
```

这段代码应放在 `currentMood = moodId;` 那一行之前，因为 `updateTimerDisplay` 依赖 `currentMood` 来判断活跃态。改为放在 `currentMood = moodId;` 之后：

在 `applyMood` 函数的 `currentMood = moodId;` 之后添加：

```js
// Update timer active state
updateTimerDisplay();
```

- [ ] **Step 5: 在 init 中启动计时引擎**

在 `init()` 函数中，`applyMood(currentMood, settings);` 之后、`bindEvents();` 之前添加：

```js
loadTimers();
startTick();
```

在 `init()` 函数末尾，`setTimeout(updatePlayPauseIcon, 500);` 之后、`}`（init 函数闭合花括号）之前添加：

```js
// Persist timers on unload
window.addEventListener('beforeunload', saveTimers);
```

- [ ] **Step 6: 提交**

```bash
git add js/app.js
git commit -m "feat: add timer engine with localStorage persistence"
```

---

### Task 4: 添加长按重置功能

**Files:**
- Modify: `js/app.js:313-323` (在 `bindEvents` 函数中，键盘快捷键绑定之后)

- [ ] **Step 1: 在 bindEvents 末尾添加长按重置逻辑**

在 `bindEvents()` 函数中，键盘快捷键事件绑定之后、`bindEvents` 的闭合 `}` 之前，添加：

```js
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
  item.addEventListener('touchstart', (e) => {
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
```

- [ ] **Step 2: 提交**

```bash
git add js/app.js
git commit -m "feat: add long-press to reset mood timer"
```

---

### Task 5: 验证

- [ ] **Step 1: 打开页面确认功能**

用浏览器打开 `index.html`，确认：
1. 右上角出现时间面板
2. 系统时钟每秒更新
3. 切换氛围模式后，对应计时器开始走动，之前的暂停
4. 刷新页面后计时数据保留
5. 长按 2 秒某个计时器条目可以重置为 0
6. 移动端视口（≤640px）下时间面板正常显示

- [ ] **Step 2: 提交（如有调整）**

---

## 自审清单

| 检查项 | 状态 |
|--------|------|
| Spec 覆盖：系统时钟 ✅ 氛围计时 ✅ 持久化 ✅ 重置 ✅ 移动端 ✅ | ✅ |
| 无占位符：所有步骤包含完整代码 | ✅ |
| 类型一致性：`moodTimers` 键名与 `MOOD_IDS` / `PRESETS` 对齐 | ✅ |
| 文件路径精确 | ✅ |
