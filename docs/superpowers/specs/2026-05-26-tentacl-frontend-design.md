# Tentacl Frontend Design Specification
Date: 2026-05-26
Status: Approved

## Overview
Phase 2 focuses on building the React-based frontend for Tentacl. The UI will follow a "Terminal/Dark" aesthetic, providing a high-density, keyboard-friendly interface for Docker management.

## Visual Identity
- **Theme:** Ultra-dark background (`#000000` or `#0a0a0a`).
- **Typography:** Monospace fonts only (e.g., JetBrains Mono, Fira Code).
- **Accents:** Neon green (`#00ff00`) for success/running, red (`#ff0000`) for errors/stopped, and amber (`#ffbf00`) for warnings.
- **Credit:** Small "creator: gibranlp" text in the sidebar footer.

## Core Components
### 1. Layout System
- **Sidebar (Left):** Persistent navigation links (Dashboard, Containers, Images, Networks, Volumes).
- **Main Area:** Dynamic content based on navigation.
- **Split Pane:** A toggleable detail view (Right or Bottom) that appears when a resource is selected, showing logs, stats, or JSON inspection.

### 2. Resource Tables
- High-density data grids.
- Status indicators (e.g., `[RUNNING]`, `[STOPPED]`).
- Quick actions (Start, Stop, Restart) available on hover or selection.

## Tech Stack
- **Framework:** React 18+ (TypeScript).
- **Build Tool:** Vite.
- **Styling:** Tailwind CSS.
- **Icons:** Lucide-React (styled to look like ASCII/simple glyphs).
- **Data Fetching:** TanStack Query (React Query) for polling Docker state.

## Implementation Phases
1. **Scaffolding:** Initialize Vite + Tailwind.
2. **Theme Setup:** Configure Tailwind colors and typography for the Terminal look.
3. **Layout & Navigation:** Implement Sidebar and basic routing.
4. **Container View:** List containers from the Go API and implement the Split Pane for details.
