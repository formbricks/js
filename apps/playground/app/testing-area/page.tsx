"use client";

import { useState } from "react";
import formbricks from "@formbricks/js";

export default function InputFormPage(): React.JSX.Element {
  const [appUrl, setAppUrl] = useState("");
  const [environmentId, setEnvId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can use Formbricks to track this form submission
    void formbricks.track("form_submitted", {
      hiddenFields: {
        appUrl,
        environmentId
      }
    });
    console.log("Form submitted:", { appUrl, environmentId });
    // Reset form
    setAppUrl("");
    setEnvId("");
  };

  return (
    <div className="min-h-screen bg-white px-12 py-6 dark:bg-slate-800">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Setup
        </h1>
        
        <div className="rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label 
                htmlFor="name" 
                className="block mb-2 text-sm font-medium text-slate-900 dark:text-white"
              >
                Name
              </label>
              <input
                type="text"
                id="appUrl"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="app.formbricks.com"
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
                id="environmentId"
                value={environmentId}
                onChange={(e) => setEnvId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Your environment ID"
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Connect
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}