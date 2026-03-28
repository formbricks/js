# Formbricks Playground

A demo application for testing and developing Formbricks in-product surveys. This Vite + React app provides an interactive environment to test survey triggers, user actions, and attributes.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file with your Formbricks credentials:

```env
VITE_FORMBRICKS_ENVIRONMENT_ID=your-environment-id
VITE_FORMBRICKS_API_HOST=https://app.formbricks.com
```

You can find your environment ID in the Formbricks app under Settings → Setup.

3. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Features

- **User Identification**: Set user IDs and pull user data from Formbricks
- **User Attributes**: Test setting single and multiple custom attributes
- **Actions**: Test both no-code and code actions
- **Email Setting**: Test user email functionality
- **Language Support**: Test multi-language survey delivery
- **Debug Mode**: Automatically enabled for detailed widget logs (check browser console)
- **Dark Mode**: Toggle between light and dark themes

## Usage

The app provides interactive buttons to test various Formbricks SDK methods:

- `formbricks.setUserId()` - Set user ID and sync state
- `formbricks.setAttribute()` - Set individual attributes
- `formbricks.setAttributes()` - Set multiple attributes at once
- `formbricks.setEmail()` - Set user email
- `formbricks.setLanguage()` - Set user language
- `formbricks.track()` - Trigger code actions
- `formbricks.logout()` - Clear user session

Create surveys in your Formbricks app and use this playground to test triggers and targeting.
