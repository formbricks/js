import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to import the module after each reset
let loadFormbricksToProxy: any;

// Mock the global formbricks object
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

// Helper functions to reduce nesting
const simulateScriptSuccess = (script: HTMLScriptElement) => {
  (globalThis as any).formbricks = mockFormbricks;
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
  (globalThis as any).formbricks = {
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

const immediateTimeoutCallback = (callback: any) => {
  if (typeof callback === "function") {
    callback();
  }
  return 1 as any;
};

const mockSetTimeoutImmediate = () => {
  const originalSetTimeout = global.setTimeout;
  vi.spyOn(global, "setTimeout").mockImplementation(immediateTimeoutCallback);
  return originalSetTimeout;
};

const createConsoleErrorSpy = () => {
  return vi.spyOn(console, "error").mockImplementation(() => {});
};

const createConsoleWarnSpy = () => {
  return vi.spyOn(console, "warn").mockImplementation(() => {});
};

describe("load-formbricks", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    delete (globalThis as any).formbricks;

    // Clean up any existing script tags
    const scripts = document.querySelectorAll('script[src*="formbricks"]');
    scripts.forEach((script) => script.remove());

    // Reset module-level variables by re-importing
    vi.resetModules();

    // Re-import the module to get fresh state
    const module = await import("../lib/load-formbricks");
    loadFormbricksToProxy = module.loadFormbricksToProxy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadFormbricksToProxy", () => {
    describe("setup functionality", () => {
      it("should handle setup call with valid arguments", async () => {
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
          })
        );
        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
      });

      it("should log error when appUrl is missing", async () => {
        const consoleSpy = createConsoleErrorSpy();

        await loadFormbricksToProxy("setup", {
          environmentId: "env123",
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: appUrl is required"
        );
      });

      it("should log error when environmentId is missing", async () => {
        const consoleSpy = createConsoleErrorSpy();

        await loadFormbricksToProxy("setup", {
          appUrl: "https://app.formbricks.com",
        });

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: environmentId is required"
        );
      });

      it("should not load script again if formbricks is already available", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        // Set formbricks as already available
        (globalThis as any).formbricks = mockFormbricks;

        const appendChildSpy = vi.spyOn(document.head, "appendChild");

        await loadFormbricksToProxy("setup", setupArgs);

        expect(appendChildSpy).not.toHaveBeenCalled();
        expect(mockFormbricks.setup).toHaveBeenCalledWith(setupArgs);
      });
    });

    describe("error handling", () => {
      it("should handle script loading timeout", async () => {
        const consoleSpy = createConsoleErrorSpy();
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createTimeoutScriptMock()
        );

        const originalSetTimeout = mockSetTimeoutImmediate();

        await loadFormbricksToProxy("setup", setupArgs);

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: Failed to load Formbricks SDK"
        );

        // Restore setTimeout
        global.setTimeout = originalSetTimeout;
      });

      it("should handle script loading error", async () => {
        const consoleSpy = createConsoleErrorSpy();
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createErrorScriptMock()
        );

        await loadFormbricksToProxy("setup", setupArgs);

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: Failed to load Formbricks SDK"
        );
      });

      it("should handle setup failure gracefully", async () => {
        const consoleSpy = createConsoleErrorSpy();
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSetupFailureMock()
        );

        await loadFormbricksToProxy("setup", setupArgs);

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Error: setup failed",
          expect.any(Error)
        );
      });
    });

    describe("method queueing", () => {
      it("should queue non-setup methods when not initialized", async () => {
        const consoleSpy = createConsoleWarnSpy();

        await loadFormbricksToProxy("track", "test-event");

        expect(consoleSpy).toHaveBeenCalledWith(
          "🧱 Formbricks - Warning: Formbricks not initialized. This method will be queued and executed after initialization."
        );
      });
    });

    describe("after initialization", () => {
      it("should execute methods directly after successful setup", async () => {
        const setupArgs = {
          appUrl: "https://app.formbricks.com",
          environmentId: "env123",
        };

        vi.spyOn(document.head, "appendChild").mockImplementation(
          createSuccessfulScriptMock()
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
