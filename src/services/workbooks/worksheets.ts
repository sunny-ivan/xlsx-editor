import excelClient from "./client";

export async function getWorksheets(driveId: string, itemId: string) {
  return await excelClient.drives
    .byDriveId(driveId)
    .items.byDriveItemId(itemId)
    .workbook.worksheets.get();
}
