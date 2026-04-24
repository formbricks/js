import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock the load-formbricks module first (hoisted)
vi.mock("./lib/load-formbricks", () => ({
  setup: vi.fn().mockResolvedValue(undefined),
  callMethod: vi.fn().mockResolvedValue(undefined),
}));

import formbricks from "./index";
import * as loadFormbricksModule from "./lib/load-formbricks";

const mockSetup = vi.mocked(loadFormbricksModule.setup);
const mockCallMethod = vi.mocked(loadFormbricksModule.callMethod);

describe("formbricks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetup.mockResolvedValue(undefined);
    mockCallMethod.mockResolvedValue(undefined);
  });

  test("should export a formbricks object", () => {
    expect(formbricks).toBeDefined();
    expect(typeof formbricks).toBe("object");
  });

  test("should delegate setup to setup() (workspaceId)", async () => {
    const setupArgs = {
      workspaceId: "ws123",
      appUrl: "https://app.formbricks.com",
    };

    await formbricks.setup(setupArgs);

    expect(mockSetup).toHaveBeenCalledWith(setupArgs);
  });

  test("should delegate setup to setup() (environmentId backward compat)", async () => {
    const setupArgs = {
      environmentId: "env123",
      appUrl: "https://app.formbricks.com",
    };

    await formbricks.setup(setupArgs);

    expect(mockSetup).toHaveBeenCalledWith(setupArgs);
  });

  test("should delegate track to callMethod", async () => {
    const trackCode = "button-click";
    const properties = {
      hiddenFields: { age: 25 },
    };

    await formbricks.track(trackCode, properties);

    expect(mockCallMethod).toHaveBeenCalledWith("track", trackCode, properties);
  });

  test("should delegate setEmail to callMethod", async () => {
    const email = "test@example.com";

    await formbricks.setEmail(email);

    expect(mockCallMethod).toHaveBeenCalledWith("setEmail", email);
  });

  test("should delegate setAttribute to callMethod", async () => {
    const key = "userId";
    const value = "user123";

    await formbricks.setAttribute(key, value);

    expect(mockCallMethod).toHaveBeenCalledWith("setAttribute", key, value);
  });

  test("should delegate setAttributes to callMethod", async () => {
    const attributes = {
      userId: "user123",
      plan: "premium",
    };

    await formbricks.setAttributes(attributes);

    expect(mockCallMethod).toHaveBeenCalledWith("setAttributes", attributes);
  });

  test("should delegate setLanguage to callMethod", async () => {
    const language = "en";

    await formbricks.setLanguage(language);

    expect(mockCallMethod).toHaveBeenCalledWith("setLanguage", language);
  });

  test("should delegate setUserId to callMethod", async () => {
    const userId = "user123";

    await formbricks.setUserId(userId);

    expect(mockCallMethod).toHaveBeenCalledWith("setUserId", userId);
  });

  test("should delegate logout to callMethod", async () => {
    await formbricks.logout();

    expect(mockCallMethod).toHaveBeenCalledWith("logout");
  });

  test("should delegate registerRouteChange to callMethod", async () => {
    await formbricks.registerRouteChange();

    expect(mockCallMethod).toHaveBeenCalledWith("registerRouteChange");
  });

  test("should delegate setNonce to callMethod", async () => {
    const nonce = "abc123";

    await formbricks.setNonce(nonce);

    expect(mockCallMethod).toHaveBeenCalledWith("setNonce", nonce);
  });

  test("should handle multiple concurrent method calls", async () => {
    const calls = [
      formbricks.setEmail("test@example.com"),
      formbricks.setAttribute("userId", "user123"),
      formbricks.track("event1"),
      formbricks.setLanguage("en"),
    ];

    await Promise.all(calls);

    expect(mockCallMethod).toHaveBeenCalledTimes(4);
    expect(mockCallMethod).toHaveBeenCalledWith("setEmail", "test@example.com");
    expect(mockCallMethod).toHaveBeenCalledWith(
      "setAttribute",
      "userId",
      "user123",
    );
    expect(mockCallMethod).toHaveBeenCalledWith("track", "event1", undefined);
    expect(mockCallMethod).toHaveBeenCalledWith("setLanguage", "en");
  });

  test("should propagate errors from setup", async () => {
    const error = new Error("Test error");
    mockSetup.mockRejectedValue(error);

    await expect(
      formbricks.setup({
        environmentId: "env123",
        appUrl: "https://app.formbricks.com",
      }),
    ).rejects.toThrow("Test error");
  });

  test("should propagate errors from callMethod", async () => {
    const error = new Error("Test error");
    mockCallMethod.mockRejectedValue(error);

    await expect(formbricks.setEmail("test@example.com")).rejects.toThrow(
      "Test error",
    );
  });
});

describe("method signatures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetup.mockResolvedValue(undefined);
    mockCallMethod.mockResolvedValue(undefined);
  });

  test("should have all expected methods", () => {
    expect(typeof formbricks.setup).toBe("function");
    expect(typeof formbricks.track).toBe("function");
    expect(typeof formbricks.setEmail).toBe("function");
    expect(typeof formbricks.setAttribute).toBe("function");
    expect(typeof formbricks.setAttributes).toBe("function");
    expect(typeof formbricks.setLanguage).toBe("function");
    expect(typeof formbricks.setUserId).toBe("function");
    expect(typeof formbricks.setNonce).toBe("function");
    expect(typeof formbricks.logout).toBe("function");
    expect(typeof formbricks.registerRouteChange).toBe("function");
  });

  test("should handle method calls with no arguments", async () => {
    await formbricks.logout();

    expect(mockCallMethod).toHaveBeenCalledWith("logout");
  });

  test("should handle method calls with single argument", async () => {
    await formbricks.setUserId("user123");

    expect(mockCallMethod).toHaveBeenCalledWith("setUserId", "user123");
  });

  test("should handle method calls with multiple arguments", async () => {
    await formbricks.setAttribute("key", "value");

    expect(mockCallMethod).toHaveBeenCalledWith("setAttribute", "key", "value");
  });

  test("should handle method calls with object arguments", async () => {
    const setupConfig = {
      environmentId: "env123",
      appUrl: "https://app.formbricks.com",
    };

    await formbricks.setup(setupConfig);

    expect(mockSetup).toHaveBeenCalledWith(setupConfig);
  });
});

describe("type safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetup.mockResolvedValue(undefined);
    mockCallMethod.mockResolvedValue(undefined);
  });

  test("should maintain type safety for known methods", () => {
    const testTypeSafety = () => {
      void formbricks.setup({ workspaceId: "ws", appUrl: "url" });
      void formbricks.setup({ environmentId: "env", appUrl: "url" });
      void formbricks.track("event");
      void formbricks.setEmail("email");
      void formbricks.setAttribute("key", "value");
      void formbricks.setAttributes({ key: "value" });
      void formbricks.setLanguage("en");
      void formbricks.setUserId("user");
      void formbricks.logout();
      void formbricks.registerRouteChange();
    };

    expect(testTypeSafety).not.toThrow();
  });
});
