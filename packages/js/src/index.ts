import { callMethod, off, on, setup } from "./lib/load-formbricks";
import type { TFormbricks } from "./types/formbricks";

declare global {
  interface Window {
    formbricks: TFormbricks | undefined;
  }
}

const formbricks: TFormbricks = {
  setup: (setupConfig) => setup(setupConfig),
  setEmail: (email) => callMethod("setEmail", email),
  setAttribute: (key, value) => callMethod("setAttribute", key, value),
  setAttributes: (attributes) => callMethod("setAttributes", attributes),
  setLanguage: (language) => callMethod("setLanguage", language),
  setUserId: (userId) => callMethod("setUserId", userId),
  setNonce: (nonce) => callMethod("setNonce", nonce),
  track: (code, properties) => callMethod("track", code, properties),
  logout: () => callMethod("logout"),
  registerRouteChange: () => callMethod("registerRouteChange"),
  setEmbeddedData: (data) => callMethod("setEmbeddedData", data),
  // Rest args on purpose: js-core clears the whole bag only on a literal zero-argument call, so the
  // arity has to reach it untouched. `(key) => callMethod(..., key)` would always send one argument.
  clearEmbeddedData: (...args) => callMethod("clearEmbeddedData", ...args),
  on: (event, handler) => on(event, handler),
  off: (event, handler) => off(event, handler),
};

export type {
  TEmbeddedDataInput,
  TFormbricksEventName,
  TFormbricksEventPayloads,
} from "./types/formbricks";
export default formbricks;
