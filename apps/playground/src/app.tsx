import formbricks, { type TFormbricksEventName } from "@formbricks/js";
import { useEffect, useState } from "react";
import fbsetup from "./assets/fb-setup.png";

const userId = "THIS-IS-A-VERY-LONG-USER-ID-FOR-TESTING";
const userAttributes = {
  "Attribute 1": "one",
  "Attribute 2": "two",
  "Attribute 3": "three",
};

const FORMBRICKS_EVENT_NAMES: TFormbricksEventName[] = [
  "formbricks_setup_successful",
  "formbricks_action_tracked",
  "formbricks_survey_shown",
  "formbricks_response_submitted",
  "formbricks_survey_closed",
];

interface TCapturedEvent {
  at: string;
  event: string;
  payload: string;
}

const inputClassName =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white";

export default function App(): React.JSX.Element {
  const [darkMode, setDarkMode] = useState(false);
  const [events, setEvents] = useState<TCapturedEvent[]>([]);
  const [userIdInput, setUserIdInput] = useState(userId);
  const [attributeKey, setAttributeKey] = useState("plan");
  const [attributeValue, setAttributeValue] = useState("pro");
  const [actionKey, setActionKey] = useState("code");

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const url = new URL(globalThis.location.href);
    if (!url.searchParams.has("formbricksDebug")) {
      url.searchParams.set("formbricksDebug", "true");
      globalThis.history.replaceState({}, "", url.href);
    }

    const missingEnvVars = [
      !import.meta.env.VITE_FORMBRICKS_WORKSPACE_ID
        ? "VITE_FORMBRICKS_WORKSPACE_ID"
        : null,
      !import.meta.env.VITE_FORMBRICKS_API_HOST
        ? "VITE_FORMBRICKS_API_HOST"
        : null,
    ].filter((value): value is string => value !== null);

    // Subscribed BEFORE setup() — the only order in which
    // formbricks_setup_successful can be observed.
    const unsubscribers = FORMBRICKS_EVENT_NAMES.map((name) =>
      formbricks.on(name, (payload) => {
        setEvents((previous) => [
          {
            at: new Date().toLocaleTimeString(),
            event: name,
            payload: JSON.stringify(payload),
          },
          ...previous,
        ]);
      }),
    );

    if (missingEnvVars.length === 0) {
      formbricks.setup({
        workspaceId: import.meta.env.VITE_FORMBRICKS_WORKSPACE_ID,
        appUrl: import.meta.env.VITE_FORMBRICKS_API_HOST,
      });
    } else {
      console.warn(
        `Formbricks not initialized because the following environment variable(s) are missing: ${missingEnvVars.join(", ")}`,
      );
    }

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white px-12 py-6 dark:bg-slate-800">
      <div className="flex flex-col justify-between md:flex-row">
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Formbricks In-product Survey Demo App
            </h1>
            <p className="text-slate-700 dark:text-slate-300">
              This app helps you test your app surveys. You can create and test
              user actions, create and update user attributes, etc.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="mt-2 rounded-lg bg-slate-200 px-6 py-1 dark:bg-slate-700 dark:text-slate-100"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "Toggle Light Mode" : "Toggle Dark Mode"}
        </button>
      </div>
      <div className="my-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              1. Setup .env
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Copy the environment ID of your Formbricks app to the env variable
              in /apps/playground/.env
            </p>
            <img src={fbsetup} alt="fb setup" className="mt-4 rounded-xs" />
            <div className="mt-4 flex-col items-start text-sm text-slate-700 sm:flex sm:items-center sm:text-base dark:text-slate-300">
              <p className="mb-1 sm:mr-2 sm:mb-0">
                You&apos;re connected with workspace:
              </p>
              <div className="flex items-center">
                <strong className="w-32 truncate sm:w-auto">
                  {import.meta.env.VITE_FORMBRICKS_WORKSPACE_ID ??
                    "Not configured"}
                </strong>
                <span className="relative ml-2 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              2. Widget Logs
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Look at the logs to understand how the widget works.{" "}
              <strong className="dark:text-white">
                Open your browser console
              </strong>{" "}
              to see the logs.
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              3. Events (formbricks.on)
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Everything below arrived through{" "}
              <code className="dark:text-white">formbricks.on()</code>,
              subscribed before <code className="dark:text-white">setup()</code>{" "}
              — including{" "}
              <code className="dark:text-white">
                formbricks_setup_successful
              </code>
              .
            </p>
            {events.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No events yet.
              </p>
            ) : (
              <ul className="mt-3 max-h-64 space-y-1 overflow-auto font-mono text-xs text-slate-800 dark:text-slate-200">
                {events.map((event) => (
                  <li key={`${event.at}-${event.event}-${event.payload}`}>
                    <span className="text-slate-500 dark:text-slate-400">
                      {event.at}
                    </span>{" "}
                    <strong>{event.event}</strong> {event.payload}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="md:grid md:grid-cols-3">
          <div className="col-span-3 self-start rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900">
            <h3 className="text-lg font-semibold dark:text-white">
              Set a user ID / pull data from Formbricks app
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              On formbricks.setUserId() the user state will{" "}
              <strong>be fetched from Formbricks</strong> and the local state
              gets <strong>updated with the user state</strong>.
            </p>
            <div className="my-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                User ID
                <input
                  className={inputClassName}
                  value={userIdInput}
                  onChange={(event) => setUserIdInput(event.target.value)}
                />
              </label>
              <button
                className="rounded-lg bg-slate-500 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                type="button"
                onClick={() => formbricks.setUserId(userIdInput)}
              >
                Set user ID
              </button>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              If you made a change in Formbricks app and it does not seem to
              work, hit &apos;Reset&apos; and try again.
            </p>
          </div>
          <div className="col-span-3 mt-4 self-start rounded-lg border border-slate-300 bg-slate-100 p-6 dark:border-slate-600 dark:bg-slate-900">
            <h3 className="text-lg font-semibold dark:text-white">
              Custom attribute and code action
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              Calls <code>formbricks.setAttribute(key, value)</code> and{" "}
              <code>formbricks.track(action)</code> with any values. The E2E
              golden journey uses these.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                Attribute key
                <input
                  className={inputClassName}
                  value={attributeKey}
                  onChange={(event) => setAttributeKey(event.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                Attribute value
                <input
                  className={inputClassName}
                  value={attributeValue}
                  onChange={(event) => setAttributeValue(event.target.value)}
                />
              </label>
              <button
                className="rounded-lg bg-slate-500 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                type="button"
                onClick={() =>
                  formbricks.setAttribute(attributeKey, attributeValue)
                }
              >
                Set attribute
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                Action
                <input
                  className={inputClassName}
                  value={actionKey}
                  onChange={(event) => setActionKey(event.target.value)}
                />
              </label>
              <button
                className="rounded-lg bg-slate-500 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                type="button"
                onClick={() => formbricks.track(actionKey)}
              >
                Track action
              </button>
            </div>
          </div>
          <div className="p-6">
            <div>
              <button
                type="button"
                className="mb-4 rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                No-Code Action
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                This button sends a{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/website-app-surveys/actions#setting-up-no-code-actions"
                  rel="noopener noreferrer"
                  className="underline dark:text-blue-500"
                  target="_blank"
                >
                  No Code Action
                </a>{" "}
                as long as you created it beforehand in the Formbricks App.{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/website-app-surveys/actions#setting-up-no-code-actions"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline dark:text-blue-500"
                >
                  Here are instructions on how to do it.
                </a>
              </p>
            </div>
          </div>
          <div className="p-6">
            <div>
              <button
                type="button"
                onClick={() => formbricks.setAttribute("Plan", "Free")}
                className="mb-4 rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Set Plan to &apos;Free&apos;
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                This button sets the{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/website-app-surveys/user-identification#setting-custom-user-attributes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline dark:text-blue-500"
                >
                  attribute
                </a>{" "}
                &apos;Plan&apos; to &apos;Free&apos;. If the attribute does not
                exist, it creates it.
              </p>
            </div>
          </div>
          <div className="p-6">
            <div>
              <button
                type="button"
                onClick={() => formbricks.setAttribute("Plan", "Paid")}
                className="mb-4 rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Set Plan to &apos;Paid&apos;
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                This button sets the{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/website-app-surveys/user-identification#setting-custom-user-attributes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline dark:text-blue-500"
                >
                  attribute
                </a>{" "}
                &apos;Plan&apos; to &apos;Paid&apos;. If the attribute does not
                exist, it creates it.
              </p>
            </div>
          </div>
          <div className="p-6">
            <div>
              <button
                type="button"
                onClick={() => formbricks.setEmail("test@web.com")}
                className="mb-4 rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Set Email
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                This button sets the{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/website-app-surveys/user-identification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline dark:text-blue-500"
                >
                  user email
                </a>{" "}
                &apos;test@web.com&apos;
              </p>
            </div>
          </div>
          <div className="p-6">
            <div>
              <button
                type="button"
                onClick={() => formbricks.setAttributes(userAttributes)}
                className="mb-4 rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Set Multiple Attributes
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                This button sets the{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/website-app-surveys/user-identification#setting-custom-user-attributes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline dark:text-blue-500"
                >
                  user attributes
                </a>{" "}
                to &apos;one&apos;, &apos;two&apos;, &apos;three&apos;.
              </p>
            </div>
          </div>
          <div className="p-6">
            <div>
              <button
                type="button"
                onClick={() => formbricks.setLanguage("de")}
                className="mb-4 rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Set Language to &apos;de&apos;
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                This button sets the{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/general-features/multi-language-surveys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline dark:text-blue-500"
                >
                  language
                </a>{" "}
                to &apos;de&apos;.
              </p>
            </div>
          </div>
          <div className="p-6">
            <div>
              <button
                type="button"
                className="mb-4 rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                onClick={() => formbricks.track("code")}
              >
                Code Action
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                This button sends a{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/website-app-surveys/actions#setting-up-code-actions"
                  rel="noopener noreferrer"
                  className="underline dark:text-blue-500"
                  target="_blank"
                >
                  Code Action
                </a>{" "}
                as long as you created it beforehand in the Formbricks App.{" "}
                <a
                  href="https://formbricks.com/docs/xm-and-surveys/surveys/website-app-surveys/actions#setting-up-code-actions"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline dark:text-blue-500"
                >
                  Here are instructions on how to do it.
                </a>
              </p>
            </div>
          </div>
          <div className="p-6">
            <div>
              <button
                type="button"
                className="mb-4 rounded-lg bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                onClick={() => formbricks.logout()}
              >
                Logout
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                This button logs out the user and syncs the local state with
                Formbricks. (Only works if a userId is set)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
