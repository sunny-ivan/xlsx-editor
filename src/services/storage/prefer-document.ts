import { storagePrefix } from "../../config";

interface IPreferDocument {
  driveId: string;
  itemId: string;
  worksheetId: string;
}

export function hasPreferDocument() {
  return (
    localStorage.getItem(storagePrefix + "driveid") !== null &&
    localStorage.getItem(storagePrefix + "itemid") !== null &&
    localStorage.getItem(storagePrefix + "worksheetid") !== null
  );
}

export function setPreferDocument(preferences: IPreferDocument) {
  localStorage.setItem(storagePrefix + "driveid", preferences.driveId);
  localStorage.setItem(storagePrefix + "itemid", preferences.itemId);
  localStorage.setItem(storagePrefix + "worksheetid", preferences.worksheetId);
}

export function getPreferDocument(): IPreferDocument {
  let driveId = localStorage.getItem(storagePrefix + "itemid");
  driveId = driveId === null ? "" : driveId;

  let itemId = localStorage.getItem(storagePrefix + "itemid");
  itemId = itemId === null ? "" : itemId;

  let worksheetId = localStorage.getItem(storagePrefix + "worksheetId");
  worksheetId = worksheetId === null ? "" : worksheetId;

  return { driveId, itemId, worksheetId: worksheetId };
}
