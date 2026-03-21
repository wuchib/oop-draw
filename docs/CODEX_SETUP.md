# Codex project setup for OOP Draw

This repository now includes project-scoped Codex guidance based on the OpenAI Codex best-practices guidance.

## Files added
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `.codex/rules/project.rules`
- `AGENTS.md`
- `.agents/skills/oop-draw-architecture-guard/SKILL.md`
- `.agents/skills/oop-draw-scaffold/SKILL.md`

## Why these files exist
- `AGENTS.md` holds durable repo guidance.
- `.codex/config.toml` sets repo-level Codex defaults.
- `.codex/rules/` constrains risky commands outside the sandbox.
- `.codex/agents/` defines focused subagents for bounded parallel work.
- `.agents/skills/` turns repeated repo workflows into reusable skills.

## Important behavior
- Project-scoped `.codex/config.toml` is only applied when the repository is treated as trusted by Codex.
- Rules are scanned from the project config layer and are most reliable after restarting or reloading Codex.
- `AGENTS.md` is the durable repo instruction file and should stay short, accurate, and maintained.

## Current project defaults
- TypeScript-only policy for code and config where supported.
- Shared renderer strategy for Web and Electron.
- Architecture boundaries aligned with `docs/ARCHITECTURE.md`.
- Conservative approval and sandbox defaults.

## Optional next step
If you want your personal Codex config to complement this repo config, add only personal preferences to `~/.codex/config.toml` and keep project behavior in `.codex/config.toml`.
