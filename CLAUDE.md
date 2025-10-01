# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Money for Life" (purple-hackathon-app) - An AI-powered wealth management application that integrates with users' life data (banks, health tracking, calendar, social media) to provide personalized investment recommendations and financial challenges.

**Tech Stack:**
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS v4 with custom theme system
- shadcn/ui component library (New York style)
- pnpm as package manager
- Vercel Analytics

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Architecture & Key Patterns

### App Structure
- Single-page application using client-side routing via state management
- Main entry: `app/page.tsx` - contains entire application logic as "MoneyForLife" component
- Multi-screen flow: login → integrations → analyzing → portfolio → challenges → events
- State management handled via React useState (no external state library)

### UI Component System
- **Base components**: `components/ui/*` - shadcn/ui primitives (buttons, cards, dialogs, etc.)
- **Theme**: Uses Geist fonts (sans & mono) from Vercel
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
  - Color system uses OKLCH color space
  - CSS variables defined in `app/globals.css`
  - Custom dark mode support via `.dark` class variant

### Path Aliases (tsconfig.json)
- `@/*` - Maps to project root
- `@/components` - UI components
- `@/lib` - Utility functions
- `@/hooks` - React hooks

### Component Architecture
The main app (`app/page.tsx`) manages:
1. Screen navigation (login, integrations, analyzing, portfolio, challenges, events)
2. Integration connections (Banks/PSD2, Garmin, Google, Facebook/Instagram)
3. Portfolio state (empty vs. populated)
4. Trade execution simulation (modal, loading, success states)
5. Life events detection from connected accounts
6. Financial challenges with progress tracking

### Key Features
- **Life Event Detection**: Analyzes connected accounts to identify major life events (marriage, house purchase, job changes, etc.) that influence investment recommendations
- **AI Recommendations**: Personalized investment suggestions based on idle cash analysis
- **Challenge System**: Gamified savings goals with progress tracking
- **Bottom Navigation**: Fixed navigation bar for primary screens (Portfolio, Challenges, Events)

## Build Configuration

`next.config.mjs` disables:
- ESLint during builds (`ignoreDuringBuilds: true`)
- TypeScript error checking during builds (`ignoreBuildErrors: true`)
- Image optimization (`unoptimized: true`)

This suggests rapid prototyping/hackathon development approach.

## UI Component Library

Uses shadcn/ui configured in `components.json`:
- Style: "new-york"
- RSC enabled
- Base color: neutral
- Icon library: lucide-react
- Component path: `@/components/ui`
