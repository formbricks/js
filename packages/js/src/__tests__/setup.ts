import { vi, beforeEach } from "vitest";

// Mock DOM APIs that are not available in the test environment (only in DOM environments)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "location", {
    value: {
      href: "http://localhost:3000",
      origin: "http://localhost:3000",
    },
    writable: true,
  });
}

// Store original console methods for tests that need to spy on them
const originalConsole = { ...console };

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();

  // Reset global formbricks
  delete (globalThis as any).formbricks;

  // Clean up any script tags that might have been added during tests
  const scripts = document.querySelectorAll('script[src*="formbricks"]');
  scripts.forEach((script) => script.remove());

  // Restore original console methods
  Object.assign(console, originalConsole);
});
