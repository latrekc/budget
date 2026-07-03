// Polyfill fetch API globals before any modules are evaluated
try {
  const undici = require("undici");
  if (typeof global.Response === "undefined") {
    global.Response = undici.Response;
  }
  if (typeof global.Request === "undefined") {
    global.Request = undici.Request;
  }
  if (typeof global.Headers === "undefined") {
    global.Headers = undici.Headers;
  }
  if (typeof global.fetch === "undefined") {
    global.fetch = undici.fetch;
  }
  if (typeof globalThis.Response === "undefined") {
    globalThis.Response = undici.Response;
  }
  if (typeof globalThis.Request === "undefined") {
    globalThis.Request = undici.Request;
  }
  if (typeof globalThis.Headers === "undefined") {
    globalThis.Headers = undici.Headers;
  }
  if (typeof globalThis.fetch === "undefined") {
    globalThis.fetch = undici.fetch;
  }
} catch {
  // ignore
}
