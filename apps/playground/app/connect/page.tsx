"use client";

import { useState, useEffect, useRef } from "react";
import formbricks from "@formbricks/js";

export default function ConfigFormPage(): React.JSX.Element {
  const [apiHost, setApiHost] = useState("http://localhost:3000");
  const [environmentId, setEnvironmentId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<Array<{type: string; content: string; timestamp: Date}>>([]);
  const consoleOutputRef = useRef<HTMLDivElement>(null);



  const fetchEnvironmentDetails = async () => {
  if (!apiHost || !environmentId) {
    console.error("API Host and Environment ID are required");
    return;
  }

  try {
    // Use Formbricks Management API to fetch environment details
    const response = await fetch(
      `${apiHost}/api/v1/management/environments/${environmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          // You'll likely need an API key for authenticated requests
          "Authorization": `Bearer YOUR_API_KEY_HERE`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Environment details:", data);
    // Here you would have license information if available in the API response
    return data;
  } catch (error) {
    console.error("Failed to fetch environment details:", error);
  }
};

// Function to fetch actions configured for this environment
const fetchActions = async () => {
  if (!apiHost || !environmentId) {
    console.error("API Host and Environment ID are required");
    return;
  }

  try {
    // Use Formbricks Management API to fetch actions
    const response = await fetch(
      `${apiHost}/api/v1/management/environments/${environmentId}/actions`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer YOUR_API_KEY_HERE`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Configured actions:", data);
    return data;
  } catch (error) {
    console.error("Failed to fetch actions:", error);
  }
};

  // Override console methods to capture logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    // Function to add log to our state
    const addLog = (type: string, args: any[]) => {
      const content = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { type, content, timestamp: new Date() }]);
    };

    // Override console methods
    console.log = (...args) => {
      addLog('log', args);
      originalConsoleLog.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args);
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warn', args);
      originalConsoleWarn.apply(console, args);
    };

    console.info = (...args) => {
      addLog('info', args);
      originalConsoleInfo.apply(console, args);
    };

    // Restore original console when unmounting
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
    };
  }, []);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (consoleOutputRef.current) {
      consoleOutputRef.current.scrollTop = consoleOutputRef.current.scrollHeight;
    }
  }, [logs]);

  // Initialize Formbricks with form values
  const initFormbricks = (host: string, envId: string) => {
    try {
      // Add debug parameter to URL
      const addFormbricksDebugParam = (): void => {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has("formbricksDebug")) {
          urlParams.set("formbricksDebug", "true");
          const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
          window.history.replaceState({}, "", newUrl);
        }
      };
      addFormbricksDebugParam();

      // Set up Formbricks with the provided values
      if (host && envId) {
        void formbricks.setup({
          environmentId: envId,
          appUrl: host,
        });
        setIsConnected(true);
        setError("");
        return true;
      } else {
        setError("Both API Host and Environment ID are required");
        setIsConnected(false);
        return false;
      }
    } catch (err) {
      setError(`Error initializing Formbricks: ${err instanceof Error ? err.message : String(err)}`);
      setIsConnected(false);
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initFormbricks(apiHost, environmentId)) {
      console.log("Formbricks initialized with:", {
        apiHost,
        environmentId,
      });
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testAction = () => {
    void formbricks.track("example_action");
  };

  return (
    <div className="min-h-screen bg-white px-12 py-6 dark:bg-slate-800">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Formbricks Configuration
        </h1>
        
        <div className="rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label 
                htmlFor="apiHost" 
                className="block mb-2 text-sm font-medium text-slate-900 dark:text-white"
              >
                Formbricks API Host
              </label>
              <input
                type="url"
                id="apiHost"
                value={apiHost}
                onChange={(e) => setApiHost(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="https://app.formbricks.com/"
                required
              />
            </div>
            
            <div className="mb-6">
              <label 
                htmlFor="environmentId" 
                className="block mb-2 text-sm font-medium text-slate-900 dark:text-white"
              >
                Environment ID
              </label>
              <input
                type="text"
                id="environmentId"
                value={environmentId}
                onChange={(e) => setEnvironmentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Enter your environment ID"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Initialize Formbricks
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {isConnected && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
                <span>Successfully connected to Formbricks</span>
                <span className="relative ml-2 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
              </div>
            )}
          </form>
        </div>

        {isConnected && (
          <div className="rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Test Formbricks
            </h2>
            <button
              onClick={testAction}
              className="rounded-lg bg-slate-800 px-6 py-2 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 mb-2"
            >
              Send Test Action
            </button>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Triggers a test event for Formbricks
            </p>
          </div>
        )}

        {isConnected && (
            <div className="rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900 mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Environment Information
                </h2>
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button
                    onClick={fetchEnvironmentDetails}
                    className="rounded-lg bg-slate-800 px-6 py-2 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                    Get Environment Details
                </button>
                <button
                    onClick={fetchActions}
                    className="rounded-lg bg-slate-800 px-6 py-2 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                    Get Configured Actions
                </button>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Results will appear in the console output below
                </p>
            </div>
            )}
        
        <div className="rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Console Output
            </h2>
            <button
              onClick={clearLogs}
              className="rounded-lg bg-slate-300 px-4 py-1 text-sm text-slate-700 hover:bg-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Clear
            </button>
          </div>
          
          <div 
            ref={consoleOutputRef}
            className="bg-slate-900 text-slate-100 p-4 rounded-md h-64 overflow-auto font-mono text-sm"
          >
            {logs.length === 0 ? (
              <div className="text-slate-500">No console output yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'warn' ? 'text-yellow-400' : 
                  log.type === 'info' ? 'text-blue-400' : 'text-slate-200'
                }`}>
                  <span className="text-slate-500 mr-2">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-slate-400 mr-2">
                    [{log.type}]
                  </span>
                  <span className="whitespace-pre-wrap">{log.content}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}