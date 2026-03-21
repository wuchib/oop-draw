---
name: "oop-draw-architecture-guard"
description: "Use when making structural changes, creating packages, moving files, or reviewing boundaries in OOP Draw. Enforces the shared Web/Electron renderer, editor-core isolation, platform layering, and TypeScript-only policy."
---

# OOP Draw Architecture Guard

Use this skill when the task changes project structure, package boundaries, platform integration, or shared UI responsibilities.

## Goals
- Preserve the architecture defined in `docs/ARCHITECTURE.md`.
- Prevent Electron code from leaking into shared renderer code.
- Keep the codebase TypeScript-only.
- Keep Web and Electron using the same editor shell unless the difference is explicitly platform-specific.

## Always read first
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/TECH_SELECTION.md`

## Required checks
Before changing structure, verify:
- Does the change belong in `editor-core`, `editor-shell`, `ui`, `platform`, or an app entrypoint?
- Is any shared component trying to call browser-only or Electron-only APIs directly?
- Is the change accidentally creating two renderers or two UI implementations?
- Is the change adding JavaScript where TypeScript is required?

## Rules
- Put business-neutral shared UI in `packages/ui`.
- Put editor-specific shared UI orchestration in `packages/editor-shell`.
- Put domain logic, command stacks, serialization, hit testing, and camera math in `packages/editor-core`.
- Put storage, dialogs, shell integration, and environment adapters in `packages/platform`.
- Put Electron-only runtime code in `apps/editor-desktop/src/main` or `apps/editor-desktop/src/preload`.
- Put Web-only bootstrapping in `apps/editor-web`.

## Deliverable expectations
When you finish, explicitly state:
- What boundary was preserved or improved.
- Whether Web and Electron still share the same renderer path.
- Whether any new TypeScript-only constraints were introduced.
