import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// We need to import the module after each reset
let setup: (config: {
  appUrl: string;
  workspaceId?: string;
  environmentId?: string;
}) => Promise<void>;
let callMethod: (method: string, ...args: unknown[]) => Promise<void>;

// Mock the globalThis formbricks object
const mockFormbricks = {
  setup: vi.fn(),
  init: vi.fn(),
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
    (script.onerror as (event: Event) => void)({} as Event);
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
    setup = module.setup;
    callMethod = module.callMethod;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("setup", () => {
    describe("setup functionality", () => {
      test("should handle setup call with valid arguments", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        const mockAppendChild = vi
          .spyOn(document.head, "appendChild")
          .mockImplementation(createSuccessfulScriptMock());

        await setup(setupArgs);

        expect(mockAppendChild).toHaveBeenCalledWith(
          expect.objectContaining({
            src: `${setupArgs.appUrl}/js/formbricks.umd.cjs`,
            type: "text/javascript",
            async: true,
          }),
        );
        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
      });

      test("should handle setup call with a trailing slash in the appUrl", async () => {
        const validAppUrl = "https://app.formbricks.com";
        const invalidAppUrl = "https://app.formbricks.com/";
        const environmentId = "env123";

        const invalidSetupArgs = {
          appUrl: invalidAppUrl,
          environmentId,
        };

        const validateSetupArgs = {
          appUrl: validAppUrl,
          environmentId,
        };

        const mockAppendChild = vi
          .spyOn(document.head, "appendChild")
          .mockImplementation(createSuccessfulScriptMock());

        await setup(invalidSetupArgs);

        expect(mockAppendChild).toHaveBeenCalledWith(
          expect.objectContaining({
            src: `${validAppUrl}/js/formbricks.umd.cjs`,
            type: "text/javascript",
            async: true,
          }),
        );
        expect(mockFormbricks.setup).toHaveBeenCalledWith(validateSetupArgs);
      });

      test("should log error when appUrl is missing", async () => {
        const consoleSpy = createConsoleErrorSpy();

        await setup({
          appUrl: "",
          environmentId: "env123",
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: appUrl is required",
        );
      });

      test("should log error when both workspaceId and environmentId are missing", async () => {
        const consoleSpy = createConsoleErrorSpy();

        await setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "",
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: workspaceId or environmentId is required",
        );
      });

      test("should handle setup call with workspaceId", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          workspaceId: "ws123",
        };

        const mockAppendChild = vi
          .spyOn(document.head, "appendChild")
          .mockImplementation(createSuccessfulScriptMock());

        await setup(setupArgs);

        expect(mockAppendChild).toHaveBeenCalledWith(
          expect.objectContaining({
            src: `${setupArgs.appUrl}/js/formbricks.umd.cjs`,
            type: "text/javascript",
            async: true,
          }),
        );
        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
      });

      test("should warn about deprecation when only environmentId is provided", async () => {
        const consoleWarnSpy = createConsoleWarnSpy();

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock(),
        );

        await setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Warning: environmentId is deprecated and will be removed in a future version. Please use workspaceId instead.",
        );
      });

      test("should not warn about deprecation when workspaceId is provided", async () => {
        const consoleWarnSpy = createConsoleWarnSpy();

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock(),
        );

        await setup({
          appUrl: "https://app.formbricks.com",
          workspaceId: "ws123",
          environmentId: "env123",
        });

        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining("environmentId is deprecated"),
        );
      });

      test("should pass both workspaceId and environmentId through when both provided", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          workspaceId: "ws123",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock(),
        );

        await setup(setupArgs);

        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
      });

      test("should not load script again if formbricks is already available", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        // Set formbricks as already available
        typedGlobalThis.formbricks = mockFormbricks;

        const appendChildSpy = vi.spyOn(document.head, "appendChild");

        await setup(setupArgs);

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

        await setup(setupArgs);

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

        await setup(setupArgs);

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

        await setup(setupArgs);

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: setup failed",
          expect.any(Error),
        );
      });
    });

    describe("UMD detection fallback (polling)", () => {
      // These tests simulate the scenario where another script on the page
      // leaks `exports` or `module` into the global scope, causing the UMD
      // wrapper to route the factory result to `module.exports` instead of
      // `globalThis.formbricks`. The polling fallback should recover when
      // js-core's explicit `globalThis.formbricks = ...` assignment runs
      // shortly after.

      afterEach(() => {
        vi.useRealTimers();
      });

      test("should recover via polling when globalThis.formbricks is set after onload", async () => {
        vi.useFakeTimers();

        vi.spyOn(document.head, "appendChild").mockImplementation(
          (element: Node) => {
            const script = element as HTMLScriptElement;
            // onload fires but global is NOT set (UMD detection was fooled)
            setTimeout(() => {
              if (script.onload) {
                script.onload({} as Event);
              }
            }, 0);
            // js-core's explicit globalThis assignment runs shortly after
            setTimeout(() => {
              typedGlobalThis.formbricks = mockFormbricks;
            }, 25);
            return element;
          },
        );

        const setupPromise = setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });

        // Advance past onload (0ms) + delayed assignment (25ms) + poll cycle (30ms)
        await vi.advanceTimersByTimeAsync(100);

        await setupPromise;

        expect(mockFormbricks.setup).toHaveBeenCalledWith({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });
      });

      test("should fail when globalThis.formbricks is never set after onload", async () => {
        vi.useFakeTimers();
        const consoleSpy = createConsoleErrorSpy();

        vi.spyOn(document.head, "appendChild").mockImplementation(
          (element: Node) => {
            const script = element as HTMLScriptElement;
            // onload fires but global is never set
            setTimeout(() => {
              if (script.onload) {
                script.onload({} as Event);
              }
            }, 0);
            return element;
          },
        );

        const setupPromise = setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });

        // Advance past onload (0ms) + all 50 poll attempts (50 * 10ms = 500ms)
        await vi.advanceTimersByTimeAsync(600);

        await setupPromise;

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: Failed to load Formbricks SDK",
        );
        expect(mockFormbricks.setup).not.toHaveBeenCalled();
      });
    });

    describe("concurrent setup calls", () => {
      test("should warn if setup is called while already initializing", async () => {
        const warnSpy = createConsoleWarnSpy();

        vi.spyOn(document.head, "appendChild").mockImplementation(
          (element: Node) => {
            // Don't resolve — keep initializing
            return element;
          },
        );

        // Start setup (will hang because onload never fires)
        const firstSetup = setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });

        // Call setup again while first is still running
        await setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });

        expect(warnSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Warning: Formbricks is already initializing.",
        );

        // Clean up by letting the first setup timeout
        const originalSetTimeout = mockSetTimeoutImmediate();
        // Wait for the pending promise with a short timeout
        await Promise.race([
          firstSetup,
          new Promise((resolve) => originalSetTimeout(resolve, 100)),
        ]);
        globalThis.setTimeout = originalSetTimeout;
      });
    });
  });

  describe("callMethod", () => {
    describe("method queueing", () => {
      test("should queue non-setup methods when not initialized", async () => {
        const consoleSpy = createConsoleWarnSpy();

        await callMethod("track", "test-event");

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Warning: Formbricks not initialized. This method will be queued and executed after initialization.",
        );
      });

      test("should flush queued methods after setup", async () => {
        const warnSpy = createConsoleWarnSpy();
        await callMethod("track", "queued-event");
        expect(warnSpy).toHaveBeenCalled();
        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock(),
        );
        await setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });
        expect(mockFormbricks.track).toHaveBeenCalledWith("queued-event");
      });

      test("should flush multiple queued methods in order after setup", async () => {
        createConsoleWarnSpy();
        const callOrder: string[] = [];
        mockFormbricks.setEmail.mockImplementation(() => {
          callOrder.push("setEmail");
        });
        mockFormbricks.track.mockImplementation(() => {
          callOrder.push("track");
        });

        await callMethod("setEmail", "test@example.com");
        await callMethod("track", "queued-event");

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock(),
        );
        await setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });

        expect(mockFormbricks.setEmail).toHaveBeenCalledWith(
          "test@example.com",
        );
        expect(mockFormbricks.track).toHaveBeenCalledWith("queued-event");
        expect(callOrder).toEqual(["setEmail", "track"]);
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
        await setup(setupArgs);

        // Now test that subsequent calls execute directly
        await callMethod("track", "test-event");

        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
        expect(mockFormbricks.track).toHaveBeenCalledWith("test-event");
      });

      test("should pass multiple arguments to methods", async () => {
        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock(),
        );

        await setup({
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        });

        await callMethod("setAttribute", "key", "value");

        expect(mockFormbricks.setAttribute).toHaveBeenCalledWith(
          "key",
          "value",
        );
      });
    });
  });
});
