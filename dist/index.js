"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  collect: () => collect,
  err: () => err,
  flatMap: () => flatMap,
  fromPromise: () => fromPromise,
  isErr: () => isErr,
  isOk: () => isOk,
  map: () => map,
  mapErr: () => mapErr,
  ok: () => ok,
  tryCatch: () => tryCatch,
  tryCatchAsync: () => tryCatchAsync,
  unwrap: () => unwrap,
  unwrapOr: () => unwrapOr,
  unwrapOrElse: () => unwrapOrElse
});
module.exports = __toCommonJS(index_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.js.map