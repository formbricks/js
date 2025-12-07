"use client";

import formbricks from "@formbricks/js";
import { useEffect, useState } from "react";

export default function DemoPage(): React.JSX.Element {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const userId = "Demo-demo-user";

  useEffect(() => {
    const initFormbricks = () => {
      const addFormbricksDebugParam = (): void => {
        const url = new URL(globalThis.location.href);
        if (!url.searchParams.has("formbricksDebug")) {
          url.searchParams.set("formbricksDebug", "true");
          globalThis.history.replaceState({}, "", url.href);
        }
      };
      addFormbricksDebugParam();
      if (
        process.env.NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID &&
        process.env.NEXT_PUBLIC_FORMBRICKS_API_HOST
      ) {
        formbricks.setup({
          environmentId: process.env.NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID,
          appUrl: process.env.NEXT_PUBLIC_FORMBRICKS_API_HOST,
        });
        setIsInitialized(true);
      }
    };
    initFormbricks();
  }, []);

  const handleIdentifyUser = () => {
    if (!isInitialized || !userId) return;
    formbricks.setUserId(userId);
    formbricks.setAttribute("userType", "Demo-customer");
    formbricks.setAttribute("plan", "enterprise");
  };

  const handleOpenDashboard = () => {
    setIsDashboardOpen(true);
  };

  const handleCloseDashboard = () => {
    setIsDashboardOpen(false);
    if (!isInitialized) return;
    formbricks.track("dashboard-viewed");
  };

  const handleUpgradeAction = () => {
    if (!isInitialized) return;
    formbricks.track("upgrade-clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CF470C]">
                <span className="text-xl font-bold text-white">W</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">cPanel</h1>
            </div>
            <div className="flex items-center gap-2">
              {isInitialized && (
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-green-700">Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome to Your Dashboard
          </h2>
          <p className="mt-2 text-slate-600">
            Manage your hosting services and explore premium features
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Identify User Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Sign In
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Identify yourself and set user attributes for personalized
              experience
            </p>
            <button
              type="button"
              onClick={handleIdentifyUser}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Sign In as User
            </button>
          </div>

          {/* Dashboard Action Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#CF470C]/20">
              <svg
                className="h-6 w-6 text-[#CF470C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              View Analytics
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Check your hosting metrics and performance data
            </p>
            <button
              type="button"
              onClick={handleOpenDashboard}
              className="w-full rounded-lg bg-[#CF470C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#CF470C]/80"
            >
              Open Dashboard
            </button>
          </div>

          {/* Upgrade Action Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Upgrade Plan
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Unlock premium features and enhanced performance
            </p>
            <button
              type="button"
              onClick={handleUpgradeAction}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              View Upgrade Options
            </button>
          </div>
        </div>
      </main>

      {/* Dashboard Modal */}
      {isDashboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">
                  Analytics Dashboard
                </h3>
                <button
                  type="button"
                  onClick={handleCloseDashboard}
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Stat Cards */}
                <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <div className="text-sm font-medium text-blue-900">
                    Total Users
                  </div>
                  <div className="mt-2 text-3xl font-bold text-blue-600">
                    12,458
                  </div>
                  <div className="mt-1 text-xs text-blue-700">
                    ↑ 12% from last month
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                  <div className="text-sm font-medium text-purple-900">
                    Active Sessions
                  </div>
                  <div className="mt-2 text-3xl font-bold text-purple-600">
                    3,247
                  </div>
                  <div className="mt-1 text-xs text-purple-700">
                    ↑ 8% from last week
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
                  <div className="text-sm font-medium text-emerald-900">
                    Server Uptime
                  </div>
                  <div className="mt-2 text-3xl font-bold text-emerald-600">
                    99.9%
                  </div>
                  <div className="mt-1 text-xs text-emerald-700">
                    Last 30 days
                  </div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-8">
                <div className="flex h-48 items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-slate-600">
                      Performance metrics chart
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDashboard}
                  className="rounded-lg bg-[#CF470C] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#CF470C]/80"
                >
                  Close Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
