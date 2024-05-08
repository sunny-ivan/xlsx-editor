import { AzureIdentityAuthenticationProvider } from "@microsoft/kiota-authentication-azure";
import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";
import { tokenCredential } from "../auth/get-token";
import { scopes } from "../../config";
import { createGraphDriverClient } from "graph-driver-client";

// @microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser
const allowedHosts = new Set<string>(["graph.microsoft.com"]);

const adapter = new FetchRequestAdapter(
  new AzureIdentityAuthenticationProvider(
    tokenCredential,
    scopes,
    undefined,
    allowedHosts
  )
);
const driveClient = createGraphDriverClient(adapter);
export default driveClient;
