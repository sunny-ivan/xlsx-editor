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
  GridCellParams,
  MuiEvent,
  GridCellModes,
} from "@mui/x-data-grid";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useConfirm } from "material-ui-confirm";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../provider/SnackbarProvider";
import { errorMessage } from "../../utils/error";
import { RowFields, Table } from "../../services/workbooks/table";

let table: Table;

interface EditToolbarProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  pullRows: (force?: boolean) => void;
  saveWarning: (content?: ReactNode | null) => Promise<void>;
}

/**
 * Edit Toolbar
 */
const EditToolbar = (props: EditToolbarProps) => {
  const { setLoading, pullRows, saveWarning } = props;

  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const handleBack = () => {
    saveWarning(
      "Any unsaved changes will be lost if you return to the file selection page"
    ).then(() => {
      navigate("/choose");
    });
  };

  const handleRefresh = () => {
    saveWarning().then(() => pullRows(true));
  };

  const handleInsertEmptyRow = () => {
    setLoading(true);

    saveWarning()
      .then(() => table.insertEmpty())
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
          onClick={handleRefresh}
          variant="outlined"
        >
          Refresh
        </Button>
        <Button
          color="primary"
          onClick={() => {
            navigate("/logout");
          }}
        >
          Logout
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
      getActions: (params) => {
        const { id } = params;
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
  const reservedFields = ["actions", "dataGridNo", "index", "isNew"];
  let reserveIdField = true;

  // Pull data from Microsoft
  const pullRows = (pullAnyway?: boolean): Promise<void> => {
    if (loading && !pullAnyway) {
      return Promise.resolve();
    }
    setLoading(true);
    setRowsError(null);
    return table
      .rows()
      .then((rows) => {
        // Rows
        const newRows: GridRowModel[] = rows.map((row, index) => {
          reserveIdField = row.id === undefined; // reserve `id` field if the original table doesn't have a id column
          const newRow: RowFields = {
            // MUI X: The data grid component requires all rows to have a unique `id` property.
            id: !reserveIdField ? row.id : index,
            // For row editing (update, delete)
            index: index,
            // Users don't like index
            dataGridNo: index + 1,
            ...row,
          };
          newRow.id = row.id || index;
          return newRow;
        });
        setRows(newRows);

        // Switch all rows to view mode
        for (const key in rowModesModel) {
          setRowModesModel({
            ...rowModesModel,
            [key]: {
              mode: GridRowModes.View,
              ignoreModifications: true,
            },
          });
        }

        setRowsError(null);
      })
      .catch((error) => {
        console.error(error);
        setRowsError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    table = tableParent;
    pullRows(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableParent]);

  const isEditing = useMemo(() => {
    for (const key in rowModesModel) {
      if (rowModesModel[key].mode === GridRowModes.Edit) {
        return true;
      }
    }
    return false;
  }, [rowModesModel]);

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

  /**
   * Show a "unsaved changes will be lost" warning, will setLoading(false) if user cancelled
   * @param content
   * @returns
   */
  const saveWarning = (content?: ReactNode | null) =>
    new Promise<void>((resolve, reject) => {
      if (isEditing) {
        return confirm({
          title:
            "Any unsaved changes will be lost if you continue the operation.",
          content,
        })
          .then(() => resolve())
          .catch((error) => {
            if (error === undefined) {
              snackbar.openSnackbar({
                message: errorMessage("User cancelled"),
                severity: "info",
                open: true,
              });
              setLoading(false);
              return;
            }
            reject(error);
          });
      } else {
        resolve();
      }
    });

  const saveEditedRow = (id: number | string, row?: RowFields) => {
    handlerStart();
    let rowIndex = id;

    new Promise<void>((resolve) => {
      if (row === undefined) {
        // Give MUI X and React some time to update row
        setTimeout(() => {
          resolve();
        }, 500);
      } else {
        resolve();
      }
    })
      .then(() => {
        if (row === undefined) {
          for (const r of rows) {
            if (r.id === id) {
              // rowIndex = r.index;
              row = r;
              break;
            }
          }

          if (row === undefined) {
            throw new Error("The requested row doesn't exist on the table.");
          }
        }

        console.log("newRow=", row);

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
      })
      .then(() => {
        return table.getRow(rowIndex.toString());
      })
      .then((tableRow) => {
        if (row === undefined) {
          throw new Error("The requested row doesn't exist on the table.");
        }
        console.log(row);
        return tableRow.update(row);
      })
      .then(() => {
        return pullRows();
      })
      .catch((error) => {
        if (error === undefined) {
          // user cancelled
          handlerSuccess();
          return;
        }
        handlerCatch(error);
      });
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    console.log(params);
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const openEditLimitSnackbar = () => {
    snackbar.openSnackbar({
      message: "You can only edit one row at a time",
      open: true,
      severity: "error",
      snackbarProps: { autoHideDuration: 5000 },
    });
  };

  const handleCellDoubleClick = (params: GridCellParams, event: MuiEvent) => {
    if (params.cellMode === GridCellModes.View) {
      if (isEditing) {
        openEditLimitSnackbar();
        // Prevent entering edit mode
        event.defaultMuiPrevented = true;
      }
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    if (isEditing) {
      openEditLimitSnackbar();
      return;
    }
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick =
    (id: GridRowId, ...params: any) =>
    () => {
      console.log("params", params);
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

  const handleDeleteClick = (id: GridRowId) => () => {
    handlerStart();

    let row: RowFields | undefined = undefined;
    let rowIndex = -1;

    try {
      if (row === undefined) {
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
            <Typography>
              Are you sure to delete the row?
              {isEditing ? " All unsaved edits will be lost." : ""}
            </Typography>
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

  const processRowUpdate = (newRow: GridRowModel, _oldRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    let id = -1;
    const newRows = rows.map((row, index) =>
      newRow.id === index
        ? ((id = index), { ...updatedRow, id: index })
        : { ...row, id: index }
    );
    setRows(newRows);
    id >= 0 && saveEditedRow(id, newRow);
    console.log(id, newRow);
    return updatedRow;
  };

  const handleCellKeyDown: GridEventListener<"cellKeyDown"> = (
    params,
    event
  ) => {
    const { id } = params;
    if (event.key === "Enter") {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View },
      });
      event.preventDefault();
      return;
    }
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
        onCellKeyDown={handleCellKeyDown}
        onCellDoubleClick={handleCellDoubleClick}
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
            saveWarning,
          },
        }}
      />
    </Box>
  );
}
