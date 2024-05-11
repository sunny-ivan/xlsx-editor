import { AddPostRequestBody } from "graph-excel-client/dist/drives/item/items/item/workbook/tables/item/rows/add";
import excelClient from "./client";
import { Json } from "graph-excel-client/dist/models";
import { WorkbookTableRow } from "@microsoft/microsoft-graph-types";

interface TableColumn {
  id: string; // or column.index.toString()
  name: string;
}

type RowFields = { [key: string]: any };

class TableRow {
  private driveId: string;
  private itemId: string;
  private worksheetId: string;
  private tableId: string;
  public id: string | number;
  public cols: TableColumn[]; // {id: column.index.toString(), name: column.name}
  public content: RowFields; // {name: string, userid: number, email: string ...}

  constructor(
    driveId: string,
    itemId: string,
    worksheetId: string,
    tableId: string,
    id: string | number,
    cols: TableColumn[],
    content: RowFields
  ) {
    this.driveId = driveId;
    this.itemId = itemId;
    this.worksheetId = worksheetId;
    this.tableId = tableId;
    this.id = id;
    this.cols = cols;
    this.content = content;
  }

  private fieldsToRowValue(row: RowFields): Json {
    const rowValue0: any[] = [];
    function pushRowValue(needIndex: number) {
      while (rowValue0.length < needIndex + 1) {
        rowValue0.push("");
      }
    }

    for (const key in row) {
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        const value = row[key];
        let index = -1;

        for (const col of this.cols) {
          if (col.name === key) {
            index = parseInt(col.id);
            break;
          }
        }

        if (index < 0) {
          console.error(key, value, row, this.cols);
          throw new Error("Invalid column index (<0)");
        }

        pushRowValue(index);
        rowValue0[index] = value;
      }
    }

    return [rowValue0] as Json;
  }

  private requestBuilder() {
    return excelClient.drives
      .byDriveId(this.driveId)
      .items.byDriveItemId(this.itemId)
      .workbook.worksheets.byWorkbookWorksheetId(this.worksheetId)
      .tables.byWorkbookTableId(this.tableId)
      .rows.byWorkbookTableRowId(this.id.toString());
  }

  update(newContent: RowFields) {
    const patchRow: WorkbookTableRow = {
      index: typeof this.id === "number" ? this.id : undefined,
      values: [this.fieldsToRowValue(newContent)],
    };
    return this.requestBuilder().patch(patchRow);
  }

  delete() {
    return this.requestBuilder().delete();
  }
}

export class Table {
  private driveId: string;
  private itemId: string;
  private worksheetId: string;
  private tableId: string;
  public cols: TableColumn[]; // {id: column.index.toString(), name: column.name}

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
    this.cols = [];
  }

  /**
   * Get all columns from a table
   * @returns WorkbookTableColumnCollectionResponse
   */
  async columns(): Promise<TableColumn[]> {
    const response = await excelClient.drives
      .byDriveId(this.driveId)
      .items.byDriveItemId(this.itemId)
      .workbook.worksheets.byWorkbookWorksheetId(this.worksheetId)
      .tables.byWorkbookTableId(this.tableId)
      .columns.get();
    if (!response?.value) {
      throw new Error("Response or its value is undefined");
    }
    const value = response.value;
    const columns: TableColumn[] = [];
    value.forEach((col) => {
      const colId = col.index;
      if (colId !== undefined) {
        columns.push({
          id: colId.toString(),
          name: col.name || "",
        });
      }
    });
    this.cols = columns;
    return columns;
  }

  private rowValueToFields(rowValue: Json | undefined) {
    const row: RowFields = {};
    if (!rowValue) {
      return row;
    }
    (rowValue as [any[]])[0].forEach((field, index) => {
      let fieldId = "";
      for (const col of this.cols) {
        if (col.id === index.toString()) {
          fieldId = col.name;
          break;
        }
      }

      fieldId = fieldId || index.toString();
      // get a field in a row
      row[fieldId] = field;
    });
    return row;
  }

  /**
   * Get all rows from a table
   * @returns WorkbookTableRowCollectionResponse
   */
  async rows(): Promise<RowFields[]> {
    if (!this.cols.length) {
      await this.columns();
    }

    const response = await excelClient.drives
      .byDriveId(this.driveId)
      .items.byDriveItemId(this.itemId)
      .workbook.worksheets.byWorkbookWorksheetId(this.worksheetId)
      .tables.byWorkbookTableId(this.tableId)
      .rows.get();

    if (!response || !response.value) {
      throw new Error("Response or its value is undefined");
    }

    const respValue = response.value;
    const rows: RowFields[] = [];
    respValue.forEach((WorkbookTableRow) => {
      // get a single row
      let rowId: string | number | undefined = WorkbookTableRow.id;
      if (rowId === undefined) {
        rowId = WorkbookTableRow.index;
      }
      if (rowId === undefined) {
        return; // without further action
      }

      const rowValue = WorkbookTableRow.values;
      const row = this.rowValueToFields(rowValue);

      // push a single row
      rows.push(row);
    });

    return rows;
  }

  /**
   *  Get a row
   * @param id row.index.toString()
   * @returns WorkbookTableRow
   */
  async getRow(id: string): Promise<TableRow> {
    if (!this.cols.length) {
      await this.columns();
    }

    // Microsoft's API Endpoint is not available: The API you are trying to use could not be found. It may be available in a newer version of Excel. Please refer to the documentation: "https://docs.microsoft.com/office/dev/add-ins/reference/requirement-sets/excel-api-requirement-sets". ApiNotFound
    // so we have to fetch all the rows

    const rows = await this.rows();
    const index = parseInt(id);
    if (rows.length < index + 1) {
      throw new Error("Array out of bounds");
    }
    const rowFields = rows[index];
    const rowId = index;

    return new TableRow(
      this.driveId,
      this.itemId,
      this.worksheetId,
      this.tableId,
      rowId,
      this.cols,
      rowFields
    );
  }

  private insert(index?: number, values?: any[]) {
    const body: AddPostRequestBody = {};

    if (index !== undefined) {
      body.index = index;
    }
    if (values !== undefined) {
      body.values = [values] as Json; // A two-dimensional array
    }

    return excelClient.drives
      .byDriveId(this.driveId)
      .items.byDriveItemId(this.itemId)
      .workbook.worksheets.byWorkbookWorksheetId(this.worksheetId)
      .tables.byWorkbookTableId(this.tableId)
      .rows.add.post(body);
  }

  /**
   * Insert a empty row
   * @returns
   */
  insertEmpty() {
    return this.insert();
  }
}
