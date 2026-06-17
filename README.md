# Joke Lin's Portal

个人综合门户站点，托管于 GitHub Pages。纯静态实现，零外部依赖。

**[ jokeslin.github.io ](https://jokeslin.github.io/)**

## 站点结构

```
index.html                  门户首页 — 密码锁屏、星空动效、六模块导航
assets/global.css           共享设计系统（CSS 变量、毛玻璃组件、响应式布局）
content/
  ├── bookmarks/            书签导航 — 11 大类 100+ 网址，支持自定义增删
  ├── blog/                 个人博客 — 分类筛选，数据驱动
  ├── resume/               数字简历 — 技能雷达、经历时间线、性格标签
  ├── music/                AI 音乐 — 歌单展示、HTML5 在线播放
  ├── novel/                AI 小说 — 章节目录、字号调节、阅读进度
  └── ai-software/          AI 软件 — 分类筛选、APK 下载
```

每个模块都是独立的 `index.html` + `data.json` 组合，编辑 JSON 即可更新内容，无需构建步骤。

## 各模块

### 门户首页

- 密码锁屏验证，星空粒子动效背景
- 六模块导航卡片，悬浮渐变动效
- 社交入口：GitHub / Bilibili / YouTube / Telegram

### 书签导航

11 个分类，侧边栏锚点导航，滚动自动高亮：

| 分类     | 内容示例                                           |
| -------- | -------------------------------------------------- |
| AI 工具  | ChatGPT、Claude、Gemini、Grok、DeepSeek            |
| 论文相关 | PaperYY、PaperPass、Sci-Hub、知网、CARSI           |
| 校园     | 维普毕业论文、学习通、福建农林大学教务             |
| 考研考试 | 研招网、NTCE、学信网、统计年鉴                     |
| 视听娱乐 | LIBVIO、Movie Station、HDmoli、Z-Library           |
| 网盘     | 百度网盘、夸克网盘、阿里云盘、PikPak               |
| 技术资源 | Tailscale、ZeroTier、内网穿透、GitHub、Greasy Fork |
| 图形编辑 | iLovePDF、Convertio、OCR、以图搜图                 |
| BT 磁力  | Pirate Bay、BT 影视下载                            |
| 游戏     | Switch/PC 资源、Mod、金手指、SteamGridDB            |
| 网络工具 | 订阅转换、FOFA、OpenWrt、OpenClash                 |

- 浮动按钮添加自定义书签（名称、URL、图标、分类、颜色）
- 悬停删除，底部「恢复默认」清除全部自定义

### 个人博客

- 4 篇文章，涵盖乡村振兴、三农、农村发展、AI 学术应用
- 分类筛选 + 列表/详情双视图
- 内容以 HTML 存储在 `blog/data.json` 中

### 数字简历

- 个人资料卡 + 14 项性格标签
- 教育经历时间线（硕士在读，福建农林大学经济与管理学院）
- 9 项技能雷达（技术 / 学术 / 综合三个维度，动画进度条）
- 2 项科研经历、9 项荣誉奖项
- 工作习惯画像（核心工具链、活跃时段分析）

### AI 音乐

- 歌单卡片展示，内嵌 HTML5 音频播放器
- 当前收录：AI 辅助创作作品「远离林致远」

### AI 小说

- 5 部 AI 辅助创作作品：达娜的贴身高手、斗破农大、重生之林致远的抽象人生、致远一笑很倾城、农族
- 内置阅读器：正则自动解析章节目录、字号调节（A-/A+）、章节前后导航、顶部阅读进度条

### AI 软件

- 分类筛选：AI 阅读 / AI 对话 / AI 图像 / AI 效率
- 已上架：致远阅读（ZhiYuan Reader）v1.0.0 — Android APK 下载
- 即将上线：AI 写作助手

## 设计风格

- 纯黑底色（`#000000`），红/紫/蓝渐变点缀
- 毛玻璃卡片（Glassmorphism）
- CSS 变量驱动的共享设计系统（`assets/global.css`）
- 移动端自适应（768px 断点，汉堡菜单）

## 技术栈

- 纯 HTML + CSS + 原生 JavaScript，零 npm 依赖
- CSS Grid + Flexbox 响应式布局
- 数据驱动架构：各模块独立 `data.json`，编辑即更新
- `localStorage` 存储自定义书签
- `sessionStorage` 管理门户密码状态
- GitHub Pages 部署，`.nojekyll` 禁用 Jekyll 处理

## 本地运行

```bash
npx serve .
# 或
python -m http.server 8000
```

访问 `http://localhost:8000` 即可。

## License

MIT