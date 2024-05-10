import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlots,
  GridLocaleText,
  GRID_DEFAULT_LOCALE_TEXT,
} from "@mui/x-data-grid";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useConfirm } from "material-ui-confirm";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../provider/SnackbarProvider";
import { errorMessage } from "../../utils/error";
import { Table } from "../../services/workbooks/table";

let table: Table;

interface EditToolbarProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  pullRows: () => void;
}

/**
 * Edit Toolbar
 */
const EditToolbar = (props: EditToolbarProps) => {
  const { setLoading, pullRows } = props;

  const navigate = useNavigate();
  const confirm = useConfirm();
  const snackbar = useSnackbar();

  const handleBack = () => {
    confirm({
      title:
        "Any unsaved changes will be lost if you return to the file selection page",
    })
      .then(() => {
        navigate("/choose");
      })
      .catch(() => {
        // user canceled
      });
  };

  const handleInsertEmptyRow = () => {
    setLoading(true);

    table
      .insertEmpty()
      .then(() => {
        pullRows();
      })
      .catch((error) => {
        console.error(error);
        snackbar.openSnackbar({
          message: errorMessage(error),
          severity: "error",
          open: true,
        });
        setLoading(false);
      });
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        p: 1,
      }}
    >
      <Stack spacing={1} direction="row">
        <Button
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          disabled={props.loading}
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleInsertEmptyRow}
          variant="outlined"
        >
          Add record
        </Button>
        <Button
          disabled={props.loading}
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={() => {
            pullRows();
          }}
          variant="outlined"
        >
          Refresh
        </Button>
      </Stack>
    </Box>
  );
};

interface IProp {
  table: Table;
  getColumns: () => GridColDef[];
}

export default function FullFeaturedCrudGrid(props: IProp) {
  const { table: tableParent, getColumns } = props;
  const snackbar = useSnackbar();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [rowsError, setRowsError] = useState<Error | null>(null);
  const disableDataGrid = useMemo(() => rowsError, [rowsError]);
  const [customLocaleText, setCustomLocalText] = useState<GridLocaleText>(
    GRID_DEFAULT_LOCALE_TEXT
  );
  useEffect(() => {
    setCustomLocalText({
      ...GRID_DEFAULT_LOCALE_TEXT,
      // Show error message by modify "No rows" text
      noRowsLabel:
        rowsError !== null
          ? errorMessage(rowsError)
          : GRID_DEFAULT_LOCALE_TEXT.noRowsLabel,
    });
  }, [rowsError]);

  const [rows, setRows] = useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  // Using state to pass columns will cause the action column to not update properly based on the editMode of each row.
  let columns = [
    {
      field: "dataGridNo",
      headerName: "No.",
      type: "number",
      editable: false,
    },
    ...getColumns(),
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ] as GridColDef[];

  // must provide if table editing is enabled
  const reservedFields = ["actions", "dataGridNo", "index", "dataGridNo"];
  let reserveIdField = true;

  // Pull data from Microsoft
  const pullRows = () => {
    setLoading(true);
    setRowsError(null);
    table
      .rows()
      .then((rows) => {
        // Rows
        const newRows: GridRowModel[] = [];
        rows.forEach((row, index) => {
          reserveIdField = row.id === undefined; // reserve `id` field if the original table doesn't have a id column
          const newRow: { [key: string]: any } = {
            // MUI X: The data grid component requires all rows to have a unique `id` property.
            id: !reserveIdField ? row.id : index,
            // For row editing (update, delete)
            index: index,
            // Users don't like index
            dataGridNo: index + 1,
            ...row,
          };
          newRow.id = row.id || index;
          // push single row
          newRows.push(newRow);
        });
        setRows(newRows);

        setRowsError(null);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setRowsError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    table = tableParent;
    pullRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlerStart = () => {
    setLoading(true);
  };

  const handlerCatch = (
    error: Error,
    prefix: string = "",
    suffix: string = ""
  ) => {
    setLoading(false);
    snackbar.openSnackbar({
      message: prefix + errorMessage(error) + suffix,
      severity: "error",
      open: true,
    });
  };

  const handlerSuccess = () => {
    setLoading(false);
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    handlerStart();

    let row: { [key: string]: any } | undefined = undefined;
    let rowIndex = -1;

    try {
      for (const r of rows) {
        if (r.id === id) {
          rowIndex = r.index;
          row = { ...r };
          break;
        }
      }

      if (row === undefined) {
        throw new Error("The requested row doesn't exist on the table.");
      }

      reservedFields.forEach((invalidField) => {
        if (row === undefined) {
          return;
        }

        if (Object.prototype.hasOwnProperty.call(row, invalidField)) {
          delete row[invalidField];
        }
      });

      if (reserveIdField && Object.prototype.hasOwnProperty.call(row, "id")) {
        delete row.id;
      }

      table
        .getRow(rowIndex.toString())
        .then((row) => {
          return row.update(row);
        })
        .then(() => {
          setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
          });
        })
        .then(() => {
          pullRows();
        })
        .catch((error) => {
          if (error === undefined) {
            // user cancelled
            handlerSuccess();
            return;
          }
          handlerCatch(error);
        })
        .finally(() => {
          setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
          });
        });
    } catch (error: any) {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
      handlerCatch(error);
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    // TODO: delete row
    handlerStart();

    let row: { [key: string]: any } | undefined = undefined;
    let rowIndex = -1;

    try {
      for (const r of rows) {
        if (r.id === id) {
          rowIndex = r.index;
          row = { ...r };
          break;
        }
      }

      if (row === undefined) {
        throw new Error("The requested row doesn't exist on the table.");
      }

      reservedFields.forEach((invalidField) => {
        if (row === undefined) {
          return;
        }

        if (Object.prototype.hasOwnProperty.call(row, invalidField)) {
          delete row[invalidField];
        }
      });

      if (reserveIdField && Object.prototype.hasOwnProperty.call(row, "id")) {
        delete row.id;
      }

      confirm({
        title: "Delete a row",
        content: (
          <Box>
            <Typography>Are you sure to delete the row?</Typography>
          </Box>
        ),
      })
        .then(() => {
          return table.getRow(rowIndex.toString());
        })
        .then((row) => {
          return row.delete();
        })
        .then(() => {
          setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
          });
        })
        .then(() => {
          pullRows();
        })
        .catch((error) => {
          if (error === undefined) {
            // user cancelled
            handlerSuccess();
            return;
          }
          handlerCatch(error);
        });
    } catch (error: any) {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
      handlerCatch(error);
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <DataGrid
        loading={loading}
        sx={{
          // Apply style to NOT editable cell
          "& .MuiDataGrid-cell:not(.MuiDataGrid-cell--editable)": {
            color: "#9e9e9e",
          },
        }}
        rows={disableDataGrid ? [] : rows}
        columns={columns}
        localeText={customLocaleText}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar as GridSlots["toolbar"],
        }}
        slotProps={{
          toolbar: {
            loading,
            setLoading,
            pullRows,
          },
        }}
      />
    </Box>
  );
}