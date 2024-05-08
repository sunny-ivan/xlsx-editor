import { Client } from "@microsoft/microsoft-graph-client";
import { authProvider } from "../auth/authProvider";
import { appdataDirectory } from "../../config";
import { DriveItem } from "@microsoft/microsoft-graph-types";

const graphClient = Client.init({
  authProvider,
});

export async function createAppFolder() {
  try {
    const data = await graphClient
      .api(`/me/drive/root:/${appdataDirectory}:`)
      .get();
    return data;
  } catch (error) {
    return await graphClient
      .api("/me/drive/root/children")
      .version("v1.0")
      .post({
        name: appdataDirectory,
        folder: {},
      });
  }
}

export function getItemId(path: string) {
  return graphClient.api(`/me/drive/root:/${path}`).select(["id"]).get();
}

export function createFile(folderId: string, name: string): Promise<DriveItem> {
  return graphClient.api(`/me/drive/items/${folderId}/children`).post({
    name: name,
    file: {},
  });
}
