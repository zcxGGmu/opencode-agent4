# Visual Companion 指南

Visual Companion 是基于浏览器的视觉 brainstorm 辅助工具，用于展示 mockups、diagrams 和选项。

## 何时使用

逐问题判断，而不是逐会话判断。测试标准：**用户看到它是否比阅读它更容易理解？**

**内容本身是视觉时使用浏览器：**

- UI mockups：wireframes、layouts、navigation structures、component designs。
- 架构图：系统组件、数据流、关系图。
- 并排视觉对比：布局、色彩方案、设计方向。
- 视觉打磨：look and feel、spacing、visual hierarchy。
- 空间关系：状态机、流程图、实体关系图。

**内容是文字或表格时使用终端：**

- 需求和范围问题，例如“X 是什么意思？”、“哪些功能在范围内？”。
- 概念性 A/B/C 选择。
- 权衡列表和比较表。
- 技术决策，例如 API 设计、数据建模、架构方案。
- 澄清问题，凡是答案主要是文字而不是视觉偏好。

关于 UI 的问题不自动等于视觉问题。“你想要什么类型的 wizard？”是概念问题，用终端。“哪种 wizard 布局更合适？”是视觉问题，用浏览器。

## 工作原理

服务器监视一个目录中的 HTML 文件，并把最新文件展示给浏览器。你把 HTML 写入 `screen_dir`，用户在浏览器中查看并点击选择。选择会记录到 `state_dir/events`，你在下一轮读取。

**片段与完整文档:** 如果 HTML 以 `<!DOCTYPE` 或 `<html` 开头，服务器会按完整文档提供，只注入 helper script。否则，服务器会用 frame template 包裹内容，自动加入 header、CSS theme、selection indicator 和交互基础设施。默认写内容片段；只有需要完全控制页面时才写完整文档。

## 启动会话

```bash
scripts/start-server.sh --project-dir /path/to/project
```

返回示例：

```json
{
  "type": "server-started",
  "port": 52341,
  "url": "http://localhost:52341",
  "screen_dir": "/path/to/project/.superpowers/brainstorm/12345-1706000000/content",
  "state_dir": "/path/to/project/.superpowers/brainstorm/12345-1706000000/state"
}
```

保存 `screen_dir` 和 `state_dir`，并让用户打开 URL。

**查找连接信息:** 服务器会把启动 JSON 写入 `$STATE_DIR/server-info`。如果后台启动时没捕获 stdout，读该文件获取 URL 和端口。使用 `--project-dir` 时，在 `<project>/.superpowers/brainstorm/` 中查找 session 目录。

**注意:** 传入项目根目录作为 `--project-dir`，这样 mockups 会保存在 `.superpowers/brainstorm/` 并可跨重启保留。否则文件进入 `/tmp` 并会被清理。提醒用户把 `.superpowers/` 加入 `.gitignore`。

### 按平台启动

**Claude Code（macOS / Linux）：**

```bash
scripts/start-server.sh --project-dir /path/to/project
```

**Claude Code（Windows）：**

```bash
scripts/start-server.sh --project-dir /path/to/project
```

Windows 会自动使用 foreground mode，Bash 工具调用应设置 `run_in_background: true`，让服务器跨对话轮次存活。下一轮读取 `$STATE_DIR/server-info` 获取 URL 和端口。

**Codex：**

```bash
scripts/start-server.sh --project-dir /path/to/project
```

Codex 可能回收后台进程。脚本会自动检测 `CODEX_CI` 并切到 foreground mode，正常运行即可。

**Gemini CLI：**

```bash
scripts/start-server.sh --project-dir /path/to/project --foreground
```

shell 工具调用设置 `is_background: true`，让进程跨轮次存活。

**其他环境:** 服务器必须跨对话轮次持续运行。如果环境会回收 detached processes，使用 `--foreground` 并通过平台后台机制启动。

如果浏览器无法访问 URL，常见于远程或容器环境，绑定非 loopback host：

```bash
scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

用 `--url-host` 控制返回 URL 中的 hostname。

## 迭代循环

1. **确认服务器仍在运行**，然后把 HTML 写入 `screen_dir` 的新文件。
   - 每次写入前检查 `$STATE_DIR/server-info` 是否存在。如果不存在，或 `$STATE_DIR/server-stopped` 存在，说明服务器已停止，先重启。
   - 使用语义文件名，例如 `platform.html`、`visual-style.html`、`layout.html`。
   - 不要复用文件名，每个 screen 都用新文件。
   - 使用平台文件写入工具，不要用 `cat` 或 heredoc 把大量内容倒进终端。
   - 服务器会自动展示最新文件。
2. **告诉用户预期内容并结束当前轮。**
   - 每次都提醒 URL。
   - 简短说明屏幕内容，例如“正在展示 homepage 的 3 个布局选项”。
   - 请用户回到终端反馈：“看一下并告诉我想法。如果愿意，可以点击选择一个选项。”
3. **下一轮读取反馈。**
   - 如果 `$STATE_DIR/events` 存在，读取浏览器点击或选择，JSON lines 格式。
   - 与用户终端文本合并理解。
   - 终端消息是主要反馈，events 是结构化辅助数据。
4. **迭代或进入下一步。**
   - 如果反馈改变当前 screen，写新文件，例如 `layout-v2.html`。
   - 当前步骤验证通过后，再进入下个问题。
5. **回到终端时清空旧内容。**
   - 如果下一步不需要浏览器，例如澄清问题或权衡讨论，推送 waiting screen：

   ```html
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">继续在终端中讨论...</p>
   </div>
   ```

   这样用户不会继续盯着已经解决的旧选择。

循环直到完成。

## 编写内容片段

默认只写页面内部内容。服务器会自动包裹 frame template。

最小示例：

```html
<h2>哪种布局更合适？</h2>
<p class="subtitle">请关注可读性和视觉层级</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>单列</h3>
      <p>干净、聚焦的阅读体验</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>双列</h3>
      <p>侧边导航加主内容区</p>
    </div>
  </div>
</div>
```

不需要 `<html>`、CSS 或 `<script>`，服务器会提供。

## 可用 CSS Classes

### Options

```html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Title</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

多选：给容器加 `data-multiselect`。

```html
<div class="options" data-multiselect>
  <!-- users can select/deselect multiple -->
</div>
```

### Cards

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- mockup content --></div>
    <div class="card-body">
      <h3>Name</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

### Mockup container

```html
<div class="mockup">
  <div class="mockup-header">Preview: Dashboard Layout</div>
  <div class="mockup-body"><!-- your mockup HTML --></div>
</div>
```

### Split view

```html
<div class="split">
  <div class="mockup"><!-- left --></div>
  <div class="mockup"><!-- right --></div>
</div>
```

### Pros/Cons

```html
<div class="pros-cons">
  <div class="pros"><h4>Pros</h4><ul><li>Benefit</li></ul></div>
  <div class="cons"><h4>Cons</h4><ul><li>Drawback</li></ul></div>
</div>
```

## 浏览器事件格式

用户点击选项时，交互会记录到 `$STATE_DIR/events`，每行一个 JSON 对象。推送新 screen 时会自动清空。

```jsonl
{"type":"click","choice":"a","text":"Option A - Simple Layout","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Complex Grid","timestamp":1706000108}
```

完整事件流能显示用户探索路径。最后一个 `choice` 通常是最终选择，但点击顺序也能暴露犹豫点。

如果 `$STATE_DIR/events` 不存在，说明用户没有浏览器交互，仅使用终端文本。

## 设计建议

- **保真度匹配问题**：布局问题用 wireframe，视觉打磨问题再提高保真。
- **每页说明问题**：写“哪种布局更专业？”，不要只写“选一个”。
- **先迭代再前进**：反馈改变当前 screen 时先写新版本。
- **每屏 2-4 个选项**。
- **必要时用真实内容**：摄影作品集应使用真实图像，placeholder 会掩盖设计问题。
- **保持 mockup 简洁**：聚焦布局和结构，不追求 pixel-perfect。

## 文件命名

- 使用语义名：`platform.html`、`visual-style.html`、`layout.html`。
- 不要复用文件名。
- 迭代版本加后缀：`layout-v2.html`、`layout-v3.html`。
- 服务器按修改时间展示最新文件。

## 清理

```bash
scripts/stop-server.sh $SESSION_DIR
```

如果 session 使用 `--project-dir`，mockup 文件会保留在 `.superpowers/brainstorm/`。只有 `/tmp` session 会在停止时删除。

## 参考

- Frame template: `scripts/frame-template.html`
- Helper script: `scripts/helper.js`
