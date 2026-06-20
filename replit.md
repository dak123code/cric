# Workspace

## Overview

Cricket Manager — a full-stack cricket management game with four game modes.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Shadcn/ui + Framer Motion

## Game Modes

1. **Career Mode** — Manage an IPL franchise. Sign/release players, set your XI, play 14-match seasons, qualify for playoffs, win trophies. Persisted in PostgreSQL.
2. **Draft vs AI** — Pick 11 from a random 30-player pool (by role), AI drafts the rest. Simulate a T20.
3. **Quick Match** — Choose 2 countries and play an interactive ball-by-ball T20 with toss, batting (direction + timing bar) and bowling (pitch-target grid) mechanics.
4. **2-Player Draft** — Two humans alternate picks from a 30-player pool, then play each other.

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/lib/
│   │       ├── players.ts      # Player database (100 players) + country/IPL data
│   │       ├── matchEngine.ts  # T20 ball-by-ball simulation engine
│   │       └── careerManager.ts # Career mode persistence + season simulation
│   └── cricket-manager/    # React + Vite frontend
│       └── src/pages/
│           ├── home.tsx         # Main menu
│           ├── quick-match.tsx  # Country vs Country
│           ├── draft-ai.tsx     # Draft vs AI
│           ├── draft-2p.tsx     # 2-Player draft
│           ├── career-setup.tsx # Career creation
│           ├── career-dashboard.tsx # Career management
│           └── match-play.tsx       # Interactive ball-by-ball match game
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/career.ts  # careers table
```

## Key Notes

- Career data persisted in `careers` table in PostgreSQL
- Player pool: 100 real-world cricketers across 10 countries
- Match engine is probabilistic, uses batting/bowling ratings per player
- Interactive match (`/match-play`) is driven entirely on the frontend (no server calls); match setup passed via `src/lib/match-store.ts` module variable
- Batting: user picks direction (leg/straight/off) then hits SWING on a timing bar; timing quality (perfect/good/early/late/miss) drives the outcome
- Bowling: user picks pitch zone (3 lengths × 3 lines) then clicks BOWL; difficulty ratings drive AI batting result
- All API routes are under `/api/game/...`
- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`
