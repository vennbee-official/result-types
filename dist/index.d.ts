type Ok<T> = {
    readonly ok: true;
    readonly value: T;
};
type Err<E> = {
    readonly ok: false;
    readonly error: E;
};
type Result<T, E = Error> = Ok<T> | Err<E>;
declare function ok<T>(value: T): Ok<T>;
declare function err<E>(error: E): Err<E>;
/**
 * Narrows a Result to Ok<T>.
 *
 * @example
 * if (isOk(result)) console.log(result.value);
 */
declare function isOk<T, E>(result: Result<T, E>): result is Ok<T>;
/**
 * Narrows a Result to Err<E>.
 *
 * @example
 * if (isErr(result)) console.error(result.error);
 */
declare function isErr<T, E>(result: Result<T, E>): result is Err<E>;
/**
 * Transforms the Ok value, passing Err through unchanged.
 *
 * @example
 * const length = map(ok("hello"), s => s.length); // Ok<number>
 * const same   = map(err("oops"), s => s.length); // Err<string>
 */
declare function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>;
/**
 * Transforms the Err value, passing Ok through unchanged.
 *
 * @example
 * const r = mapErr(err(404), code => new Error(`HTTP ${code}`));
 */
declare function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>;
/**
 * Chains a Result-returning function, flattening the nesting.
 * Short-circuits on the first Err.
 *
 * @example
 * const result = flatMap(parseJson(raw), json => validate(json));
 */
declare function flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>;
/**
 * Returns the Ok value, throwing the error if it is an Err.
 * Use only at trust boundaries where failure is truly unexpected.
 *
 * @example
 * const value = unwrap(ok(42));      // 42
 * const boom  = unwrap(err("oops")); // throws "oops"
 */
declare function unwrap<T, E>(result: Result<T, E>): T;
/**
 * Returns the Ok value or a fallback if it is an Err.
 *
 * @example
 * const value = unwrapOr(err("oops"), 0); // 0
 */
declare function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T;
/**
 * Returns the Ok value or computes a fallback from the error.
 *
 * @example
 * const value = unwrapOrElse(err(404), code => `default-${code}`);
 */
declare function unwrapOrElse<T, E>(result: Result<T, E>, fn: (error: E) => T): T;
/**
 * Wraps a sync function, catching any thrown value into an Err.
 *
 * @example
 * const result = tryCatch(() => JSON.parse(raw));
 * const typed  = tryCatch(() => JSON.parse(raw), e => new ParseError(e));
 */
declare function tryCatch<T, E = Error>(fn: () => T, mapError?: (e: unknown) => E): Result<T, E>;
/**
 * Wraps an async function, catching any thrown value into an Err.
 *
 * @example
 * const result = await tryCatchAsync(() => fetch(url).then(r => r.json()));
 */
declare function tryCatchAsync<T, E = Error>(fn: () => Promise<T>, mapError?: (e: unknown) => E): Promise<Result<T, E>>;
/**
 * Converts an existing Promise into a Result, never rejecting.
 * Prefer this over tryCatchAsync when you already have a Promise.
 *
 * @example
 * const result = await fromPromise(fetch(url).then(r => r.json()));
 */
declare function fromPromise<T, E = Error>(promise: Promise<T>, mapError?: (e: unknown) => E): Promise<Result<T, E>>;
/**
 * Collects an array of Results into a single Result of an array.
 * Returns the first Err encountered, or Ok with all values.
 *
 * @example
 * const all = collect([ok(1), ok(2), ok(3)]); // Ok<[1, 2, 3]>
 * const bad = collect([ok(1), err("oops")]);  // Err<"oops">
 */
declare function collect<T, E>(results: Result<T, E>[]): Result<T[], E>;

export { type Err, type Ok, type Result, collect, err, flatMap, fromPromise, isErr, isOk, map, mapErr, ok, tryCatch, tryCatchAsync, unwrap, unwrapOr, unwrapOrElse };
