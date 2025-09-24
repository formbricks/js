import { describe, it, expect, vi, beforeEach } from "vitest";
import formbricks from "../index";
import * as loadFormbricksModule from "../lib/load-formbricks";

// Mock the load-formbricks module
vi.mock("../lib/load-formbricks", () => ({
  loadFormbricksToProxy: vi.fn(),
}));

const mockLoadFormbricksToProxy = vi.mocked(
  loadFormbricksModule.loadFormbricksToProxy
);

describe("formbricks proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadFormbricksToProxy.mockResolvedValue(undefined);
  });

  it("should export a formbricks object", () => {
    expect(formbricks).toBeDefined();
    expect(typeof formbricks).toBe("object");
  });

  it("should proxy setup method calls to loadFormbricksToProxy", async () => {
    const setupArgs = {
      environmentId: "env123",
      appUrl: "https://app.formbricks.com",
    };

    await formbricks.setup(setupArgs);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("setup", setupArgs);
  });

  it("should proxy track method calls to loadFormbricksToProxy", async () => {
    const trackCode = "button-click";

    await formbricks.track(trackCode);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("track", trackCode);
  });

  it("should proxy setEmail method calls to loadFormbricksToProxy", async () => {
    const email = "test@example.com";

    await formbricks.setEmail(email);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("setEmail", email);
  });

  it("should proxy setAttribute method calls to loadFormbricksToProxy", async () => {
    const key = "userId";
    const value = "user123";

    await formbricks.setAttribute(key, value);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setAttribute",
      key,
      value
    );
  });

  it("should proxy setAttributes method calls to loadFormbricksToProxy", async () => {
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

  it("should proxy setLanguage method calls to loadFormbricksToProxy", async () => {
    const language = "en";

    await formbricks.setLanguage(language);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setLanguage",
      language
    );
  });

  it("should proxy setUserId method calls to loadFormbricksToProxy", async () => {
    const userId = "user123";

    await formbricks.setUserId(userId);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("setUserId", userId);
  });

  it("should proxy logout method calls to loadFormbricksToProxy", async () => {
    await formbricks.logout();

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("logout");
  });

  it("should proxy registerRouteChange method calls to loadFormbricksToProxy", async () => {
    await formbricks.registerRouteChange();

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "registerRouteChange"
    );
  });

  it("should handle deprecated init method", async () => {
    const initConfig = {
      apiHost: "https://app.formbricks.com",
      environmentId: "env123",
      userId: "user123",
      attributes: {
        plan: "premium",
      },
    };

    await (formbricks as any).init(initConfig);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("init", initConfig);
  });

  it("should handle track method with properties", async () => {
    const trackCode = "purchase";
    const properties = {
      hiddenFields: {
        productId: "prod123",
        amount: 99.99,
        categories: ["electronics", "gadgets"],
      },
    };

    // Cast to any to access the extended track method with properties
    await (formbricks as any).track(trackCode, properties);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "track",
      trackCode,
      properties
    );
  });

  it("should handle any method call through the proxy", async () => {
    const customMethod = "customMethod";
    const args = ["arg1", "arg2", { key: "value" }];

    // Cast to any to call a method that doesn't exist in the type definition
    await (formbricks as any)[customMethod](...args);

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      customMethod,
      ...args
    );
  });

  it("should return the result of loadFormbricksToProxy calls", async () => {
    const mockResult = "test-result";
    mockLoadFormbricksToProxy.mockResolvedValue(mockResult as any);

    const result = await formbricks.setEmail("test@example.com");

    expect(result).toBe(mockResult);
  });

  it("should propagate errors from loadFormbricksToProxy", async () => {
    const error = new Error("Test error");
    mockLoadFormbricksToProxy.mockRejectedValue(error);

    await expect(formbricks.setEmail("test@example.com")).rejects.toThrow(
      "Test error"
    );
  });

  it("should handle multiple concurrent method calls", async () => {
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

  it("should work with property access", () => {
    // Test that we can access properties on the proxy
    expect(typeof formbricks.setup).toBe("function");
    expect(typeof formbricks.track).toBe("function");
    expect(typeof formbricks.setEmail).toBe("function");
  });

  it("should handle method calls with no arguments", async () => {
    await formbricks.logout();

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith("logout");
  });

  it("should handle method calls with single argument", async () => {
    await formbricks.setUserId("user123");

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setUserId",
      "user123"
    );
  });

  it("should handle method calls with multiple arguments", async () => {
    await formbricks.setAttribute("key", "value");

    expect(mockLoadFormbricksToProxy).toHaveBeenCalledWith(
      "setAttribute",
      "key",
      "value"
    );
  });

  it("should handle method calls with object arguments", async () => {
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

  it("should maintain type safety for known methods", () => {
    // These should compile without errors due to proper typing
    const testTypeSafety = () => {
      formbricks.setup({ environmentId: "env", appUrl: "url" });
      formbricks.track("event");
      formbricks.setEmail("email");
      formbricks.setAttribute("key", "value");
      formbricks.setAttributes({ key: "value" });
      formbricks.setLanguage("en");
      formbricks.setUserId("user");
      formbricks.logout();
      formbricks.registerRouteChange();
    };

    expect(testTypeSafety).not.toThrow();
  });
});
