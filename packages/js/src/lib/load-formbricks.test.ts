import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { TFormbricks } from "../types/formbricks";

// We need to import the module after each reset
let loadFormbricksToProxy: (
  prop: keyof TFormbricks,
  ...args: unknown[]
) => Promise<void>;

// Mock the globalThis formbricks object
const mockFormbricks = {
  setup: vi.fn(),
  track: vi.fn(),
  setEmail: vi.fn(),
  setAttribute: vi.fn(),
  setAttributes: vi.fn(),
  setLanguage: vi.fn(),
  setUserId: vi.fn(),
  logout: vi.fn(),
  registerRouteChange: vi.fn(),
};

const typedGlobalThis = globalThis as unknown as Record<string, unknown>;

// Helper functions to reduce nesting
const simulateScriptSuccess = (script: HTMLScriptElement) => {
  typedGlobalThis.formbricks = mockFormbricks;
  if (script.onload) {
    script.onload({} as Event);
  }
};

const simulateScriptError = (script: HTMLScriptElement) => {
  if (script.onerror) {
    script.onerror({} as Event);
  }
};

const simulateSetupFailure = (script: HTMLScriptElement) => {
  (globalThis as unknown as Record<string, unknown>).formbricks = {
    setup: vi.fn().mockRejectedValue(new Error("Setup failed")),
  };
  if (script.onload) {
    script.onload({} as Event);
  }
};

const createSuccessfulScriptMock = () => {
  return (element: Node) => {
    const script = element as HTMLScriptElement;
    setTimeout(() => simulateScriptSuccess(script), 0);
    return element;
  };
};

const createErrorScriptMock = () => {
  return (element: Node) => {
    const script = element as HTMLScriptElement;
    setTimeout(() => simulateScriptError(script), 0);
    return element;
  };
};

const createTimeoutScriptMock = () => {
  return (element: Node) => {
    // Don't trigger onload to simulate timeout
    return element;
  };
};

const createSetupFailureMock = () => {
  return (element: Node) => {
    const script = element as HTMLScriptElement;
    setTimeout(() => simulateSetupFailure(script), 0);
    return element;
  };
};

const mockSetTimeoutImmediate = () => {
  const originalSetTimeout = globalThis.setTimeout;
  vi.spyOn(globalThis, "setTimeout").mockImplementation(
    // @ts-expect-error -- We want to mock the setTimeout function
    (callback: () => void) => {
      if (typeof callback === "function") {
        callback();
      }

      return 1;
    },
  );
  return originalSetTimeout;
};

const createConsoleErrorSpy = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return vi.spyOn(console, "error").mockImplementation(() => {});
};

const createConsoleWarnSpy = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return vi.spyOn(console, "warn").mockImplementation(() => {});
};

describe("load-formbricks", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    delete typedGlobalThis.formbricks;

    // Clean up any existing script tags
    const scripts = document.querySelectorAll('script[src*="formbricks"]');
    for (const script of scripts) {
      script.remove();
    }

    // Reset module-level variables by re-importing
    vi.resetModules();

    // Re-import the module to get fresh state
    const module = await import("./load-formbricks");
    loadFormbricksToProxy = module.loadFormbricksToProxy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadFormbricksToProxy", () => {
    describe("setup functionality", () => {
      test("should handle setup call with valid arguments", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        const mockAppendChild = vi
          .spyOn(document.head, "appendChild")
          .mockImplementation(createSuccessfulScriptMock());

        await loadFormbricksToProxy("setup", setupArgs);

        expect(mockAppendChild).toHaveBeenCalledWith(
          expect.objectContaining({
            src: `${setupArgs.appUrl}/js/formbricks.umd.cjs`,
            type: "text/javascript",
            async: true,
          }),
        );
        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
      });

      test("should log error when appUrl is missing", async () => {
        const consoleSpy = createConsoleErrorSpy();

        await loadFormbricksToProxy("setup", {
          environmentId: "env123",
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: appUrl is required",
        );
      });

      test("should log error when environmentId is missing", async () => {
        const consoleSpy = createConsoleErrorSpy();

        await loadFormbricksToProxy("setup", {
          appUrl: "https://app.formbricks.com",
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: environmentId is required",
        );
      });

      test("should not load script again if formbricks is already available", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        // Set formbricks as already available
        typedGlobalThis.formbricks = mockFormbricks;

        const appendChildSpy = vi.spyOn(document.head, "appendChild");

        await loadFormbricksToProxy("setup", setupArgs);

        expect(appendChildSpy).not.toHaveBeenCalled();
        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
      });
    });

    describe("error handling", () => {
      test("should handle script loading timeout", async () => {
        const consoleSpy = createConsoleErrorSpy();
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createTimeoutScriptMock(),
        );

        const originalSetTimeout = mockSetTimeoutImmediate();

        await loadFormbricksToProxy("setup", setupArgs);

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: Failed to load Formbricks SDK",
        );

        // Restore setTimeout
        globalThis.setTimeout = originalSetTimeout;
      });

      test("should handle script loading error", async () => {
        const consoleSpy = createConsoleErrorSpy();
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createErrorScriptMock(),
        );

        await loadFormbricksToProxy("setup", setupArgs);

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: Failed to load Formbricks SDK",
        );
      });

      test("should handle setup failure gracefully", async () => {
        const consoleSpy = createConsoleErrorSpy();
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSetupFailureMock(),
        );

        await loadFormbricksToProxy("setup", setupArgs);

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: setup failed",
          expect.any(Error),
        );
      });
    });

    describe("method queueing", () => {
      test("should queue non-setup methods when not initialized", async () => {
        const consoleSpy = createConsoleWarnSpy();

        await loadFormbricksToProxy("track", "test-event");

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Warning: Formbricks not initialized. This method will be queued and executed after initialization.",
        );
      });

      test("should flush queued methods after setup", async () => {
        const warnSpy = createConsoleWarnSpy();
        await loadFormbricksToProxy("track", "queued-event");
        expect(warnSpy).toHaveBeenCalled();
        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock(),
        );
        await loadFormbricksToProxy("setup", {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });
        expect(mockFormbricks.track).toHaveBeenCalledWith("queued-event");
      });
    });

    describe("after initialization", () => {
      test("should execute methods directly after successful setup", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock(),
        );

        // First, set up the SDK
        await loadFormbricksToProxy("setup", setupArgs);

        // Now test that subsequent calls execute directly
        await loadFormbricksToProxy("track", "test-event");

        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
        expect(mockFormbricks.track).toHaveBeenCalledWith("test-event");
      });
    });
  });
});
