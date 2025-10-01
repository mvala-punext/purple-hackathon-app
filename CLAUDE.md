# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Knows You" (branded as "AI Wealth Manager"), an AI-powered personal finance app built as a hackathon prototype. The app connects to users' life data (banks via PSD2, health data from Garmin, Google Calendar/Email, Facebook/Instagram) to provide personalized investment recommendations, track life events, and gamify financial goals through challenges.

The application is a single-page React application with client-side state management that simulates the onboarding flow, portfolio management, life events tracking, and challenges system.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14.2.16 (App Router)
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS 4.1.9 with PostCSS
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Analytics**: Vercel Analytics

### Application Structure

The app uses a state-machine pattern with a single main component (`MoneyForLife`) that manages screen transitions:

1. **Login Screen**: Welcome screen with branding
2. **Integrations Screen**: Connect external accounts (banks, Garmin, Google, Facebook)
3. **Analyzing Screen**: Loading state while "analyzing" user data
4. **Portfolio Screen**: Main dashboard showing portfolio value, AI recommendations, and current challenges
5. **Challenges Screen**: Gamified financial goals with progress tracking
6. **Events Screen**: Timeline of detected life events from connected accounts

Key state in [app/page.tsx](app/page.tsx):
- `currentScreen`: Controls which view is displayed
- `integrations`: Tracks connection status of external services
- `recommendations`: Array of AI-generated recommendations from API
- `portfolio`: User's portfolio data including total amount and invested instruments
- `events`: Array of life events detected from connected accounts
- `isProcessingTrade` / `tradeComplete`: Trade execution states

### UI Components

All UI components are in [components/ui/](components/ui/) and follow shadcn/ui conventions:
- Radix UI primitives wrapped with custom styling
- Variants managed via `class-variance-authority`
- Utility functions in [lib/utils.ts](lib/utils.ts) using `clsx` and `tailwind-merge`

### Styling

- Uses Tailwind CSS v4 with inline `@theme` configuration
- Custom color palette defined with OKLCH color space
- CSS variables for theming (supports dark mode via `.dark` class)
- Animations via `tailwindcss-animate` and `tw-animate-css`
- Import path alias: `@/*` maps to project root

### Configuration Notes

- **next.config.mjs**: ESLint and TypeScript errors ignored during builds, images unoptimized (for static export compatibility)
- **tsconfig.json**: Uses `@/*` path alias, strict mode enabled, ES6 target
- **components.json**: shadcn/ui configuration with New York style, RSC enabled

## Development Guidelines

### Adding New Screens

To add a new screen to the app:
1. Add screen type to the `Screen` type union in [app/page.tsx](app/page.tsx:26)
2. Add conditional rendering block in the main component
3. Add navigation button in the bottom tab bar (if applicable)

### Adding UI Components

Use shadcn/ui CLI to add new components:
```bash
npx shadcn@latest add <component-name>
```

Components will be added to [components/ui/](components/ui/) with proper configuration from [components.json](components.json).

## API Integration

### Backend API

The app integrates with the Knows You API at `https://knowsyou.jens.cz` (public prototype, no authentication required).

API client and types are located in:
- [lib/api.ts](lib/api.ts) - API client functions
- [lib/api-types.ts](lib/api-types.ts) - TypeScript types matching OpenAPI spec

### Available Endpoints

**GET /profiles**
- Returns array of all user profiles
- Fetched on login, displayed in profile selection screen
- User must select a profile before continuing to integrations

**GET /profiles/{id}**
- Returns specific user profile by ID
- Used to fetch detailed profile information

**GET /recommendations**
- Returns array of AI-generated investment recommendations
- Displayed in Portfolio screen
- Shows loading animation when empty or loading

**GET /portfolio**
- Returns user's portfolio including total amount and invested instruments
- Fetched on Portfolio screen mount
- Displays holdings with percentages and color-coded visualization

**GET /events**
- Returns life events detected from connected accounts
- Fetched on Events screen mount
- Events include types: relationship, purchase, sustainability, fitness, buy_instrument, sell_instrument
- Icons and colors determined by [lib/event-icons.tsx](lib/event-icons.tsx)

**POST /trades**
- Executes a trade based on recommendation ID
- Called from `handleBuyRecommendation` function
- Refreshes portfolio and recommendations after successful trade

### Data Flow

1. User clicks Login/Sign Up → fetches profiles from API → displays profile selection screen
2. User selects a profile → stores in `selectedProfile` state → proceeds to integrations screen
3. User completes integrations → analyzing screen → navigates to portfolio
4. Portfolio screen mount → triggers `useEffect` to fetch recommendations and portfolio data
5. Events screen mount → triggers `useEffect` to fetch events data
6. User clicks recommendation button → calls `executeTrade` API → refreshes data after success
7. User clicks profile button (top right) → opens modal with detailed profile information
8. All API calls include error handling with console logging

### Event Icon Mapping

The `getEventIcon` function in [lib/event-icons.tsx](lib/event-icons.tsx) maps event types to appropriate icons and colors:
- `relationship` → Heart (pink)
- `purchase` → Car (blue)
- `sustainability` → Leaf (green)
- `fitness` → Trophy (orange)
- `buy_instrument` → TrendingUp (purple)
- `sell_instrument` → TrendingDown (red)
