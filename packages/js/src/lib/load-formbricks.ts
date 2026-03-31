import type { TFormbricks } from "../types/formbricks";

type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

let coreInstance: TFormbricks | null = null;
let isInitializing = false;
const queue: { method: string; args: unknown[] }[] = [];

const loadFormbricksSDK = async (appUrl: string): Promise<Result<void>> => {
  if ((globalThis as unknown as Record<string, unknown>).formbricks) {
    return { ok: true, data: undefined };
  }

  const scriptSrc = `${appUrl}/js/formbricks.umd.cjs`;

  // Remove any previously appended script to prevent duplicates on retry
  const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = scriptSrc;
  script.async = true;

  const loadPromise = new Promise<Result<void>>((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        ok: false,
        error: new Error("Formbricks SDK loading timed out"),
      });
    }, 10000);

    script.onload = () => {
      clearTimeout(timeoutId);

      // UMD should set globalThis.formbricks synchronously on execution.
      // Poll briefly as a fallback in case UMD environment detection was
      // fooled (e.g. a leaked `exports` global) and the assignment was
      // routed to module.exports instead of globalThis.
      if ((globalThis as unknown as Record<string, unknown>).formbricks) {
        resolve({ ok: true, data: undefined });
        return;
      }

      let attempts = 0;
      const poll = setInterval(() => {
        if ((globalThis as unknown as Record<string, unknown>).formbricks) {
          clearInterval(poll);
          resolve({ ok: true, data: undefined });
        } else if (++attempts >= 50) {
          clearInterval(poll);
          resolve({
            ok: false,
            error: new Error(
              "Formbricks SDK loaded but not available on globalThis"
            ),
          });
        }
      }, 10);
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      resolve({
        ok: false,
        error: new Error("Failed to load Formbricks SDK"),
      });
    };
  });

  // Register handlers above BEFORE appending to DOM so that a cached
  // script whose onload fires on the next microtask is always caught.
  document.head.appendChild(script);
  return loadPromise;
};

const validateSetupArgs = (
  config: unknown
): { appUrl: string; environmentId: string } | null => {
  const { appUrl, environmentId } = config as {
    appUrl: string;
    environmentId: string;
  };

  if (!appUrl) {
    console.error("🧱 Formbricks - Error: appUrl is required");
    return null;
  }

  if (!environmentId) {
    console.error("🧱 Formbricks - Error: environmentId is required");
    return null;
  }

  // Removing trailing slash
  const appUrlWithoutTrailingSlash = appUrl.endsWith("/")
    ? appUrl.slice(0, -1)
    : appUrl;

  return { appUrl: appUrlWithoutTrailingSlash, environmentId };
};

const processQueue = (): void => {
  while (queue.length > 0) {
    const entry = queue.shift();
    // Should never happen as we check for length above
    if (!entry) break;
    if (!coreInstance) break;

    if (
      typeof coreInstance[entry.method as keyof typeof coreInstance] !==
      "function"
    ) {
      console.error(
        `🧱 Formbricks - Error: Method ${entry.method} does not exist on formbricks`
      );
      continue;
    }

    // @ts-expect-error -- Required for dynamic function calls
    (coreInstance[entry.method as keyof typeof coreInstance] as unknown)(
      ...entry.args
    );
  }
};

export const setup = async (config: {
  appUrl: string;
  environmentId: string;
}): Promise<void> => {
  if (isInitializing) {
    console.warn(
      "🧱 Formbricks - Warning: Formbricks is already initializing.",
    );
    return;
  }

  const validatedArgs = validateSetupArgs(config);
  if (!validatedArgs) return;

  isInitializing = true;
  try {
    const loadResult = await loadFormbricksSDK(validatedArgs.appUrl);
    const instance = (globalThis as unknown as Record<string, unknown>)
      .formbricks as TFormbricks | undefined;

    if (!loadResult.ok || !instance) {
      console.error("🧱 Formbricks - Error: Failed to load Formbricks SDK");
      return;
    }

    await instance.setup({ ...validatedArgs });
    coreInstance = instance;
    processQueue();
  } catch (err) {
    coreInstance = null;
    console.error("🧱 Formbricks - Error: setup failed", err);
  } finally {
    isInitializing = false;
  }
};

export const callMethod = async (
  method: string,
  ...args: unknown[]
): Promise<void> => {
  if (coreInstance) {
    // @ts-expect-error -- Required for dynamic function calls
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await coreInstance[method](...args);
  } else {
    console.warn(
      "🧱 Formbricks - Warning: Formbricks not initialized. This method will be queued and executed after initialization.",
    );
    queue.push({ method, args });
  }
};
