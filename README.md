# `result` · [![npm](https://img.shields.io/npm/v/result)](https://npmjs.com/package/result) [![license](https://img.shields.io/npm/l/result)](LICENSE)

> Lightweight, zero-dependency `Result<T, E>` type for TypeScript. Make errors explicit, composable, and impossible to ignore.

---

## Why

TypeScript functions either `throw` or return `T | null | undefined`. Both force you to read the implementation (or get surprised at runtime) to know what can go wrong. `Result<T, E>` makes the failure case part of the type signature — the compiler tells you when you haven't handled it.

```ts
// Before — can this throw? what does null mean?
function parseConfig(raw: string): Config | null { ... }

// After — contract is explicit
function parseConfig(raw: string): Result<Config, ParseError> { ... }
```

---

## Install

```bash
npm install @your-scope/result
# or
pnpm add @your-scope/result
```

---

## Quick Start

```ts
import { ok, err, map, flatMap, unwrapOr } from "@your-scope/result";

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

### Constructors

#### `ok<T>(value: T): Ok<T>`

Wraps a success value.

```ts
const r = ok(42); // Ok<number>
```

#### `err<E>(error: E): Err<E>`

Wraps a failure value.

```ts
const r = err(new Error("oops")); // Err<Error>
```

---

### Type Guards

#### `isOk(result): result is Ok<T>`
#### `isErr(result): result is Err<E>`

Narrow a `Result` to its variant. Useful in `.filter()` chains.

```ts
const results = [ok(1), err("bad"), ok(3)];
const successes = results.filter(isOk); // Ok<number>[]
```

---

### Transformers

#### `map(result, fn): Result<U, E>`

Transforms the `Ok` value; passes `Err` through unchanged.

```ts
const length = map(ok("hello"), s => s.length); // Ok<5>
```

#### `mapErr(result, fn): Result<T, F>`

Transforms the `Err` value; passes `Ok` through unchanged.

```ts
const r = mapErr(err(404), code => new Error(`HTTP ${code}`));
```

#### `flatMap(result, fn): Result<U, E>`

Chains a `Result`-returning function, flattening the nesting. Short-circuits on the first `Err`.

```ts
const parsed  = flatMap(readFile(path), raw => parseJson(raw));
const checked = flatMap(parsed, json => validate(json));
```

#### `andThen` — alias for `flatMap`

```ts
const result = andThen(parseJson(raw), validate);
```

---

### Unwrappers

#### `unwrap(result): T`

Returns the `Ok` value or **throws** the error. Use only at trust boundaries where failure is truly unexpected.

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

#### `match(result, arms): U`

Exhaustive pattern match — both branches must return the same type.

```ts
const msg = match(result, {
  ok:  v => `Got ${v}`,
  err: e => `Failed: ${e.message}`,
});
```

---

### Lifting

#### `tryCatch(fn, mapError?): Result<T, E>`

Wraps a sync function, catching any thrown value into an `Err`.

```ts
const result = tryCatch(() => JSON.parse(raw));
const typed  = tryCatch(() => JSON.parse(raw), e => new ParseError(e));
```

#### `tryCatchAsync(fn, mapError?): Promise<Result<T, E>>`

Wraps an async function, catching any thrown value into an `Err`.

```ts
const result = await tryCatchAsync(() => fetch(url).then(r => r.json()));
```

#### `fromPromise(promise, mapError?): Promise<Result<T, E>>`

Converts an existing `Promise` into a `Result`, never rejecting. Prefer this over `tryCatchAsync` when you already have a `Promise`.

```ts
const result = await fromPromise(fetch(url).then(r => r.json()));
```

---

### Async Variants

#### `mapAsync(result, fn): Promise<Result<U, E>>`
#### `flatMapAsync(result, fn): Promise<Result<U, E>>`

Async versions of `map` and `flatMap` for `Promise`-returning transform functions.

```ts
const result = await flatMapAsync(
  parseConfig(raw),
  async config => fetchUser(config.userId)
);
```

---

### Side Effects

#### `tap(result, fn): Result<T, E>`
#### `tapErr(result, fn): Result<T, E>`

Run a side effect (e.g. logging) without breaking the pipeline. Returns the original `Result` unchanged.

```ts
const result = tap(fetchUser(id), user => logger.info("Fetched", user));
```

---

### Collection Utilities

#### `collect(results): Result<T[], E>`

Fail-fast over an array of `Result`s. Returns the first `Err`, or `Ok` with all values.

```ts
const all = collect([ok(1), ok(2), ok(3)]); // Ok<[1, 2, 3]>
const bad = collect([ok(1), err("oops")]);  // Err<"oops">
```

#### `partition(results): [T[], E[]]`

Splits an array of `Result`s into `[successes, failures]`. Non-failing — processes everything.

```ts
const [values, errors] = partition([ok(1), err("bad"), ok(3)]);
// values → [1, 3]
// errors → ["bad"]
```

---

## Patterns

### Chaining operations

```ts
const result = flatMap(
  flatMap(
    tryCatch(() => JSON.parse(raw)),
    json => validate(json)
  ),
  validated => transform(validated)
);
```

### Async pipeline

```ts
const result = await flatMapAsync(
  await fromPromise(db.findUser(id)),
  async user => fromPromise(db.findPosts(user.id))
);
```

### Collecting form field results

```ts
const fields = [validateName(form.name), validateEmail(form.email), validateAge(form.age)];
const result = collect(fields); // Ok<[name, email, age]> | Err<ValidationError>
```

### Logging without breaking the chain

```ts
const result = tap(
  tapErr(riskyOperation(), e => logger.error("operation failed", e)),
  v => logger.info("operation succeeded", v)
);
```

---

## Types

```ts
type Ok<T>          = { readonly ok: true;  readonly value: T }
type Err<E>         = { readonly ok: false; readonly error: E }
type Result<T, E>   = Ok<T> | Err<E>
```

---

## License

MIT
# result-types
