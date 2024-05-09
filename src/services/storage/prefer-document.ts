import { storagePrefix } from "../../config";

interface IPreferDocument {
  driveId: string;
  itemId: string;
  worksheetId: string;
  tableId: string;
}

export function hasPreferDocument() {
  return (
    localStorage.getItem(storagePrefix + "driveid") !== null &&
    localStorage.getItem(storagePrefix + "itemid") !== null &&
    localStorage.getItem(storagePrefix + "worksheetid") !== null &&
    localStorage.getItem(storagePrefix + "tableid") !== null
  );
}

export function setPreferDocument(preferences: IPreferDocument) {
  localStorage.setItem(storagePrefix + "driveid", preferences.driveId);
  localStorage.setItem(storagePrefix + "itemid", preferences.itemId);
  localStorage.setItem(storagePrefix + "worksheetid", preferences.worksheetId);
  localStorage.setItem(storagePrefix + "tableid", preferences.tableId);
}

export function getPreferDocument(): IPreferDocument {
  let driveId = localStorage.getItem(storagePrefix + "itemid");
  driveId = driveId === null ? "" : driveId;

  let itemId = localStorage.getItem(storagePrefix + "itemid");
  itemId = itemId === null ? "" : itemId;

  let worksheetId = localStorage.getItem(storagePrefix + "worksheetid");
  worksheetId = worksheetId === null ? "" : worksheetId;

  let tableId = localStorage.getItem(storagePrefix + "tableid");
  tableId = tableId === null ? "" : tableId;

  return { driveId, itemId, worksheetId, tableId };
}
