# @vennbee/result-type

Lightweight TypeScript Result type for explicit error handling. Published as an npm package targeting agent/tool developers.

## Commands

```bash
pnpm build          # compile to dist/ (CJS + ESM + types via tsup)
pnpm dev            # watch mode
pnpm prepublishOnly # runs build automatically before npm publish
```

## Architecture

Single-file library — all source lives in `src/index.ts`. No internal modules, no sub-paths.

```
src/index.ts   ← everything: types, constructors, guards, transformers, utilities
dist/          ← build output (gitignored), CJS (.js) + ESM (.mjs) + types (.d.ts)
```

Build is handled by `tsup` with dual CJS/ESM output. The `exports` field in `package.json` is the authoritative entry point map.

## Key Constraints

- **Zero dependencies** — keep it that way. No runtime deps allowed.
- **JSON-serializable shape** — `{ ok: true, value }` / `{ ok: false, error }` must survive `JSON.stringify/parse`. Do not add methods to the Result object (no class instances, no Proxies).
- **Pure functions only** — all exports are standalone functions, not methods on a class. This keeps tree-shaking effective.
- **`sideEffects: false`** is set in package.json — do not add module-level side effects.

## API Surface (src/index.ts)

| Group | Exports |
|---|---|
| Types | `Ok`, `Err`, `Result` |
| Constructors | `ok`, `err` |
| Guards | `isOk`, `isErr` |
| Sync transforms | `map`, `mapErr`, `flatMap` |
| Async transforms | `mapAsync`, `flatMapAsync` |
| Branching | `match` |
| Side effects | `tap`, `tapErr` |
| Unwrappers | `unwrap`, `unwrapOr`, `unwrapOrElse` |
| Lifting | `tryCatch`, `tryCatchAsync`, `fromPromise` |
| Collections | `collect`, `collectAsync`, `partition` |

## Agent-Specific Design Notes

This package is designed as a building block for AI agent tool implementations:

- **`flatMapAsync`** is the primary tool-chaining primitive — most agent pipelines are async
- **`match`** is preferred over `if/else` in agent decision branches (forces both cases)
- **`tap`/`tapErr`** are for observability without breaking async chains
- **`partition`** handles fan-out patterns where partial success is acceptable
- **`collectAsync`** gathers parallel tool call results

## Publishing

```bash
npm publish --access public
```

Package name: `@vennbee/result-type`. The `files` field in package.json restricts publish to `dist/` only.
