// ─── Core Types ──────────────────────────────────────────────────────────────

export type Ok<T> = {
  readonly ok: true;
  readonly value: T;
};

export type Err<E> = {
  readonly ok: false;
  readonly error: E;
};

export type Result<T, E = Error> = Ok<T> | Err<E>;

// ─── Constructors ─────────────────────────────────────────────────────────────

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ─── Type Guards ──────────────────────────────────────────────────────────────

/**
 * Narrows a Result to Ok<T>.
 *
 * @example
 * if (isOk(result)) console.log(result.value);
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/**
 * Narrows a Result to Err<E>.
 *
 * @example
 * if (isErr(result)) console.error(result.error);
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

// ─── Transformers ─────────────────────────────────────────────────────────────

/**
 * Transforms the Ok value, passing Err through unchanged.
 *
 * @example
 * const length = map(ok("hello"), s => s.length); // Ok<number>
 * const same   = map(err("oops"), s => s.length); // Err<string>
 */
export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/**
 * Transforms the Err value, passing Ok through unchanged.
 *
 * @example
 * const r = mapErr(err(404), code => new Error(`HTTP ${code}`));
 */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  return result.ok ? result : err(fn(result.error));
}

/**
 * Chains a Result-returning function, flattening the nesting.
 * Short-circuits on the first Err.
 *
 * @example
 * const result = flatMap(parseJson(raw), json => validate(json));
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

// ─── Unwrappers ───────────────────────────────────────────────────────────────

/**
 * Returns the Ok value, throwing the error if it is an Err.
 * Use only at trust boundaries where failure is truly unexpected.
 *
 * @example
 * const value = unwrap(ok(42));      // 42
 * const boom  = unwrap(err("oops")); // throws "oops"
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw result.error;
}

/**
 * Returns the Ok value or a fallback if it is an Err.
 *
 * @example
 * const value = unwrapOr(err("oops"), 0); // 0
 */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}

/**
 * Returns the Ok value or computes a fallback from the error.
 *
 * @example
 * const value = unwrapOrElse(err(404), code => `default-${code}`);
 */
export function unwrapOrElse<T, E>(
  result: Result<T, E>,
  fn: (error: E) => T
): T {
  return result.ok ? result.value : fn(result.error);
}

// ─── Lifting ──────────────────────────────────────────────────────────────────

/**
 * Wraps a sync function, catching any thrown value into an Err.
 *
 * @example
 * const result = tryCatch(() => JSON.parse(raw));
 * const typed  = tryCatch(() => JSON.parse(raw), e => new ParseError(e));
 */
export function tryCatch<T, E = Error>(
  fn: () => T,
  mapError?: (e: unknown) => E
): Result<T, E> {
  try {
    return ok(fn());
  } catch (e) {
    return err(mapError ? mapError(e) : (e as E));
  }
}

/**
 * Wraps an async function, catching any thrown value into an Err.
 *
 * @example
 * const result = await tryCatchAsync(() => fetch(url).then(r => r.json()));
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  mapError?: (e: unknown) => E
): Promise<Result<T, E>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(mapError ? mapError(e) : (e as E));
  }
}

/**
 * Converts an existing Promise into a Result, never rejecting.
 * Prefer this over tryCatchAsync when you already have a Promise.
 *
 * @example
 * const result = await fromPromise(fetch(url).then(r => r.json()));
 */
export async function fromPromise<T, E = Error>(
  promise: Promise<T>,
  mapError?: (e: unknown) => E
): Promise<Result<T, E>> {
  try {
    return ok(await promise);
  } catch (e) {
    return err(mapError ? mapError(e) : (e as E));
  }
}

// ─── Async Transformers ───────────────────────────────────────────────────────

/**
 * Asynchronously transforms the Ok value, passing Err through unchanged.
 * Essential for agent tool pipelines where most operations are async.
 *
 * @example
 * const result = await mapAsync(ok(userId), id => fetchUser(id));
 */
export async function mapAsync<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<U>
): Promise<Result<U, E>> {
  return result.ok ? ok(await fn(result.value)) : result;
}

/**
 * Chains an async Result-returning function, flattening the nesting.
 * Short-circuits on the first Err. The async counterpart to flatMap,
 * and the primary building block for agent tool chains.
 *
 * @example
 * const result = await flatMapAsync(parseJson(raw), json => validate(json));
 */
export async function flatMapAsync<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> {
  return result.ok ? fn(result.value) : result;
}

// ─── Branching ────────────────────────────────────────────────────────────────

/**
 * Pattern-matches both branches of a Result, returning a single value.
 * Preferred over if/else in agent decision loops.
 *
 * @example
 * const msg = match(result, {
 *   ok:  value => `Got ${value}`,
 *   err: error => `Failed: ${error}`,
 * });
 */
export function match<T, E, U>(
  result: Result<T, E>,
  cases: { ok: (value: T) => U; err: (error: E) => U }
): U {
  return result.ok ? cases.ok(result.value) : cases.err(result.error);
}

// ─── Side Effects ─────────────────────────────────────────────────────────────

/**
 * Runs a side effect on the Ok value without changing the Result.
 * Useful for logging or tracing in agent pipelines.
 *
 * @example
 * const result = tap(fetchResult, value => logger.info("fetched", value));
 */
export function tap<T, E>(
  result: Result<T, E>,
  fn: (value: T) => void
): Result<T, E> {
  if (result.ok) fn(result.value);
  return result;
}

/**
 * Runs a side effect on the Err value without changing the Result.
 * Useful for logging errors in agent pipelines without interrupting flow.
 *
 * @example
 * const result = tapErr(fetchResult, error => logger.error("failed", error));
 */
export function tapErr<T, E>(
  result: Result<T, E>,
  fn: (error: E) => void
): Result<T, E> {
  if (!result.ok) fn(result.error);
  return result;
}

// ─── Collection Utilities ─────────────────────────────────────────────────────

/**
 * Collects an array of Results into a single Result of an array.
 * Returns the first Err encountered, or Ok with all values.
 *
 * @example
 * const all = collect([ok(1), ok(2), ok(3)]); // Ok<[1, 2, 3]>
 * const bad = collect([ok(1), err("oops")]);  // Err<"oops">
 */
export function collect<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!result.ok) return result;
    values.push(result.value);
  }
  return ok(values);
}

/**
 * Splits an array of Results into [successes, failures].
 * Unlike collect, never short-circuits — processes all results.
 * Ideal for agent fan-out patterns where partial success is acceptable.
 *
 * @example
 * const [values, errors] = partition([ok(1), err("bad"), ok(3)]);
 * // values => [1, 3], errors => ["bad"]
 */
export function partition<T, E>(
  results: Result<T, E>[]
): [T[], E[]] {
  const values: T[] = [];
  const errors: E[] = [];
  for (const result of results) {
    if (result.ok) values.push(result.value);
    else errors.push(result.error);
  }
  return [values, errors];
}

/**
 * Runs multiple async operations in parallel and collects all Results.
 * Returns the first Err encountered, or Ok with all values.
 * The async counterpart to collect — use when fan-out tools run concurrently.
 *
 * @example
 * const result = await collectAsync([fetchUser(id), fetchOrders(id)]);
 */
export async function collectAsync<T, E>(
  promises: Promise<Result<T, E>>[]
): Promise<Result<T[], E>> {
  return collect(await Promise.all(promises));
}
