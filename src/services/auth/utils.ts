import { AccountInfo, EndSessionRequest } from "@azure/msal-browser";
import { scopes } from "../../config";
import pca from "./configure";

export async function login() {
  const loginRequest = {
    scopes,
    redirectStartPage: window.location.href,
  };

  return await pca.loginRedirect(loginRequest);
}

export async function logout() {
  const account = await getAccount();
  const logOutRequest: EndSessionRequest = {
    account: account,
    postLogoutRedirectUri: window.location.href,
    logoutHint: account.username,
  };

  pca.logoutRedirect(logOutRequest);
}

export async function getAccount(): Promise<AccountInfo> {
  // need to call getAccount here?
  const currentAccounts = pca.getAllAccounts();
  if (currentAccounts === null) {
    login();
  }

  if (currentAccounts.length > 1) {
    // Add choose account code here
    console.log("Multiple accounts detected, need to add choose account code.");
    return currentAccounts[0];
  } else if (currentAccounts.length === 1) {
    return currentAccounts[0];
  }

  login();
  return getAccount();
}
