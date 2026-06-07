# 时间显示功能 — 设计文档

**日期**: 2026-06-07  
**项目**: 情绪氛围生成器  
**功能**: 右上角时间面板，显示系统时间和四种氛围的累计时长

---

## 概述

在页面右上角新增一个时间面板，与左上角音乐播放器形成对称布局。面板内显示当前系统时间（实时更新），以及四种氛围模式各自的累计使用时长。

---

## 布局

### 位置

右上角，与左上角 `#musicPlayer` 对称。`position: fixed; top: 20px; right: 20px; z-index: 3;`

### 结构 (HTML)

```html
<div id="timePanel">
  <div id="clockDisplay">14:35:28</div>
  <div id="timerList">
    <div class="timer-item" data-mood="relax">
      <span class="timer-emoji">🌿</span>
      <span class="timer-label">放松</span>
      <span class="timer-value">00:12:35</span>
    </div>
    <div class="timer-item" data-mood="emo">
      <span class="timer-emoji">🌧️</span>
      <span class="timer-label">emo</span>
      <span class="timer-value">00:05:20</span>
    </div>
    <div class="timer-item" data-mood="firedUp">
      <span class="timer-emoji">🔥</span>
      <span class="timer-label">热血</span>
      <span class="timer-value">00:00:00</span>
    </div>
    <div class="timer-item" data-mood="zoneOut">
      <span class="timer-emoji">☁️</span>
      <span class="timer-label">发呆</span>
      <span class="timer-value">00:03:15</span>
    </div>
  </div>
</div>
```

### 样式

- 毛玻璃风格，与 `#musicPlayer` 一致：`background: rgba(0,0,0,0.35); backdrop-filter: blur(10px); border-radius: 28px;`
- 时钟字体略大（18px），计时器条目稍小（12-13px）
- 当前活跃的模式计时器高亮显示（文字颜色偏亮，或加一个小圆点指示器）
- 移动端适配：小屏幕下适当缩小字体和 padding

---

## 数据流

### 计时引擎

- 使用 `setInterval` 每秒更新一次（共用一个 1 秒 interval）
- 系统时钟：`new Date().toLocaleTimeString('zh-CN', { hour12: false })`
- 氛围计时器：每个模式独立累计秒数
  - 切换到此模式 → 该模式秒数开始递增
  - 切换离开 → 该模式秒数暂停
  - 页面加载 → 从 localStorage 读取上次的累计值，当前活跃模式继续累加
- 显示格式：`HH:MM:SS`（超过 99 小时继续显示小时位）

### 持久化

存储 key：`moodTimers`，结构：

```json
{
  "relax": 4535,
  "emo": 320,
  "firedUp": 0,
  "zoneOut": 195
}
```

- 单位：秒
- 每次切换模式时写入 localStorage
- 页面卸载前写入（`beforeunload`）
- 也可以每隔 30 秒自动写入一次作为保底

### 重置

- 长按某个计时器条目 2 秒 → 该模式计时归零
- 或者在设置面板中增加"重置计时"按钮

---

## 文件变更

| 文件 | 变更 |
|------|------|
| `index.html` | 新增 `#timePanel` HTML 结构 |
| `css/style.css` | 新增时间面板样式 + 响应式适配 |
| `js/app.js` | 新增计时逻辑、持久化读写、DOM 更新 |

---

## 不做

- 不添加历史记录或统计图表
- 不改变现有音乐播放器、标语、模式切换的布局
- 不影响粒子系统和音效引擎

---

## 移动端适配

小屏幕（≤640px）下：
- 面板 `top: 10px; right: 10px;`，与左上角音乐播放器对齐
- padding 和字体适当缩小
- 四个计时器条目可以考虑仅显示 emoji + 时间，隐藏文字标签
