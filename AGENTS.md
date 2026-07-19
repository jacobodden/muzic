# Hit Me With Your Best Shot

A host-controlled music clip guessing party game. Enter a YouTube playlist, play song clips from the start, and players compete to guess the song. The host controls playback and adjudicates answers. Built offline-first as a PWA.

## Quick Start

```bash
npm install
cp .env.example .env.local   # then edit .env.local with your YouTube API key
npm run dev                  # dev server
npm run build                # production build
npm run preview              # preview production build
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite |
| PWA | vite-plugin-pwa (Workbox) |
| Offline Storage | Dexie.js (IndexedDB) |
| State | Zustand |
| Styling | Tailwind CSS |
| YouTube Playback | YouTube IFrame API |
| YouTube Data | YouTube Data API v3 |

## Directory Structure

```
src/
  components/
    screens/        # Top-level screen components (Welcome, Setup, Game, GameOver)
  stores/           # Zustand state stores
  db/               # Dexie database definition and helpers
  hooks/            # Custom React hooks
  lib/              # Pure utility functions, API wrappers
  types/            # TypeScript type definitions
  App.tsx           # Root component with routing
  main.tsx          # Entry point
docs/               # Project documentation
```

## Coding Conventions

- **Components**: PascalCase, one component per file, default export
- **Hooks**: camelCase, prefixed with `use`, named export
- **Stores**: camelCase, `create<Name>Store`, named export
- **Types**: PascalCase, `interface` over `type` where possible, named export
- **CSS**: Tailwind utility classes primarily
- **Imports order**: React → third-party → internal (absolute `@/` alias)

## State Management Pattern

Zustand stores for global game state (players, scores, current song). React state for ephemeral UI state. Dexie for persistent data (playlist cache, game history).

## Key Architecture Decisions

1. **YouTube Data API key** is set via `VITE_MUZIC_YT_API_KEY` env var (`.env.local` or CI secret).
2. **Playlist metadata** is cached in IndexedDB — refetch only on cache expiry.
3. **YouTube IFrame player** is hidden via CSS. Audio still plays.
4. **No authentication**. This is a local party game — all state is on-device.
5. **Offline**: App shell works offline. Playlist data works offline if cached. Playback requires internet.

## Game Flow

1. **Welcome** → Enter playlist URL → Fetch & cache videos
2. **Setup** → Add players → Start game
3. **Playing** → Play clips (5s/10s/pause/skip) → Host awards points → Next song
4. **Game Over** → Final scores → Play again or new playlist

## Routing

Simple screen-based navigation via Zustand `screen` state (no React Router needed):

```
screen: 'welcome' | 'setup' | 'game' | 'gameover'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MUZIC_YT_API_KEY` | Yes | YouTube Data API v3 key (formerly `VITE_YOUTUBE_API_KEY`) |

Set in `.env.local` for local dev, or as a CI secret for production builds. Only `VITE_` prefixed vars are available to client code.

See `.env.example` for the template.

## NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build with PWA |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type check |

---
See `docs/` for detailed architecture, data model, component tree, game flow, and YouTube integration documentation.
