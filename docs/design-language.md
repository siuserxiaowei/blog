# Design Language: Dark Workbench

## Direction

本站从 warm editorial 转向 dark workbench / tool arsenal：更像一个持续更新的个人工具仓库，而不是作品集橱窗。参考 `https://www.aehyok.uk` 的暗色、搜索入口、密集工具分组和导航效率，但不复刻它的 VitePress 结构、配色或卡片样式。

## Visual Tone

- 暗色默认，亮色作为可切换工作模式。
- 信息密度优先：顶部导航紧凑，卡片边界清楚，操作入口明确。
- 氛围来自中性深色、细边框、轻微网格和状态色，不使用米色纸张感、大面积渐变或装饰性浮层。
- 强调色只负责可点击、状态和重点，不铺满页面。

## Tokens

页面 worker 优先使用语义变量，不直接写死颜色：

- 背景：`--bg`, `--surface`, `--surface-strong`, `--surface-card`, `--surface-inset`
- 边框：`--border`, `--border-strong`
- 文本：`--text`, `--text-secondary`, `--text-muted`
- 强调：`--color-accent`, `--color-accent-2`, `--color-accent-warn`, `--color-danger`
- 阴影：`--shadow-soft`, `--shadow-card`
- 尺寸：`--container-max`, `--container-narrow`, `--container-reading`, `--radius-sm`, `--radius-md`, `--radius-lg`

旧页面兼容别名保留：`--surface-2`, `--color-accent-dark`, `--color-accent-soft`, `--color-accent-ink`。

## Common Classes

- `surface-card` / `glass-card`：普通工具卡、目录块、信息面板。
- `metric-tile`：数字、状态、统计。
- `section-kicker`：区块短标签。
- `pill-note`：标签、状态、元信息。
- `divider-accent` / `section-rule`：轻量分隔。
- `tool-grid`：工具卡列表。
- `workbench-toolbar`：搜索、筛选、排序等控制区。
- `control-input`：输入框、搜索框。
- `kbd`：键盘提示，如 Cmd K。

## Page Rules

- 首屏先提供可操作入口：搜索、导航、关键工具或最新内容。
- 卡片半径保持克制，优先 6px 到 8px。
- 标题使用无衬线工作台风格；文章正文保持可读性。
- 亮色主题不是回到米色 editorial，而是浅色工具台。
