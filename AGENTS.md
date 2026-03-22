# AGENTS.md

## Mission
Build OOP Draw as a TypeScript-only whiteboard product with a shared renderer for Web and Electron, a strong architecture boundary between editor core and platform code, and durable repo-level AI guidance.

## Sources of truth
Use these files first when they are relevant:
- `docs/PRD.md`
- `docs/TECH_SELECTION.md`
- `docs/ARCHITECTURE.md`

If a request conflicts with those docs, ask for clarification before changing architecture direction.

## Repository status
This repo is in the architecture and scaffolding phase.
Current committed product decisions include:
- TypeScript only across source code, scripts, and config files. Do not add `.js`, `.cjs`, or mixed JS/TS variants when a TypeScript option exists.
- Web editor uses Vue 3.
- Desktop uses Electron.
- The editor runtime is client-rendered; SEO pages are a future separate SSR/SSG app.
- Web and Electron should share one renderer and one editor shell wherever possible.

## Target layout
As the project is scaffolded, prefer this structure:
- `apps/editor-web`
- `apps/editor-desktop`
- `apps/marketing-share-web`
- `packages/shared`
- `packages/editor-core`
- `packages/ui`
- `packages/editor-shell`
- `packages/platform`
- `docs`

## Core architecture rules
- Keep `packages/editor-core` free of Electron APIs, browser-only globals, and framework-specific UI code.
- Keep shared Vue UI in `packages/ui` or `packages/editor-shell`.
- Build business-neutral primitives in `packages/ui` with Tailwind CSS + Reka UI + a thin OOP Draw skin layer.
- Keep `packages/editor-shell` focused on editor-specific composition such as toolbars, inspectors, status bars, and shell-level state wiring.
- Keep platform-specific behavior in `packages/platform` or Electron `main` / `preload`.
- Do not call Electron APIs directly from shared Vue components.
- Do not make Web and Electron diverge in layout or interaction unless the platform difference is user-visible and necessary.
- Desktop should enhance platform capability, not fork the product UI.
- SEO-oriented pages belong in the future `marketing-share-web` app, not the editor runtime.

## TypeScript-only policy
- New source files must use `.ts`, `.tsx` only if truly required, or `.vue` with TypeScript script blocks.
- New config files must use `.ts` when supported by the toolchain.
- Do not introduce `.js`, `.mjs`, `.cjs`, or `.jsx` files unless the user explicitly approves an exception and the tool has no supported TypeScript configuration path.
- Keep shared types in typed modules instead of duplicating literal shapes across apps.

## Working style
For each substantial task, prefer this workflow:
1. Read the relevant docs and nearby code first.
2. Make a short plan when the task is multi-step.
3. Implement the smallest correct change set.
4. Add or update tests when behavior changes.
5. Run the most relevant checks.
6. Review the diff for architecture drift, regressions, and TypeScript boundary violations.

## Done means
A task is not done until all relevant items below are true:
- The requested behavior or artifact exists.
- TypeScript types remain sound.
- The change respects package boundaries and renderer-sharing rules.
- Relevant tests or checks were run, or the reason they were not run is stated explicitly.
- New architectural decisions are reflected in docs if they change long-term guidance.

## Commands and validation
When the project is scaffolded, prefer documenting and using workspace-level commands such as:
- install: `pnpm install`
- lint: `pnpm lint`
- typecheck: `pnpm typecheck`
- test: `pnpm test`
- web dev: `pnpm dev:web`
- desktop dev: `pnpm dev:desktop`
- commit message check: `pnpm commitlint --edit`

If commands are missing, add them as part of scaffolding rather than inventing one-off local flows.

## Commit convention
- Use Conventional Commits.
- Preferred types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`.
- Keep the commit header within 100 characters when possible.

## Editing constraints
- Prefer ASCII unless the file already benefits from Unicode.
- Keep comments concise and high signal.
- Do not rewrite unrelated files.
- Never use destructive Git commands unless the user explicitly requests them.
- Do not discard user work to make a task easier.

## AI collaboration guidance
- Durable repo guidance belongs here or in a skill, not repeated in every prompt.
- Repeated workflow fixes should become skills.
- Use subagents only for bounded parallel work such as repo exploration, architecture review, or test triage.
- Keep AGENTS practical and update it after repeated friction.
- Use the repo skill `oop-draw-component-system` when adding or reshaping primitives, tokens, or shared UI styling.
- Use the reviewer agent `frontend_component_reviewer` when a task needs a focused read on component boundaries, token consistency, or Reka/Tailwind accessibility patterns.
