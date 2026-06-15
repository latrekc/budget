import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}
// Polyfill fetch API for Node environment in jsdom
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
if (
  typeof global.Response === "undefined" &&
  typeof globalThis.Response !== "undefined"
) {
  global.Response = globalThis.Response;
}
if (
  typeof global.Request === "undefined" &&
  typeof globalThis.Request !== "undefined"
) {
  global.Request = globalThis.Request;
}
if (
  typeof global.Headers === "undefined" &&
  typeof globalThis.Headers !== "undefined"
) {
  global.Headers = globalThis.Headers;
}
if (
  typeof global.fetch === "undefined" &&
  typeof globalThis.fetch !== "undefined"
) {
  global.fetch = globalThis.fetch;
}
