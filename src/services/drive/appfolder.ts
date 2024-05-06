import { Client } from "@microsoft/microsoft-graph-client";
import { authProvider } from "../auth/authProvider";
import { appdataDirectory } from "../../config";

const client = Client.init({
  authProvider,
});

export async function createAppFolder() {
  try {
    const data = await client.api(`/me/drive/root:/${appdataDirectory}:`).get();
    return data;
  } catch (error) {
    return await client.api("/me/drive/root/children").version("v1.0").post({
      name: appdataDirectory,
      folder: {},
    });
  }
}

export function getItemId(path: string) {
  return client.api(`/me/drive/root:/${path}`).select(["id"]).get();
}
