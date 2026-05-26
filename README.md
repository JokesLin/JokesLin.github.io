# Joke Lin's Portal

个人综合门户站点 —— JokeLin的数字生活中心。纯静态实现，托管在 GitHub Pages。

## 站点概览

```
门户首页 (index.html)
├── 书签导航  — 12 大类 100+ 网址，支持增删自定义
├── 个人博客  — 乡村振兴 / 三农 / 农村发展方向的文章
├── 数字简历  — 数字画像报告，含技能雷达与经历时间线
├── AI 音乐   — AI 创作音乐展示与在线播放
├── AI 小说   — 内置阅读器，章节目录、字号调节、阅读进度
└── AI 软件   — AI 工具应用商店，支持 APK 下载
```

## 各模块功能

### 门户首页

- 密码锁屏（session 级），动画光效背景
- 六宫格导航卡片，悬浮动效
- 社交链接：GitHub / Bilibili / YouTube / Telegram

### 书签导航

| 分类     | 示例内容                                         |
| -------- | ------------------------------------------------ |
| AI 工具  | Google、Gemini、ChatGPT、Grok、Claude、DeepSeek  |
| 论文相关 | PaperYY、PaperPass、Sci-Hub、知网、Google 学术   |
| 校园     | 维普、学习通、福建农林大学                       |
| 考研考试 | 研招网、NTCE、学信网、统计年鉴                   |
| 视听娱乐 | LIBVIO、Movie Station、HDmoli、歌曲宝、Z-Library |
| 网盘     | 百度网盘、夸克网盘、蓝奏云、阿里云盘             |
| 技术资源 | 内网穿透、技术社区、开发工具                     |
| 图形编辑 | 在线 PS、PDF 工具、OCR、以图搜图                 |
| BT 磁力  | 磁力搜索、BT 资源站                              |
| 游戏     | PC / Switch / PS4 资源、Mod、SteamGridDB         |
| 网络工具 | 代理工具、Tailscale、ZeroTier、FOFA              |

- 侧边栏分类锚点导航，滚动高亮
- 浮动按钮添加书签（名称、URL、图标、分类、颜色）
- 悬停删除书签，底部「恢复默认」清除自定义

### 个人博客

- 分类筛选：乡村振兴 / 三农 / 农村发展
- 文章列表 + 详情双视图
- 数据驱动，内容存储在 `blog/data.json`

### 数字简历

- 个人信息卡片 + 性格标签
- 教育经历时间线（本科 → 硕士在读）
- 技能雷达：技术 / 学术 / 综合三大类动画进度条
- 科研经历、荣誉奖项展示

### AI 音乐

- 歌单分区展示，歌曲卡片内嵌 HTML5 播放器
- 标签标注（AI 创作 / 人声等）

### AI 小说

- 作品列表 → 内置阅读器无缝切换
- 自动解析章节目录（正则匹配 `第X章`）
- 字号调节（A-/A+）、章节前后导航、顶部阅读进度条

### AI 软件

- 分类筛选：AI 阅读 / AI 对话 / AI 图像 / AI 效率
- 软件详情页含版本信息、功能列表、APK 下载
- 已上架：致远阅读（ZhiYuan Reader）17.5 MB

## 设计风格

- 暗色主题（`#0f0f1a`），紫 / 粉渐变点缀
- 毛玻璃卡片（Glassmorphism）
- 共享设计系统 `assets/global.css`，CSS 变量驱动
- 移动端自适应（768px 断点，汉堡菜单）

## 技术栈

- 纯 HTML + CSS + JavaScript，零外部依赖
- CSS Grid + Flexbox 响应式布局
- 数据驱动：各模块独立 `data.json`，编辑 JSON 即更新内容
- `localStorage` 存储用户自定义书签
- `sessionStorage` 管理门户密码状态
- 自定义 404 页面

## 使用

直接访问 [https://jokeslin.github.io/](https://jokeslin.github.io/) 即可使用。

暗号需通过JokeLin授权使用。

## License

MIT
