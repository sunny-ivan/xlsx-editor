import { AddPostRequestBody } from "graph-excel-client/dist/drives/item/items/item/workbook/worksheets/add";
import excelClient from "./client";

export async function getWorksheets(driveId: string, itemId: string) {
  return await excelClient.drives
    .byDriveId(driveId)
    .items.byDriveItemId(itemId)
    .workbook.worksheets.get();
}

export async function createWorksheet(
  driveId: string,
  itemId: string,
  body: AddPostRequestBody
) {
  return await excelClient.drives
    .byDriveId(driveId)
    .items.byDriveItemId(itemId)
    .workbook.worksheets.add.post(body);
}
