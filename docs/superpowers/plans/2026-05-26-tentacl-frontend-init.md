# Tentacl Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the Tentacl React frontend with Vite, Tailwind CSS, and build the core Terminal-inspired layout.

**Architecture:** Component-based architecture using React and Tailwind. TanStack Query for data fetching.

**Tech Stack:** React (TypeScript), Vite, Tailwind CSS, Lucide React, TanStack Query.

---

### Task 1: Frontend Scaffolding

**Files:**
- Create: `frontend/` (Vite project)
- Create: `frontend/tailwind.config.js`
- Create: `frontend/src/index.css`

- [ ] **Step 1: Initialize Vite project**
Run: `npm create vite@latest frontend -- --template react-ts`

- [ ] **Step 2: Install dependencies**
Run: `cd frontend && npm install && npm install -D tailwindcss postcss autoprefixer lucide-react @tanstack/react-query`

- [ ] **Step 3: Initialize Tailwind**
Run: `cd frontend && npx tailwindcss init -p`

- [ ] **Step 4: Configure Tailwind for Terminal theme**
```javascript
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#000000",
          fg: "#00ff00", // Neon Green
          dim: "#004400",
          accent: "#00ffff", // Cyan
          danger: "#ff0000",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Setup Global CSS**
```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-terminal-bg text-terminal-fg font-mono antialiased;
}
```

- [ ] **Step 6: Commit**
```bash
git add frontend/
git commit -m "chore: scaffold frontend with vite and tailwind"
```

### Task 2: Core Layout & Sidebar

**Files:**
- Create: `frontend/src/components/Sidebar.tsx`
- Create: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Implement Sidebar with Creator Credit**
```tsx
// frontend/src/components/Sidebar.tsx
import { LayoutDashboard, Box, Layers, Globe, Database } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'DASHBOARD' },
  { icon: Box, label: 'CONTAINERS' },
  { icon: Layers, label: 'IMAGES' },
  { icon: Globe, label: 'NETWORKS' },
  { icon: Database, label: 'VOLUMES' },
];

export const Sidebar = () => (
  <div className="w-64 h-screen border-r border-terminal-dim flex flex-col p-4">
    <div className="text-xl font-bold mb-8 text-white tracking-tighter">Tentacl v0.1.0</div>
    <nav className="flex-1 space-y-2">
      {navItems.map((item) => (
        <div key={item.label} className="flex items-center space-x-2 cursor-pointer hover:bg-terminal-dim p-2 rounded group">
          <item.icon size={18} className="group-hover:text-white" />
          <span className="text-sm">{item.label}</span>
        </div>
      ))}
    </nav>
    <div className="mt-auto pt-4 border-t border-terminal-dim text-[10px] text-gray-600 text-right">
      creator: gibranlp
    </div>
  </div>
);
```

- [ ] **Step 2: Implement Layout Wrapper**
```tsx
// frontend/src/components/Layout.tsx
import { Sidebar } from './Sidebar';

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-terminal-bg overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
);
```

- [ ] **Step 3: Update App entry**
```tsx
// frontend/src/App.tsx
import { Layout } from './components/Layout';

function App() {
  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-white border-b border-terminal-dim pb-2">> SYSTEM_OVERVIEW</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-terminal-dim p-4">
            <div className="text-xs text-gray-500">CPU_USAGE</div>
            <div className="text-2xl">4.2%</div>
          </div>
          <div className="border border-terminal-dim p-4">
            <div className="text-xs text-gray-500">MEM_USAGE</div>
            <div className="text-2xl">1.2 GB / 8 GB</div>
          </div>
          <div className="border border-terminal-dim p-4">
            <div className="text-xs text-gray-500">UPTIME</div>
            <div className="text-2xl">12d 4h 22m</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
```

- [ ] **Step 4: Commit**
```bash
git add frontend/src/
git commit -m "feat: implement terminal layout and sidebar"
```

### Task 3: Container List Integration

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/components/ContainerTable.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Setup API client and Query Provider**
- [ ] **Step 2: Implement Container table with "Terminal" styling**
- [ ] **Step 3: Wire up polling with TanStack Query**
- [ ] **Step 4: Commit**
