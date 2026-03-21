---
name: "oop-draw-command-verification"
description: "Use when validating OOP Draw command health, workspace checks, or Web/Electron startup. Runs the repo command matrix, verifies dev startup logs, and catches Electron install or port issues before calling a task done."
---

# OOP Draw Command Verification

Use this skill when the task changes repo setup, package wiring, scripts, toolchain config, Electron startup, or shared renderer bootstrapping.

## Always read first
- `AGENTS.md`
- `package.json`
- `docs/ARCHITECTURE.md`

## What this skill validates
- Workspace checks: `pnpm typecheck`, `pnpm lint`, `pnpm test`
- Build checks: `pnpm build:web`, `pnpm build:desktop`
- Dev smoke checks: `pnpm dev:web`, `pnpm dev:desktop`

## Preferred workflow
1. Run the deterministic matrix with `scripts/verify-commands.ps1`.
2. If a command fails, fix the root cause before trying broader work.
3. For `dev:*` commands, treat a long-running server as success only if the logs clearly show startup.
4. For Electron failures, check install/runtime issues before changing app code.

## Command
Run:

```powershell
./.agents/skills/oop-draw-command-verification/scripts/verify-commands.ps1
```

Optional flags:
- `-ChecksOnly` to skip long-running dev smoke tests
- `-SkipBuild` to skip build steps when validating a docs-only change

## Failure heuristics
- `Electron uninstall` usually means the Electron binary was not installed correctly.
- Port conflicts are acceptable for Vite dev smoke tests as long as the server still reports a local URL.
- A build pass does not replace a `dev:*` smoke test for Electron boot issues.

## Deliverable expectations
When reporting results, include:
- Which commands passed
- Which commands failed
- Whether `dev:web` reached a Vite ready state
- Whether `dev:desktop` reached `start electron app...`
- Any environment-specific caveats that remain
