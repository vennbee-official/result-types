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
function collect(results) {
  const values = [];
  for (const result of results) {
    if (!result.ok) return result;
    values.push(result.value);
  }
  return ok(values);
}
export {
  collect,
  err,
  flatMap,
  fromPromise,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  tryCatch,
  tryCatchAsync,
  unwrap,
  unwrapOr,
  unwrapOrElse
};
//# sourceMappingURL=index.mjs.map