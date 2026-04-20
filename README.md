# `@vennbee/result-type` · [![npm](https://img.shields.io/npm/v/@vennbee/result-type)](https://npmjs.com/package/@vennbee/result-type) [![license](https://img.shields.io/npm/l/@vennbee/result-type)](LICENSE)

> Lightweight, zero-dependency `Result<T, E>` type for TypeScript. Make errors explicit, composable, and impossible to ignore — designed for agent tool pipelines.

---

## Why

TypeScript functions either `throw` or return `T | null | undefined`. Both force you to read the implementation (or get surprised at runtime) to know what can go wrong. `Result<T, E>` makes the failure case part of the type signature — the compiler tells you when you haven't handled it.

```ts
// Before — can this throw? what does null mean?
function parseConfig(raw: string): Config | null { ... }

// After — contract is explicit
function parseConfig(raw: string): Result<Config, ParseError> { ... }
```

This pattern is especially valuable in **AI agent tool implementations**, where:
- Errors need to be returned as structured data, not thrown exceptions
- Tool results cross JSON serialization boundaries
- Pipelines chain multiple async tool calls sequentially or in parallel
- Partial failures in fan-out calls should be handled gracefully

---

## Install

```bash
npm install @vennbee/result-type
# or
pnpm add @vennbee/result-type
```

---

## Quick Start

```ts
import { ok, err, isOk, map, flatMap, unwrapOr } from "@vennbee/result-type";

function divide(a: number, b: number) {
  if (b === 0) return err(new Error("Division by zero"));
  return ok(a / b);
}

const result = divide(10, 2);

if (result.ok) {
  console.log(result.value); // 5
} else {
  console.error(result.error);
}
```

---

## API

### Types

```ts
type Ok<T>        = { readonly ok: true;  readonly value: T }
type Err<E>       = { readonly ok: false; readonly error: E }
type Result<T, E> = Ok<T> | Err<E>
```

The shape is a plain discriminated union — no class instances, no methods on the object. This means Results are:
- **JSON-serializable** out of the box (safe across tool call boundaries)
- **Tree-shakeable** — import only what you use
- **Structurally typed** — compatible with any `{ ok: true, value }` / `{ ok: false, error }` shape

---

### Constructors

#### `ok<T>(value: T): Ok<T>`

Wraps a success value.

```ts
const r = ok(42); // Ok<number>
```

#### `err<E>(error: E): Err<E>`

Wraps a failure value. The error can be anything — a string, an `Error` instance, or a structured object.

```ts
const r = err(new Error("oops"));               // Err<Error>
const r = err({ code: 404, message: "Not found" }); // Err<{ code: number, message: string }>
```

---

### Type Guards

#### `isOk(result): result is Ok<T>`
#### `isErr(result): result is Err<E>`

Narrow a `Result` to its variant. Works as a predicate in `.filter()` chains.

```ts
const results = [ok(1), err("bad"), ok(3)];
const successes = results.filter(isOk); // Ok<number>[]
const failures  = results.filter(isErr); // Err<string>[]
```

---

### Sync Transformers

#### `map(result, fn): Result<U, E>`

Transforms the `Ok` value; passes `Err` through unchanged.

```ts
const length = map(ok("hello"), s => s.length); // Ok<number>
const same   = map(err("oops"), s => s.length); // Err<string> — fn never called
```

#### `mapErr(result, fn): Result<T, F>`

Transforms the `Err` value; passes `Ok` through unchanged. Useful for normalizing error types at boundaries.

```ts
const r = mapErr(err(404), code => new Error(`HTTP ${code}`)); // Err<Error>
```

#### `flatMap(result, fn): Result<U, E>`

Chains a `Result`-returning function, flattening the nesting. Short-circuits on the first `Err`.

```ts
const parsed  = flatMap(readFile(path), raw  => parseJson(raw));
const checked = flatMap(parsed,         json => validate(json));
```

---

### Async Transformers

#### `mapAsync(result, fn): Promise<Result<U, E>>`

The async counterpart to `map`. Transforms the `Ok` value with an async function; passes `Err` through.

```ts
const result = await mapAsync(ok(userId), id => fetchUser(id));
```

#### `flatMapAsync(result, fn): Promise<Result<U, E>>`

The async counterpart to `flatMap`, and the **primary building block for agent tool chains**. Chains an async `Result`-returning function, short-circuiting on the first `Err`.

```ts
const result = await flatMapAsync(
  parseConfig(raw),
  async config => tryCatchAsync(() => fetchUser(config.userId))
);
```

---

### Branching

#### `match(result, { ok, err }): U`

Exhaustive pattern match — both branches must be handled and return the same type. Preferred over `if/else` in agent decision loops because it forces you to handle both cases.

```ts
const msg = match(result, {
  ok:  value => `Got ${value}`,
  err: error => `Failed: ${error.message}`,
});
```

---

### Side Effects

#### `tap(result, fn): Result<T, E>`
#### `tapErr(result, fn): Result<T, E>`

Run a side effect (logging, tracing, metrics) without breaking the pipeline. Returns the original `Result` unchanged.

```ts
const result = tap(
  tapErr(riskyOperation(), e => logger.error("failed", e)),
  v => logger.info("succeeded", v)
);
```

---

### Unwrappers

#### `unwrap(result): T`

Returns the `Ok` value or **throws** the error. Use only at trust boundaries where failure is truly unexpected — avoid in agent tools where the caller expects a Result.

```ts
const value = unwrap(ok(42)); // 42
unwrap(err("oops"));          // throws "oops"
```

#### `unwrapOr(result, fallback): T`

Returns the `Ok` value or a static fallback.

```ts
unwrapOr(err("oops"), 0); // 0
```

#### `unwrapOrElse(result, fn): T`

Returns the `Ok` value or computes a fallback from the error.

```ts
unwrapOrElse(err(404), code => `default-${code}`);
```

---

### Lifting

#### `tryCatch(fn, mapError?): Result<T, E>`

Wraps a sync function, catching any thrown value into an `Err`. The optional `mapError` maps the caught value to a typed error.

```ts
const result = tryCatch(() => JSON.parse(raw));
const typed  = tryCatch(() => JSON.parse(raw), e => new ParseError(String(e)));
```

#### `tryCatchAsync(fn, mapError?): Promise<Result<T, E>>`

Wraps an async function, catching any rejection into an `Err`. Use when wrapping a function call you control.

```ts
const result = await tryCatchAsync(() => fetch(url).then(r => r.json()));
```

#### `fromPromise(promise, mapError?): Promise<Result<T, E>>`

Converts an existing `Promise` into a `Result`, never rejecting. Prefer this over `tryCatchAsync` when you already have a `Promise` in hand.

```ts
const result = await fromPromise(fetch(url).then(r => r.json()));
```

---

### Collection Utilities

#### `collect(results): Result<T[], E>`

Fail-fast over an array of `Result`s. Returns the first `Err` encountered, or `Ok` with all values if every result succeeded.

```ts
const all = collect([ok(1), ok(2), ok(3)]); // Ok<[1, 2, 3]>
const bad = collect([ok(1), err("oops")]);  // Err<"oops">
```

#### `collectAsync(promises): Promise<Result<T[], E>>`

The async counterpart to `collect`. Runs all promises in parallel via `Promise.all`, then fails fast on the first `Err`.

```ts
const result = await collectAsync([
  tryCatchAsync(() => fetchUser(id)),
  tryCatchAsync(() => fetchOrders(id)),
]);
```

#### `partition(results): [T[], E[]]`

Splits an array of `Result`s into `[successes, failures]`. Unlike `collect`, never short-circuits — processes every result. Use in fan-out patterns where partial success is acceptable.

```ts
const [values, errors] = partition([ok(1), err("bad"), ok(3)]);
// values → [1, 3]
// errors → ["bad"]
```

---

## Patterns

### Sequential async pipeline

Chain tool calls where each step depends on the previous result. Short-circuits on the first failure.

```ts
const result = await flatMapAsync(
  await flatMapAsync(
    await fromPromise(db.findUser(id)),
    async user => fromPromise(db.findPosts(user.id))
  ),
  async posts => tryCatchAsync(() => rankPosts(posts))
);
```

### Agent tool implementation

Return `Result` from tool functions instead of throwing, so the agent can decide how to handle failures.

```ts
import { tryCatchAsync, flatMapAsync, tap, match } from "@vennbee/result-type";

async function fetchUserOrders(userId: string) {
  return flatMapAsync(
    tap(
      await tryCatchAsync(() => db.findUser(userId)),
      user => console.log("fetched user", user.id)
    ),
    user => tryCatchAsync(() => db.findOrders(user.id))
  );
}

const result = await fetchUserOrders("u_123");

// Convert to a structured agent response
const response = match(result, {
  ok:  orders => ({ success: true,  data: orders }),
  err: error  => ({ success: false, reason: error.message }),
});
```

### Parallel fan-out with partial failure handling

Fire multiple independent requests and collect what succeeded.

```ts
const results = await Promise.all(
  userIds.map(id => tryCatchAsync(() => fetchUser(id)))
);

const [users, errors] = partition(results);

if (errors.length > 0) {
  logger.warn(`${errors.length} users failed to load`);
}

// Continue with the users we did get
await processUsers(users);
```

### Fail-fast validation

Collect validation results and short-circuit if any field fails.

```ts
const validation = collect([
  validateName(form.name),
  validateEmail(form.email),
  validateAge(form.age),
]);

if (!validation.ok) {
  return { error: validation.error.message };
}

const [name, email, age] = validation.value;
```

### Logging without breaking the chain

Observe results mid-pipeline without altering them.

```ts
const result = pipe(
  tap(fetchResult, v => logger.info("fetched", v)),
  r => tapErr(r, e => logger.error("failed", e)),
  r => flatMap(r, transform)
);
```

---

## License

MIT
