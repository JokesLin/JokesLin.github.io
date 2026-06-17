# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Joke Lin's Portal — a pure static personal portal site hosted on GitHub Pages at https://jokeslin.github.io/. Zero external dependencies, zero build tools. Pure HTML + CSS + vanilla JavaScript.

## Architecture

```
index.html                  ← Portal homepage with password lock screen
assets/global.css           ← Shared design system (CSS variables, reset, common components)
content/
  ├── bookmarks/            ← Bookmark navigation (sidebar layout, 12 categories)
  ├── blog/                 ← Blog posts (category filtering, list + detail views)
  ├── resume/               ← Digital resume (timeline, skill radar, personality tags)
  ├── music/                ← AI music player (playlist cards, HTML5 audio)
  ├── novel/                ← AI novel reader (chapter parser, font size, progress bar)
  └── ai-software/          ← AI software store (category filter, APK download)
```

Each content module is a standalone `index.html` + `data.json` pair:
- **`data.json`** is the single source of truth for content — edit JSON to update site content
- **`index.html`** renders data with inline `<script>` and `<style>` (no build step)
- Modules reference shared styles via `../../assets/global.css`
- Homepage fetches each module's `data.json` at runtime to display stats

## Key Patterns

- **Data-driven content**: All content lives in `data.json` files. To add a blog post, bookmark, song, novel, or software entry, edit the corresponding `data.json`.
- **Bookmarks special handling**: `bookmarks/data.json` has `deleted` and `custom` arrays alongside `categories` to support user-added/removed bookmarks stored in `localStorage`.
- **Blog content**: Posts store HTML content directly in the `content` field of `data.json` (not Markdown).
- **Novel files**: Novel text files live in `content/novel/files/`, chapters are auto-parsed by regex matching `第X章`.
- **Music files**: Audio files live in `content/music/files/`.
- **Software APKs**: Download files live in `content/ai-software/files/`.
- **Design system**: Dark theme (`#0f0f1a`), purple/pink gradient accents, glassmorphism cards. CSS variables defined in `assets/global.css` (`--accent-1`, `--accent-2`, `--bg-primary`, etc.).
- **No build/lint/test commands**: This is a static site with no package.json, no bundler, no tests. Open `index.html` directly in a browser or serve with any static file server.

## Development

```bash
# Serve locally (pick any static server)
npx serve .
# or
python -m http.server 8000
```

Then visit `http://localhost:8000`. The portal requires a passcode (stored as plaintext `SECRET_CODE` in `index.html` line 476) and uses `sessionStorage` to persist auth within a session.

## Important Notes

- All HTML files use `lang="zh-CN"` and Chinese content throughout
- Sub-module pages link back to portal via relative `../../` paths
- The portal password lock uses `sessionStorage` (not cookies), so it resets per tab session
- Blog posts use `<meta http-equiv="Cache-Control" content="no-cache">` to prevent stale content
- The `.nojekyll` file disables Jekyll processing on GitHub Pages
