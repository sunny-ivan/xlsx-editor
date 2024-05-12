import { ProviderState, Providers, SimpleProvider } from "@microsoft/mgt-react";
import pca from "./configure";
import { getAccount, login, logout } from "./utils";

async function getAccessToken(scopes: string[]): Promise<string> {
  if (!!scopes.some((element) => element.startsWith("Files."))) {
    scopes = scopes.filter((element) => !element.startsWith("Files."));
    scopes.push("Files.ReadWrite");
  }

  if (!pca.getAllAccounts) {
    throw new Error("No such method getAllAccounts");
  }
  const account = await getAccount();
  const result = await pca.acquireTokenSilent({
    account: account,
    scopes,
  });
  return result.accessToken;
}

const provider = new SimpleProvider(
  getAccessToken,
  () => {
    Providers.globalProvider.setState(ProviderState.SignedIn);
    return login();
  },
  () => {
    Providers.globalProvider.setState(ProviderState.SignedOut);
    return logout();
  }
);

export default provider;
