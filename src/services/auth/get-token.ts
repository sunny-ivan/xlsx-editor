import { AccessToken, TokenCredential } from "@azure/identity";
import { SilentRequest } from "@azure/msal-browser";
import pca from "./configure";
import { getAccount } from "./utils";

export async function getToken(scopes: string[]): Promise<AccessToken> {
  let hasAuthenticated = false;

  try {
    if (await pca.getActiveAccount()) {
      hasAuthenticated = true;
    }
    await pca.handleRedirectPromise();
    hasAuthenticated = true;
  } catch (e) {
    console.error("BrowserCredential prepare() failed", e);
  }

  if (!hasAuthenticated) {
    throw new Error("Authentication required");
  }
  const account = await getAccount();

  if (!account) {
    throw new Error("No account information");
  }

  const parameters: SilentRequest = { account, scopes };

  const result = await pca.acquireTokenSilent(parameters);
  const expiresOn: Date | null = result.expiresOn;
  return {
    token: result.accessToken,
    expiresOnTimestamp: expiresOn ? expiresOn.getTime() : 0,
  };
}

export const tokenCredential: TokenCredential = { getToken };
