import type { TFormbricks } from "../types/formbricks";

declare global {
  const formbricks: TFormbricks &
    Record<string, (...args: unknown[]) => unknown>;
}

type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

let isInitializing = false;
let isInitialized = false;
// Load the SDK, return the result
const loadFormbricksSDK = async (
  apiHostParam: string
): Promise<Result<void>> => {
  if (!(globalThis as unknown as Record<string, unknown>).formbricks) {
    const scriptTag = document.createElement("script");
    scriptTag.type = "text/javascript";
    scriptTag.src = `${apiHostParam}/js/formbricks.umd.cjs`;
    scriptTag.async = true;
    const getFormbricks = async (): Promise<void> =>
      new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Formbricks SDK loading timed out`));
        }, 10000);
        scriptTag.onload = () => {
          clearTimeout(timeoutId);
          resolve();
        };
        scriptTag.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error(`Failed to load Formbricks SDK`));
        };
      });
    document.head.appendChild(scriptTag);
    try {
      await getFormbricks();
      return { ok: true, data: undefined };
    } catch (error) {
      const err = error as { message?: string };
      return {
        ok: false,
        error: new Error(err.message ?? `Failed to load Formbricks SDK`),
      };
    }
  }
  return { ok: true, data: undefined };
};

const functionsToProcess: { prop: string; args: unknown[] }[] = [];

const validateSetupArgs = (
  args: unknown[]
): { appUrl: string; environmentId: string } | null => {
  const argsTyped = args[0] as { appUrl: string; environmentId: string };
  const { appUrl, environmentId } = argsTyped;

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

const processQueuedFunctions = (formbricksInstance: TFormbricks): void => {
  for (const { prop: functionProp, args: functionArgs } of functionsToProcess) {
    if (
      typeof formbricksInstance[
        functionProp as keyof typeof formbricksInstance
      ] !== "function"
    ) {
      console.error(
        `🧱 Formbricks - Error: Method ${functionProp} does not exist on formbricks`
      );
      continue;
    }
    // @ts-expect-error -- Required for dynamic function calls
    (formbricksInstance[functionProp] as unknown)(...functionArgs);
  }
};

const handleSetupCall = async (args: unknown[]): Promise<void> => {
  if (isInitializing) {
    console.warn(
      "🧱 Formbricks - Warning: Formbricks is already initializing."
    );
    return;
  }
  const validatedArgs = validateSetupArgs(args);
  if (!validatedArgs) return;
  isInitializing = true;
  try {
    const loadSDKResult = await loadFormbricksSDK(validatedArgs.appUrl);
    const formbricksInstance = (
      globalThis as unknown as Record<string, unknown>
    ).formbricks as TFormbricks;
    if (!loadSDKResult.ok || !formbricksInstance) {
      console.error("🧱 Formbricks - Error: Failed to load Formbricks SDK");
      return;
    }
    await formbricksInstance.setup({ ...validatedArgs });
    isInitialized = true;
    processQueuedFunctions(formbricks);
  } catch (err) {
    console.error("🧱 Formbricks - Error: setup failed", err);
  } finally {
    isInitializing = false;
  }
};

const executeFormbricksMethod = async (
  prop: string,
  args: unknown[]
): Promise<void> => {
  const formbricksInstance = (globalThis as unknown as Record<string, unknown>)
    .formbricks;

  if (!formbricksInstance) return;

  // @ts-expect-error -- Required for dynamic function calls
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await formbricksInstance[prop](...args);
};

export const loadFormbricksToProxy = async (
  prop: string,
  ...args: unknown[]
): Promise<void> => {
  if (isInitialized) {
    await executeFormbricksMethod(prop, args);
  } else if (prop === "setup") {
    await handleSetupCall(args);
  } else {
    console.warn(
      "🧱 Formbricks - Warning: Formbricks not initialized. This method will be queued and executed after initialization."
    );
    functionsToProcess.push({ prop, args });
  }
};
