export interface TFormbricks {
  /** @deprecated Use setup() instead. This method will be removed in a future version */
  init: (initConfig: {
    apiHost: string;
    environmentId: string;
    userId?: string;
    attributes?: Record<string, string>;
  }) => Promise<void>;

  /**
   * @description Initializes the Formbricks SDK.
   * @param setupConfig - The configuration for the Formbricks SDK.
   */
  setup: (setupConfig: {
    environmentId: string;
    appUrl: string;
  }) => Promise<void>;

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
   * @description Sets the user ID of the user.
   * @param userId - The user ID of the user.
   */
  setUserId: (userId: string) => Promise<void>;

  /**
   * Sets the CSP nonce for inline styles
   * @param nonce - The CSP nonce value (without 'nonce-' prefix), or undefined to clear
   */
  setNonce: (nonce: string | undefined) => void;

  /**
   * @description Tracks an event.
   * @param code - The code of the event.
   * @param properties - The properties of the event.
   */
  track: (
    code: string,
    properties?: {
      hiddenFields: Record<string | number, string | number | string[]>;
    }
  ) => Promise<void>;

  /**
   * @description Logs out the user
   */
  logout: () => Promise<void>;

  /**
   * @description Registers a route change.
   * @returns A promise that resolves when the route change is registered.
   */
  registerRouteChange: () => Promise<void>;
}
