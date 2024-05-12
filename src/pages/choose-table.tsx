import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage from "./error-page";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  deleteTable,
  getTablesbyWorksheetId,
} from "../services/workbooks/tables";
import { WorkbookTable } from "@microsoft/microsoft-graph-types";
import { Person } from "@microsoft/mgt-react";
import { setPreferDocument } from "../services/storage/prefer-document";
import ErrorDialog from "../components/dialogs/error-dialog";
import CreateTableDialog from "../components/dialogs/create-table-dialog";
import { useConfirm } from "material-ui-confirm";
import { errorMessage } from "../utils/error";

function ChooseTable() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();
  const { driveId, itemId, worksheetId } = useParams();
  const confirm = useConfirm();

  const [data, setData] = useState<WorkbookTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [tableId, setTableId] = useState("");

  const [openCreateTable, setOpenCreateTable] = useState(false);

  const getFirstTable = (data: WorkbookTable[], preferTableName?: string) => {
    if (preferTableName) {
      for (const table of data) {
        if (table.name === preferTableName) {
          return table;
        }
      }
    }

    for (const table of data) {
      return table;
    }

    return { id: "" } as WorkbookTable;
  };

  const initTables = (preferTableName?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);
      setTableId("");

      if (!driveId) {
        setError(new Error("driveId is empty"));
        setLoading(false);
        resolve();
        return;
      }
      if (!itemId) {
        setError(new Error("itemId is empty"));
        setLoading(false);
        resolve();
        return;
      }
      if (!worksheetId) {
        setError(new Error("worksheetId is empty"));
        setLoading(false);
        resolve();
        return;
      }

      getTablesbyWorksheetId(driveId, itemId, worksheetId)
        .then((response) => {
          if (!response) {
            throw new Error("Response is undefined");
          }
          if (!response.value) {
            throw new Error(
              "Response without value in WorkbookTableCollectionResponse"
            );
          }
          setData(response.value);
          const first = getFirstTable(response.value, preferTableName).id;
          if (first) {
            setTableId(first);
          }
          setLoading(false);
          resolve();
        })
        .catch((error) => {
          setError(error);
          setLoading(false);
          resolve();
        });
    });
  };

  useEffect(() => {
    pca.initialize().then(() => {
      if (pca.getAllAccounts().length <= 0) {
        navigate("/login");
      } else {
        return initTables();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // To run the effect only once, set the array empty

  const handleDelete = () => {
    if (!tableId) {
      console.error("tableId to be deleted is empty");
      return;
    }

    let tableName = "";
    for (const table of data) {
      if (table.id === tableId) {
        tableName = table.name ? table.name : "";
        break;
      }
    }

    confirm({
      confirmationButtonProps: {
        color: "error",
      },
      confirmationText: "Confirm",
      confirmationKeyword: tableName,
      confirmationKeywordTextFieldProps: {
        variant: "outlined",
        label: "Input box",
        autoFocus: true,
      },
      content: (
        <Box style={{ margin: "10px 0px" }}>
          <Typography style={{ marginBottom: 10 }}>
            This will permanently delete the content. Deleted content cannot be
            recovered.
          </Typography>
          <Typography fontWeight="bold">
            To confirm, type "{tableName}" in the box below
          </Typography>
        </Box>
      ),
    })
      .then(() => {
        setLoading(true);
        setError(null);
        setTableId("");
        deleteTable(
          driveId as string, // they're not undefined
          itemId as string, // they're not undefined
          worksheetId as string, // they're not undefined
          tableId
        )
          .then(() => {
            initTables();
          })
          .catch((error) => {
            setLoading(false);
            setError(
              new Error(
                "An exception occurred while deleting the table (Your table might not have been deleted): " +
                  errorMessage(error) +
                  "You should refresh at this time."
              )
            );
          });
      })
      .catch(() => {
        // user canceled
      });
  };

  const handleSelect = (event: SelectChangeEvent) => {
    setTableId(event.target.value as string);
  };

  const handleSubmit = () => {
    if (!driveId) {
      throw new Error("driveId is empty");
    }
    if (!itemId) {
      throw new Error("itemId is empty");
    }
    if (!worksheetId) {
      throw new Error("worksheetId is empty");
    }
    if (!tableId) {
      throw new Error("tableId is empty");
    }

    setPreferDocument({
      driveId,
      itemId,
      worksheetId,
      tableId,
    });

    navigate("/view");
  };

  return (
    <Container maxWidth="sm">
      <Person personQuery="me" view="twolines" personCardInteraction="click" />
      <br />
      <Box>
        <form>
          <FormGroup>
            <FormControl fullWidth>
              <TextField
                label="Drive ID"
                defaultValue={driveId}
                InputProps={{
                  readOnly: true,
                }}
              />
            </FormControl>
            <FormControl fullWidth style={{ marginTop: 20 }}>
              <TextField
                label="Item ID"
                defaultValue={itemId}
                InputProps={{
                  readOnly: true,
                }}
              />
            </FormControl>
            <FormControl fullWidth style={{ marginTop: 20 }}>
              <TextField
                label="Worksheet ID"
                defaultValue={worksheetId}
                InputProps={{
                  readOnly: true,
                }}
              />
            </FormControl>
            {loading ? (
              <FormControl fullWidth style={{ marginTop: 20 }}>
                <InputLabel id="workbook-loading-select-label">
                  <Skeleton
                    variant="text"
                    sx={{ fontSize: "1em", width: "10em" }}
                  />
                </InputLabel>
                <Select
                  disabled
                  labelId="workbook-table-loading-label"
                  id="workbook-table-loading"
                  label="Loading"
                  value=""
                  required
                />
              </FormControl>
            ) : error ? (
              <ErrorPage error={error} />
            ) : (
              <FormControl fullWidth style={{ marginTop: 20 }}>
                <InputLabel id="workbook-table-select-label">Table</InputLabel>
                <Select
                  labelId="workbook-table-select-label"
                  id="workbook-table-select"
                  value={tableId}
                  label="Table"
                  onChange={handleSelect}
                  required
                >
                  {data.map((table) => (
                    <MenuItem key={table.id} value={table.id}>
                      {table.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </FormGroup>
          <Stack spacing={2} direction="row" style={{ marginTop: 20 }}>
            <Button
              disabled={!tableId}
              variant="contained"
              onClick={handleSubmit}
            >
              Submit
            </Button>
            <Button
              disabled={loading || !tableId}
              variant="outlined"
              onClick={handleDelete}
              color="error"
            >
              Delete
            </Button>
            <Button
              disabled={loading}
              variant="outlined"
              onClick={() => {
                setOpenCreateTable(true);
              }}
            >
              Create
            </Button>
            <Button
              disabled={loading}
              variant="outlined"
              onClick={() => {
                initTables();
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                navigate("/choose/" + driveId + "/" + itemId);
              }}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                navigate("/logout");
              }}
            >
              Logout
            </Button>
          </Stack>
        </form>
      </Box>
      {driveId === undefined ||
      itemId === undefined ||
      worksheetId === undefined ? (
        <ErrorDialog
          open={openCreateTable}
          onClose={() => {
            setOpenCreateTable(false);
          }}
          error={
            new Error(
              "Type 'undefined' is not assignable to type 'string': driveId, itemId and (or) worksheedId"
            )
          }
        />
      ) : (
        <CreateTableDialog
          open={openCreateTable}
          onClose={(created, name) => {
            setOpenCreateTable(false);
            if (created) {
              initTables(name);
            }
          }}
          driveid={driveId}
          itemid={itemId}
          worksheetid={worksheetId}
        />
      )}
    </Container>
  );
}

export default ChooseTable;
