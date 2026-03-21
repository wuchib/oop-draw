---
name: "oop-draw-scaffold"
description: "Use when scaffolding or extending the OOP Draw monorepo. Creates packages, config files, scripts, and workspace wiring that match the architecture docs and the TypeScript-only rule."
---

# OOP Draw Scaffold

Use this skill when creating or extending the repository skeleton for OOP Draw.

## Goals
- Scaffold the workspace in the layout defined in `docs/ARCHITECTURE.md`.
- Keep all source, scripts, and configs in TypeScript when the toolchain supports it.
- Keep app entrypoints thin and shared packages reusable.

## Always read first
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/TECH_SELECTION.md`

## Scaffold order
1. Root workspace config
2. `packages/shared`
3. `packages/editor-core`
4. `packages/ui`
5. `packages/editor-shell`
6. `packages/platform`
7. `apps/editor-web`
8. `apps/editor-desktop`
9. Future placeholder for `apps/marketing-share-web`

## Constraints
- Do not mix JavaScript and TypeScript.
- Use TypeScript configs such as `eslint.config.ts` and `prettier.config.ts`.
- Do not place Electron APIs in shared packages.
- Keep renderer entrypoints thin and inject platform services.
- Prefer one workspace command per concern instead of app-specific ad hoc commands.

## Deliverables
For scaffolding work, produce:
- The directories and files created
- Any scripts added to the root workspace
- Any follow-up steps needed before feature work begins
