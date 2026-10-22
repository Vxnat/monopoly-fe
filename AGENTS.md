<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🎲 MONOPOLY 3D (CỜ TỶ PHÚ 3D ONLINE) - AGENT INSTRUCTIONS

This file outlines the architectural standards, directory structure, coding rules, and conventions for developing the Monopoly 3D Web Application.

---

## 🏛️ Project Architecture & Separation of Concerns

1. **3D World (`src/components/3d/`):**
   - Pure React Three Fiber & Three.js components (Canvas, Board3D, Tile3D, Token3D, Dice3D, Lights, Camera).
   - Never mix direct DOM UI manipulation inside 3D mesh components.
   - Use `zustand` to communicate between 3D and 2D UI.

2. **2D Overlay World (`src/components/ui/`):**
   - Pure DOM UI with Tailwind CSS and glassmorphism styling overlaying the 3D Canvas.
   - Includes HUD, Modals, Action buttons, Player cards, and Event log.

3. **State Management (`src/store/`):**
   - `gameStore.ts`: Authoritative local game loop and player/board state.
   - `uiStore.ts`: Modals, active selected tile, camera view mode.
   - `soundStore.ts`: Audio triggers and volume state.

4. **Types & Data (`src/types/` & `src/constants/`):**
   - All shared domain types must live in `src/types/`.
   - 40-tile board definitions and card sets must live in `src/constants/`.

---

## 📂 Directory Layout

```text
monopoly-3d/
├── public/
│   ├── models/                 # 3D assets (.glb, .gltf)
│   ├── sounds/                 # Audio files (.mp3)
│   └── textures/               # Board decals and textures
├── src/
│   ├── types/                  # Domain contracts (game.ts, cards.ts, colyseus.ts)
│   ├── constants/              # boardData.ts (40 tiles), cards, gameConfig.ts
│   ├── utils/                  # boardCoordinates.ts (3D math), dicePhysics.ts, formatters.ts
│   ├── store/                  # gameStore.ts, uiStore.ts, soundStore.ts
│   ├── components/
│   │   ├── 3d/                 # Scene.tsx, Board3D.tsx, Tile3D.tsx, Token3D.tsx, Dice3D.tsx
│   │   └── ui/                 # HUD, Modals (BuyPropertyModal, TradeModal, CardModal), Controls
│   ├── hooks/                  # useSoundEffects.ts, usePawnMovement.ts, useColyseusRoom.ts
│   └── app/                    # page.tsx, layout.tsx, globals.css
├── ROADMAP.md                  # Development progress tracking
└── AGENTS.md                   # AI Developer conventions
```

---

## 🎯 Coding Conventions

- **Next.js & React:** React 19 + Next.js App Router. Use `"use client"` directive on all 3D canvas and interactive components.
- **Three.js Performance:** Avoid creating new Geometries or Materials inside `useFrame` render loops. Reuse meshes and instances where possible.
- **Math & Coordinates:** All 40 tiles are mapped onto a symmetrical square board centered at $(0, 0, 0)$.
- **Multiplayer Readiness:** Design state modifications to be pure and easily serializable so they can be hooked into `Colyseus.js` state schemas seamlessly.
