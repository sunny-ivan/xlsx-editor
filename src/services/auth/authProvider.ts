import { AuthProvider } from "@microsoft/microsoft-graph-client";
import pca from "./configure";
import { getAccount } from "./utils";
import { scopes } from "../../config";

export const authProvider: AuthProvider = async (done) => {
  try {
    const account = await getAccount();
    const response = await pca.acquireTokenSilent({
      account,
      scopes,
    });
    done(null, response.accessToken);
  } catch (error) {
    console.error("Error acquiring token:", error);
    done(error, null);
  }
};
