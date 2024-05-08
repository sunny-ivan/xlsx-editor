import { AddPostRequestBody } from "graph-excel-client/dist/drives/item/items/item/workbook/worksheets/item/tables/add";
import excelClient from "./client";

export async function getTablesbyWorksheetId(
  driveId: string,
  itemId: string,
  worksheetId: string
) {
  return await excelClient.drives
    .byDriveId(driveId)
    .items.byDriveItemId(itemId)
    .workbook.worksheets.byWorkbookWorksheetId(worksheetId)
    .tables.get();
}

export async function createTablebyWorksheetId(
  driveId: string,
  itemId: string,
  worksheetId: string,
  body: AddPostRequestBody
) {
  return await excelClient.drives
    .byDriveId(driveId)
    .items.byDriveItemId(itemId)
    .workbook.worksheets.byWorkbookWorksheetId(worksheetId)
    .tables.add.post(body);
}
