import { callMethod, setup } from "./lib/load-formbricks";
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
};

export default formbricks;
