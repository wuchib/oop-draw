---
name: "oop-draw-component-system"
description: "Use when adding or changing shared UI primitives, Tailwind tokens, or Reka-based interaction components in OOP Draw."
---

# OOP Draw Component System

Use this skill when the task changes `packages/ui`, shared tokens, or the boundary between `packages/ui` and `packages/editor-shell`.

## Always read first
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/TECH_SELECTION.md`

## Purpose
- Keep shared UI platform-neutral.
- Prefer Reka UI primitives for focus management, overlays, menus, and tabs.
- Keep Tailwind tokens and CSS variables aligned in one system.
- Prevent `packages/editor-shell` from rebuilding generic primitives.

## Placement rules
- Put generic primitives and tokens in `packages/ui`.
- Put editor-specific layouts, inspectors, toolbars, and shell composition in `packages/editor-shell`.
- Never put Electron APIs, platform checks, or editor-core runtime logic in `packages/ui`.

## Implementation rules
- Style shared primitives with Tailwind CSS classes backed by `packages/ui/src/styles/tokens.css`.
- Reuse Reka UI for dialogs, popovers, menus, tooltips, tabs, separators, and scroll areas instead of hand-rolling the interaction layer.
- Keep component APIs small and reusable. Favor `variant`, `size`, `disabled`, and `asChild` over product-specific prop names.
- Keep helper utilities internal to `packages/ui` unless another package truly needs them.

## Validation checklist
- Do Web and Electron still share the same renderer path?
- Did the change stay inside `packages/ui` unless the component is editor-specific?
- Are focus behavior, keyboard interaction, and overlay layering delegated to Reka where appropriate?
- Do Tailwind classes consume shared tokens instead of introducing ad hoc colors and spacing?
- Were relevant checks run, especially `pnpm typecheck`, `pnpm lint`, `pnpm test`, and build commands when shared styles changed?
