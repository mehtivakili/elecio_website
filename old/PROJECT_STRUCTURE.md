# Project Structure

This document outlines the organized folder structure for easy development and expansion.

## 📁 Directory Structure

```
src/
├── app/                    # Next.js App Router (Pages & Routes)
│   ├── layout.tsx         # Root layout with Topbar
│   ├── page.tsx           # Home/Landing page
│   └── globals.css        # Global styles
│
├── components/            # Reusable React Components
│   ├── layout/           # Layout components (Topbar, Footer, etc.)
│   │   ├── Topbar.tsx
│   │   └── index.ts
│   │
│   ├── landing/          # Landing page specific components
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   └── index.ts
│   │
│   └── [feature]/        # Feature-specific components (create as needed)
│       └── ...
│
├── hooks/                # Custom React Hooks
│   └── ...
│
├── lib/                  # Utility Functions & Helpers
│   └── utils.ts
│
├── providers/            # Context Providers
│   └── AntdProvider.tsx
│
├── types/                # TypeScript Type Definitions
│   └── index.ts
│
└── constants/            # Application Constants
    └── index.ts

public/
├── landing/              # Landing page assets
│   ├── top.jpg
│   ├── device.png
│   └── support.gif
└── ...
```

## 🎯 Component Organization Rules

1. **Layout Components** (`components/layout/`)
   - Topbar, Footer, Sidebar, etc.
   - Shared across multiple pages

2. **Feature Components** (`components/[feature]/`)
   - Group components by feature/page
   - Example: `components/landing/`, `components/products/`, etc.

3. **Shared Components** (`components/`)
   - Truly reusable components (Buttons, Cards, etc.)
   - Can be used across different features

4. **Each component folder should have:**
   - Component file(s)
   - `index.ts` for clean imports
   - Optional: `types.ts` for component-specific types

## 📝 Naming Conventions

- **Components**: PascalCase (e.g., `HeroSection.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Folders**: lowercase, descriptive (e.g., `landing/`, `layout/`)

## 🔄 Adding New Features

When adding a new feature/page:

1. Create a new folder in `components/[feature-name]/`
2. Add components specific to that feature
3. Create an `index.ts` for exports
4. Import in the page: `import { Component } from '@/components/[feature]'`

## 📦 Import Pattern

```typescript
// ✅ Good - Clean imports
import { HeroSection } from '@/components/landing';
import { Topbar } from '@/components/layout';

// ❌ Bad - Direct file imports
import HeroSection from '@/components/landing/HeroSection';
```

