import { type TFormbricks as TFormbricksCore } from "./types/formbricks";
import { setup, callMethod } from "./lib/load-formbricks";

type TFormbricks = Omit<TFormbricksCore, "track"> & {
  track: (code: string) => Promise<void>;
};

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
  track: (code) => callMethod("track", code),
  logout: () => callMethod("logout"),
  registerRouteChange: () => callMethod("registerRouteChange"),
};

export default formbricks;
