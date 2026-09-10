/**
 * What each Formbricks event carries. Kept in sync with js-core's `TFormbricksEventPayloads`
 * (packages/js-core/src/lib/common/events.ts in the formbricks monorepo) — the wrapper has no
 * dependency on js-core, so the contract is declared on both sides.
 */
export interface TFormbricksEventPayloads {
  formbricks_setup_successful: { workspaceId: string };
  formbricks_action_tracked: { action: string };
  formbricks_survey_shown: { surveyId: string };
  formbricks_response_submitted: {
    surveyId: string;
    responseId?: string;
    finished: boolean;
  };
  formbricks_survey_closed: { surveyId: string };
}

export type TFormbricksEventName = keyof TFormbricksEventPayloads;

export interface TFormbricks {
  /**
   * @description Initializes the Formbricks SDK.
   * @param setupConfig - The configuration for the Formbricks SDK.
   */
  setup: (setupConfig: TSetupConfig) => Promise<void>;

  /**
   * @description Sets the email of the user.
   * @param email - The email of the user.
   */
  setEmail: (email: string) => Promise<void>;

  /**
   * @description Sets an attribute of the user.
   * @param key - The key of the attribute.
   * @param value - The value of the attribute.
   */
  setAttribute: (key: string, value: string) => Promise<void>;

  /**
   * @description Sets multiple attributes of the user.
   * @param attributes - The attributes to set.
   */
  setAttributes: (attributes: Record<string, string>) => Promise<void>;

  /**
   * @description Sets the language of the user.
   * @param language - The language of the user.
   */
  setLanguage: (language: string) => Promise<void>;

  /**
   * @description Sets the user ID.
   * @param userId - The user ID to set.
   */
  setUserId: (userId: string) => Promise<void>;

  /**
   * @description Sets the CSP nonce for inline styles
   * @param nonce - The CSP nonce value (without 'nonce-' prefix), or undefined to clear
   */
  setNonce: (nonce: string | undefined) => Promise<void>;

  /**
   * @description Tracks an event.
   * @param code - The code of the event.
   * @param properties - The properties of the event.
   */
  track: (
    code: string,
    properties?: {
      hiddenFields: Record<string | number, string | number | string[]>;
    },
  ) => Promise<void>;

  /**
   * @description Logs out the user
   */
  logout: () => Promise<void>;

  /**
   * @description Registers a route change.
   */
  registerRouteChange: () => Promise<void>;

  /**
   * @description Subscribes to a Formbricks event. Safe to call before setup(); subscriptions made
   * early are forwarded to the SDK before setup runs, so `formbricks_setup_successful` is caught.
   * @param event - Full event name, e.g. "formbricks_survey_shown".
   * @param handler - Called with that event's payload.
   * @returns A function that removes this subscription.
   */
  on: <E extends TFormbricksEventName>(
    event: E,
    handler: (payload: TFormbricksEventPayloads[E]) => void,
  ) => () => void;

  /**
   * @description Removes a subscription registered with on().
   * @param event - The event name the handler was registered for.
   * @param handler - The same function reference that was passed to on().
   */
  off: <E extends TFormbricksEventName>(
    event: E,
    handler: (payload: TFormbricksEventPayloads[E]) => void,
  ) => void;
}

export type TSetupConfig =
  | {
      workspaceId: string;
      /**
       * @deprecated use workspaceId instead, environmentId will be removed in a future version
       */
      environmentId?: string;
      appUrl: string;
    }
  | {
      workspaceId?: string;
      /**
       * @deprecated use workspaceId instead, environmentId will be removed in a future version
       */
      environmentId: string;
      appUrl: string;
    };
