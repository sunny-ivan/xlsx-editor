import { PublicClientApplication, Configuration } from "@azure/msal-browser";
import { clientId, tenantId, redirectUri } from "../../config";

const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: "https://login.microsoftonline.com/" + tenantId,
    redirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

const pca = new PublicClientApplication(msalConfig);

export default pca;
