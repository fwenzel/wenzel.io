# Repository Guidelines

## Project Structure & Module Organization

- The repository is currently empty aside from `.git`. When code is added, document top-level directories here (for example: `src/` for application code, `tests/` for test suites, `assets/` for static files).
- Prefer a clear separation of concerns: app code vs. tests vs. build/config.

## Build, Test, and Development Commands

- No build or runtime commands are defined yet.
- When you add tooling, list the exact commands here (for example: `npm run dev`, `npm test`, `make build`) and describe what each does.

## Coding Style & Naming Conventions

- No language or formatter is configured yet.
- When adding code, choose a formatter/linter and document:
  - indentation (e.g., 2 spaces or tabs)
  - file naming patterns (e.g., `kebab-case.ts`, `snake_case.py`)
  - any lint/format commands (e.g., `npm run lint`, `ruff`, `gofmt`).

## Testing Guidelines

- No test framework is configured.
- Once tests exist, describe:
  - the framework (e.g., Jest, Pytest)
  - naming conventions (e.g., `*.test.ts`, `test_*.py`)
  - how to run targeted vs. full suites.

## Commit & Pull Request Guidelines

- This repository has no commits yet, so no commit message conventions can be inferred.
- When you establish a convention, record it here (e.g., Conventional Commits).
- For pull requests, include:
  - a short description of changes
  - linked issues (if applicable)
  - screenshots for UI changes.

## Security & Configuration Tips

- If you add configuration files or secrets, document where they belong and how to load them (for example: `.env` files stored locally and excluded via `.gitignore`).

## Agent-Specific Instructions

- Keep this document updated as the project structure and tooling evolve.
