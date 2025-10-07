import { type TFormbricks as TFormbricksCore } from "./types/formbricks";
import { loadFormbricksToProxy } from "./lib/load-formbricks";

type TFormbricks = Omit<TFormbricksCore, "track"> & {
  track: (code: string) => Promise<void>;
};

declare global {
  interface Window {
    formbricks: TFormbricks | undefined;
  }
}

const formbricksProxyHandler: ProxyHandler<TFormbricks> = {
  get(_target, prop, _receiver) {
    return (...args: unknown[]) =>
      loadFormbricksToProxy(prop as keyof TFormbricks, ...args);
  },
};

const formbricks: TFormbricksCore = new Proxy(
  {} as TFormbricks,
  formbricksProxyHandler,
);

export default formbricks;
