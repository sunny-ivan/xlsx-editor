import excelClient from "./client";
import { Json } from "graph-excel-client/dist/models";
import { WorkbookTableItemRequestBuilder } from "graph-excel-client/dist/drives/item/items/item/workbook/worksheets/item/tables/item";
import { WorkbookWorksheetItemRequestBuilder } from "graph-excel-client/dist/drives/item/items/item/workbook/worksheets/item";
import { Client } from "@microsoft/microsoft-graph-client";
import { authProvider } from "../auth/authProvider";

const graphClient = Client.init({
  authProvider,
});

export class TableRange {
  private driveId: string;
  private itemId: string;
  private worksheetId: string;
  private tableId: string;
  private worksheetApi: WorkbookWorksheetItemRequestBuilder;
  private tableApi: WorkbookTableItemRequestBuilder;
  public bodyRangeStartCellColAddr: string;
  public bodyRangeStartCellRowAddr: number;
  public bodyRangeEndCellColAddr: string;
  public bodyRangeEndCellRowAddr: number;

  constructor(
    driveId: string,
    itemId: string,
    worksheetId: string,
    tableId: string
  ) {
    this.driveId = driveId;
    this.itemId = itemId;
    this.worksheetId = worksheetId;
    this.tableId = tableId;

    this.bodyRangeStartCellColAddr = "";
    // It can't be 0 in Excel, so feel free to pass on an impossible situation by using 0.
    this.bodyRangeStartCellRowAddr = 0;
    this.bodyRangeEndCellColAddr = "";
    this.bodyRangeEndCellRowAddr = 0;

    this.worksheetApi = excelClient.drives
      .byDriveId(this.driveId)
      .items.byDriveItemId(this.itemId)
      .workbook.worksheets.byWorkbookWorksheetId(this.worksheetId);

    this.tableApi = excelClient.drives
      .byDriveId(this.driveId)
      .items.byDriveItemId(this.itemId)
      .workbook.worksheets.byWorkbookWorksheetId(this.worksheetId)
      .tables.byWorkbookTableId(this.tableId);
  }

  public initialize(): Promise<void> {
    return this.tableApi.dataBodyRange.get().then((data) => {
      if (data === undefined) {
        throw new Error(
          "WorkbookTableItem.DataBodyRange Response is undefined"
        );
      }

      const { address } = data;
      if (address === undefined) {
        throw new Error(
          "WorkbookTableItem.DataBodyRangeResponse.address is undefined"
        );
      }

      const parts = address.split("!");
      const cellRange = parts.length > 1 ? parts[1] : parts[0];

      const [begin, end] = cellRange.split(":");
      const [startCol, startRow] = begin.match(/[A-Z]+|\d+/g) as string[];
      const [endCol, endRow] = end.match(/[A-Z]+|\d+/g) as string[];

      this.bodyRangeStartCellColAddr = startCol;
      this.bodyRangeEndCellColAddr = endCol;

      this.bodyRangeStartCellRowAddr = parseInt(startRow);
      this.bodyRangeEndCellRowAddr = parseInt(endRow);

      if (isNaN(this.bodyRangeStartCellRowAddr)) {
        throw new Error(`Failed to parse ${startRow} to Integer`);
      }

      if (isNaN(this.bodyRangeEndCellRowAddr)) {
        throw new Error(`Failed to parse ${endRow} to Integer`);
      }

      console.log(this);
    });
  }

  /**
   * Output a range to single row
   * @param rowIndex index of row
   * @returns 'A2:F2'
   */
  private rangeSingleRow(rowIndex: number) {
    return (
      this.bodyRangeStartCellColAddr +
      (this.bodyRangeStartCellRowAddr + rowIndex) +
      ":" +
      this.bodyRangeEndCellColAddr +
      (this.bodyRangeStartCellRowAddr + rowIndex)
    );
  }

  /**
   * Update a single row
   * @param rowIndex index of row
   * @param diff any[][], use null to avoid update a value. Example: [['Bill', 'Male', null, 1]]
   * @returns
   */
  public async updateRow(rowIndex: number, diff: Json) {
    const range = this.rangeSingleRow(rowIndex);
    // Microsoft didn't declare it in openapi document
    // return this.worksheetApi.rangeWithAddress(range).patch(...);
    return graphClient
      .api(
        "/drives/" +
          this.driveId +
          "/items/" +
          this.itemId +
          "/workbook/worksheets/" +
          this.worksheetId +
          "/range(address='" +
          range +
          "')"
      )
      .update({ values: diff });
  }

  /**
   * Delete a single row
   * @param rowIndex index of row
   * @returns
   */
  public async deleteRow(rowIndex: number) {
    const range = this.rangeSingleRow(rowIndex);
    // Microsoft didn't declare it in openapi document
    // return this.worksheetApi.rangeWithAddress(range).delete.post({...});
    return graphClient
      .api(
        "/drives/" +
          this.driveId +
          "/items/" +
          this.itemId +
          "/workbook/worksheets/" +
          this.worksheetId +
          "/range(address='" +
          range +
          "')/delete"
      )
      .post({ shift: "Up" });
  }
}
