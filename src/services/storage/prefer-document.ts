import { storagePrefix } from "../../config";

interface IPreferDocument {
  ItemId: string;
  WorkbookId: string;
}

export function hasPreferDocument() {
  return (
    localStorage.getItem(storagePrefix + "itemid") !== null &&
    localStorage.getItem(storagePrefix + "workbookid") !== null
  );
}

export function setPreferDocument(preferences: IPreferDocument) {
  localStorage.setItem(storagePrefix + "itemid", preferences.ItemId);
  localStorage.setItem(storagePrefix + "workbookid", preferences.WorkbookId);
}

export function getPreferDocument(): IPreferDocument {
  let ItemId = localStorage.getItem(storagePrefix + "itemid");
  ItemId = ItemId === null ? "" : ItemId;
  let WorkbookId = localStorage.getItem(storagePrefix + "workbookid");
  WorkbookId = WorkbookId === null ? "" : WorkbookId;
  return { ItemId, WorkbookId };
}
