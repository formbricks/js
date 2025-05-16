"use client";

import { useState, useEffect } from "react";
import formbricks from "@formbricks/js";

export default function ConfigFormPage(): React.JSX.Element {
  const [apiHost, setApiHost] = useState("http://localhost:3000");
  const [environmentId, setEnvironmentId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-white px-12 py-6 dark:bg-slate-800">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Formbricks Configuration
        </h1>
        
        <div className="rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900">
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
            
            <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              <p>
                After initialization, you can test actions by calling:
              </p>
              <pre className="mt-2 p-2 bg-slate-200 dark:bg-slate-800 rounded overflow-x-auto">
                {`formbricks.track("example_action");`}
              </pre>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}