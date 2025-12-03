import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock the load-formbricks module first (hoisted)
vi.mock("./lib/load-formbricks", () => ({
  loadFormbricksToProxy: vi.fn().mockResolvedValue(undefined),
}));

import formbricks from "./index";
import * as loadFormbricksModule from "./lib/load-formbricks";
import { TFormbricks } from "./types/formbricks";

// Get the mocked function
const mockLoadFormbricksToProxy = vi.mocked(
  loadFormbricksModule.loadFormbricksToProxy
);

describe("formbricks proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadFormbricksToProxy.mockResolvedValue(undefined);
  });

  test("should export a formbricks object", () => {
    expect(formbricks).toBeDefined();
    expect(typeof formbricks).toBe("object");
  });

  test("should proxy setup method calls to loadFormbricksToProxy", async () => {
    const setupArgs = {
      environmentId: "env123",
      appUrl: "https://app.formbricks.com",
    };

    await formbricks.setup(setupArgs);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("setup", setupArgs);
  });

  test("should proxy track method calls to loadFormbricksToProxy", async () => {
    const trackCode = "button-click";

    await formbricks.track(trackCode);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("track", trackCode);
  });

  test("should proxy setEmail method calls to loadFormbricksToProxy", async () => {
    const email = "test@example.com";

    await formbricks.setEmail(email);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("setEmail", email);
  });

  test("should proxy setAttribute method calls to loadFormbricksToProxy", async () => {
    const key = "userId";
    const value = "user123";

    await formbricks.setAttribute(key, value);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setAttribute",
      key,
      value
    );
  });

  test("should proxy setAttributes method calls to loadFormbricksToProxy", async () => {
    const attributes = {
      userId: "user123",
      plan: "premium",
    };

    await formbricks.setAttributes(attributes);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setAttributes",
      attributes
    );
  });

  test("should proxy setLanguage method calls to loadFormbricksToProxy", async () => {
    const language = "en";

    await formbricks.setLanguage(language);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setLanguage",
      language
    );
  });

  test("should proxy setUserId method calls to loadFormbricksToProxy", async () => {
    const userId = "user123";

    await formbricks.setUserId(userId);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("setUserId", userId);
  });

  test("should proxy logout method calls to loadFormbricksToProxy", async () => {
    await formbricks.logout();

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("logout");
  });

  test("should proxy registerRouteChange method calls to loadFormbricksToProxy", async () => {
    await formbricks.registerRouteChange();

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "registerRouteChange"
    );
  });

  test("should handle deprecated init method", async () => {
    const initConfig = {
      apiHost: "https://app.formbricks.com",
      environmentId: "env123",
      userId: "user123",
      attributes: {
        plan: "premium",
      },
    };

    await formbricks.init(initConfig);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("init", initConfig);
  });

  test("should handle track method with properties", async () => {
    const trackCode = "purchase";
    const properties = {
      hiddenFields: {
        productId: "prod123",
        amount: 99.99,
        categories: ["electronics", "gadgets"],
      },
    };

    await formbricks.track(trackCode, properties);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "track",
      trackCode,
      properties
    );
  });

  test("should handle any method call through the proxy", async () => {
    const customMethod: keyof TFormbricks = "track";
    const args = ["arg1"];

    await formbricks[customMethod](args[0]);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      customMethod,
      args[0]
    );
  });

  test("should return the result of loadFormbricksToProxy calls", async () => {
    const mockResult = "test-result";
    mockLoadFormbricksToProxy.mockResolvedValue(mockResult as unknown as void);

    const result = await formbricks.setEmail("test@example.com");

    expect(result).toBe(mockResult);
  });

  test("should propagate errors from loadFormbricksToProxy", async () => {
    const error = new Error("Test error");
    mockLoadFormbricksToProxy.mockRejectedValue(error);

    await expect(formbricks.setEmail("test@example.com")).rejects.toThrow(
      "Test error"
    );
  });

  test("should handle multiple concurrent method calls", async () => {
    const calls = [
      formbricks.setEmail("test@example.com"),
      formbricks.setAttribute("userId", "user123"),
      formbricks.track("event1"),
      formbricks.setLanguage("en"),
    ];

    await Promise.all(calls);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledTimes(4);
    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setEmail",
      "test@example.com"
    );
    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setAttribute",
      "userId",
      "user123"
    );
    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("track", "event1");
    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("setLanguage", "en");
  });
});

describe("proxy behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadFormbricksToProxy.mockResolvedValue(undefined);
  });

  test("should work with property access", () => {
    // Test that we can access properties on the proxy
    expect(typeof formbricks.setup).toBe("function");
    expect(typeof formbricks.track).toBe("function");
    expect(typeof formbricks.setEmail).toBe("function");
  });

  test("should handle method calls with no arguments", async () => {
    await formbricks.logout();

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("logout");
  });

  test("should handle method calls with single argument", async () => {
    await formbricks.setUserId("user123");

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setUserId",
      "user123"
    );
  });

  test("should handle method calls with multiple arguments", async () => {
    await formbricks.setAttribute("key", "value");

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setAttribute",
      "key",
      "value"
    );
  });

  test("should handle method calls with object arguments", async () => {
    const setupConfig = {
      environmentId: "env123",
      appUrl: "https://app.formbricks.com",
    };

    await formbricks.setup(setupConfig);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setup",
      setupConfig
    );
  });
});

describe("type safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadFormbricksToProxy.mockResolvedValue(undefined);
  });

  test("should maintain type safety for known methods", () => {
    // These should compile without errors due to proper typing
    const testTypeSafety = () => {
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
