import { storagePrefix } from "../../config";

interface IPreferDocument {
  driveId: string;
  itemId: string;
  worksheetId: string;
}

export function hasPreferDocument() {
  return (
    localStorage.getItem(storagePrefix + "driveId") !== null &&
    localStorage.getItem(storagePrefix + "itemid") !== null &&
    localStorage.getItem(storagePrefix + "workbookid") !== null
  );
}

export function setPreferDocument(preferences: IPreferDocument) {
  localStorage.setItem(storagePrefix + "driveId", preferences.driveId);
  localStorage.setItem(storagePrefix + "itemid", preferences.itemId);
  localStorage.setItem(storagePrefix + "workbookid", preferences.worksheetId);
}

export function getPreferDocument(): IPreferDocument {
  let driveId = localStorage.getItem(storagePrefix + "itemid");
  driveId = driveId === null ? "" : driveId;

  let itemId = localStorage.getItem(storagePrefix + "itemid");
  itemId = itemId === null ? "" : itemId;

  let workbookId = localStorage.getItem(storagePrefix + "workbookid");
  workbookId = workbookId === null ? "" : workbookId;

  return { driveId, itemId, worksheetId: workbookId };
}
