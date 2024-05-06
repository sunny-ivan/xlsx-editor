import { storagePrefix } from "../../config";

interface IPreferDocument {
  driverId: string;
  itemId: string;
  workbookId: string;
}

export function hasPreferDocument() {
  return (
    localStorage.getItem(storagePrefix + "driverid") !== null &&
    localStorage.getItem(storagePrefix + "itemid") !== null &&
    localStorage.getItem(storagePrefix + "workbookid") !== null
  );
}

export function setPreferDocument(preferences: IPreferDocument) {
  localStorage.setItem(storagePrefix + "driverid", preferences.driverId);
  localStorage.setItem(storagePrefix + "itemid", preferences.itemId);
  localStorage.setItem(storagePrefix + "workbookid", preferences.workbookId);
}

export function getPreferDocument(): IPreferDocument {
  let driverId = localStorage.getItem(storagePrefix + "itemid");
  driverId = driverId === null ? "" : driverId;

  let itemId = localStorage.getItem(storagePrefix + "itemid");
  itemId = itemId === null ? "" : itemId;

  let workbookId = localStorage.getItem(storagePrefix + "workbookid");
  workbookId = workbookId === null ? "" : workbookId;

  return { driverId, itemId, workbookId };
}
