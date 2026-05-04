# Intersection Template (Next.js + Tailwind v4)

General-purpose, single-page starter extracted from the shared primitives of two sites:

- Sticky header + section navigation + active-section tracking
- Generic search + tag filter + load more collection component
- Minimal three.js animated background (illustration only)

## Develop

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What To Edit First

- `src/app/page.tsx` (demo page)
- `src/app/globals.css` (design tokens and global styles)

## Components

- `src/components/SiteHeader.tsx`
- `src/components/FilterableCollection.tsx`
- `src/components/ThreeBackground.tsx`
- `src/lib/useActiveSection.ts`

