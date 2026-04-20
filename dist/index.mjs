// src/index.ts
function ok(value) {
  return { ok: true, value };
}
function err(error) {
  return { ok: false, error };
}
function isOk(result) {
  return result.ok;
}
function isErr(result) {
  return !result.ok;
}
function map(result, fn) {
  return result.ok ? ok(fn(result.value)) : result;
}
function mapErr(result, fn) {
  return result.ok ? result : err(fn(result.error));
}
function flatMap(result, fn) {
  return result.ok ? fn(result.value) : result;
}
function unwrap(result) {
  if (result.ok) return result.value;
  throw result.error;
}
function unwrapOr(result, fallback) {
  return result.ok ? result.value : fallback;
}
function unwrapOrElse(result, fn) {
  return result.ok ? result.value : fn(result.error);
}
function tryCatch(fn, mapError) {
  try {
    return ok(fn());
  } catch (e) {
    return err(mapError ? mapError(e) : e);
  }
}
async function tryCatchAsync(fn, mapError) {
  try {
    return ok(await fn());
  } catch (e) {
    return err(mapError ? mapError(e) : e);
  }
}
async function fromPromise(promise, mapError) {
  try {
    return ok(await promise);
  } catch (e) {
    return err(mapError ? mapError(e) : e);
  }
}
async function mapAsync(result, fn) {
  return result.ok ? ok(await fn(result.value)) : result;
}
async function flatMapAsync(result, fn) {
  return result.ok ? fn(result.value) : result;
}
function match(result, cases) {
  return result.ok ? cases.ok(result.value) : cases.err(result.error);
}
function tap(result, fn) {
  if (result.ok) fn(result.value);
  return result;
}
function tapErr(result, fn) {
  if (!result.ok) fn(result.error);
  return result;
}
function collect(results) {
  const values = [];
  for (const result of results) {
    if (!result.ok) return result;
    values.push(result.value);
  }
  return ok(values);
}
function partition(results) {
  const values = [];
  const errors = [];
  for (const result of results) {
    if (result.ok) values.push(result.value);
    else errors.push(result.error);
  }
  return [values, errors];
}
async function collectAsync(promises) {
  return collect(await Promise.all(promises));
}
export {
  collect,
  collectAsync,
  err,
  flatMap,
  flatMapAsync,
  fromPromise,
  isErr,
  isOk,
  map,
  mapAsync,
  mapErr,
  match,
  ok,
  partition,
  tap,
  tapErr,
  tryCatch,
  tryCatchAsync,
  unwrap,
  unwrapOr,
  unwrapOrElse
};
//# sourceMappingURL=index.mjs.map