// Stub: satellite.js WASM runtimes are not needed for SGP4 propagation in browser.
// All required functions (twoline2satrec, propagate, gstime, transforms) are pure JS.
export const createSingleThreadRuntimeFromModule = undefined
export const createMultiThreadRuntimeFromModule = undefined
export async function createSingleThreadRuntime() { throw new Error('WASM runtime not available in browser') }
export async function createMultiThreadRuntime() { throw new Error('WASM runtime not available in browser') }
