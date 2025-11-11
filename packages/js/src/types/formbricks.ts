export interface TFormbricks {
  /** @deprecated Use setup() instead. This method will be removed in a future version */
  init: (initConfig: {
    apiHost: string;
    environmentId: string;
    userId?: string;
    attributes?: Record<string, string>;
  }) => Promise<void>;

  setup: (setupConfig: {
    environmentId: string;
    appUrl: string;
  }) => Promise<void>;

  setEmail: (email: string) => Promise<void>;

  setAttribute: (key: string, value: string) => Promise<void>;

  setAttributes: (attributes: Record<string, string>) => Promise<void>;

  setLanguage: (language: string) => Promise<void>;

  setUserId: (userId: string) => Promise<void>;

  track: (
    code: string,
    properties?: {
      hiddenFields: Record<string | number, string | number | string[]>;
    }
  ) => Promise<void>;

  logout: () => Promise<void>;

  registerRouteChange: () => Promise<void>;
  setNonce: (nonce: string) => Promise<void>;
}
