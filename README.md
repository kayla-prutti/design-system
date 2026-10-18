# Design System Playground

A small design system built with React, TypeScript and Vite. It shows design tokens, accessible components and a live docs page.

## What's inside

- **Tokens** (`src/tokens/tokens.css`): primitives, semantic tokens and light/dark themes, all as CSS variables.
- **Components** (`src/components`): Button, Input, Switch, Tabs, Modal and Badge.
- **Docs page** (`src/App.tsx`): token explorer and live controls.

## Accessibility

- Visible focus rings on every interactive component.
- Tabs follow the WAI-ARIA pattern (roving tabindex, arrow keys).
- Modal is built on native `<dialog>`, so focus is trapped.
- Input errors are announced to screen readers.
- Motion respects `prefers-reduced-motion`.

## Run it

```bash
npm install
npm run dev
```
# design-system
