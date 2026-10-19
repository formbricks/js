# Formbricks Browser JS Library

[![npm package](https://img.shields.io/npm/v/@formbricks/js?style=flat-square)](https://www.npmjs.com/package/@formbricks/js)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Please see [Formbricks Docs](https://formbricks.com/docs).
Specifically, [Quickstart/Implementation details](https://formbricks.com/docs/getting-started/quickstart-in-app-survey).

## What is Formbricks

Formbricks is your go-to solution for in-product micro-surveys that will supercharge your product experience! 🚀 For more information please check out [formbricks.com](https://formbricks.com).

## How to use this library

1. Install the Formbricks package inside your project using npm:

```bash
npm install @formbricks/js
```

1. Import Formbricks and initialize the widget in your main component (e.g., App.tsx or App.js):

```javascript
import formbricks from "@formbricks/js";

if (typeof window !== "undefined") {
  formbricks.setup({
    workspaceId: "your-workspace-id",
    appUrl: "https://app.formbricks.com",
  });
}
```

Replace your-workspace-id with your actual workspace ID. You can find your workspace ID in the **Setup Checklist** in the Formbricks settings. If you want to use the user identification feature, please check out [our docs for details](https://formbricks.com/docs/app-surveys/user-identification).

> `environmentId` is still accepted for backward compatibility but is deprecated and will be removed in a future version. Prefer `workspaceId`.

### Dark mode

Surveys render light by default. Pass `appearance` to `setup()`, or change it at any time with
`setAppearance()`: `"light"`, `"dark"`, or `"system"` to follow the visitor's browser setting. An open
survey switches in place. Requires Formbricks 6.1 or later.

```javascript
formbricks.setup({
  workspaceId: "your-workspace-id",
  appUrl: "https://app.formbricks.com",
  appearance: "system",
});

formbricks.setAppearance("dark");
```

For more detailed guides for different frameworks, check out our [Framework Guides](https://formbricks.com/docs/getting-started/framework-guides).
