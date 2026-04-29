declare module "smartcar" {
  export interface SmartcarToken {
    accessToken: string;
    refreshToken: string;
    expiration?: Date | string | number;
    refreshExpiration?: Date | string | number;
  }

  export interface SmartcarAuthClient {
    getAuthUrl(scope: string[], options?: { forcePrompt?: boolean }): string;
    exchangeCode(code: string): Promise<SmartcarToken>;
  }

  const smartcar: {
    AuthClient: new (opts: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      mode?: "test" | "live" | "simulated";
    }) => SmartcarAuthClient;
  };

  export default smartcar;
}
