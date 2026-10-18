# Design System Playground

A design system for AI and agent products, built with React, TypeScript and Vite. It has design tokens, accessible components and a docs site with live demos.

## What's inside

- **Tokens** (`src/tokens/tokens.css`): primitives, semantic tokens and light/dark themes, all as CSS variables.
- **Components** (`src/components`), exported from `src/components/index.ts`:
  - **Core:** Button, Input, Search, Dropdown, Switch, Tabs, Progress Steps, Modal, Toast, Tooltip, Badge, Disclosure
  - **AI interaction:** Chat Input, AI Response, Structured Output, Dynamic Form
  - **Orchestration:** Execution Tracker, Workflow Nodes, Agent Directory, Agent Handoff
  - **Data & trust:** Approval Request, Knowledge Sources, Tool Execution, Activity Timeline
  - **Governance:** Policy Guardrails, Evaluation Suite, Release Controls
- **Docs site** (`src/App.tsx`, `src/docs`): a sidebar with one page per component. Each page has a live preview, do and don't guidelines, and accessibility notes. There is also an Agentic Principles article.

## Accessibility

- Visible focus rings on every interactive component.
- Tabs follow the WAI-ARIA pattern (roving tabindex, arrow keys).
- Modal is built on native `<dialog>`, so focus is trapped.
- Input errors are announced to screen readers.
- Motion respects `prefers-reduced-motion`.
- Each docs page sets its own title and moves focus to its heading. A skip link jumps to the content.

## Run it

```bash
npm install
npm run dev
```

Other scripts:

- `npm run build`: type-check and build for production
- `npm run preview`: serve the production build
- `npm run lint`: run oxlint
