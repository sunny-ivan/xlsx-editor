import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorPage from "./error-page";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  TextField,
} from "@mui/material";
import { getWorksheets } from "../services/workbooks/worksheets";
import { WorkbookWorksheet } from "@microsoft/microsoft-graph-types";
import { Person } from "@microsoft/mgt-react";
import { setPreferDocument } from "../services/storage/prefer-document";
import CreateWorksheetDialog from "../components/create-worksheet-dialog";
import ErrorDialog from "../components/error-dialog";

function ChooseWorksheet() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();
  const { driveId, itemId } = useParams();

  const [data, setData] = useState([] as WorkbookWorksheet[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as Error | null);

  const [worksheetId, setWorksheetId] = useState("");
  const [allowHidden, setAllowHidden] = useState(false);

  const [openCreateWorksheet, setOpenCreateWorksheet] = useState(false);

  const isWorksheetVisible = (worksheet: WorkbookWorksheet) => {
    return (
      allowHidden ||
      String(worksheet.visibility).toLowerCase() === "visible" ||
      (!worksheet.visibility && worksheet.id)
    );
  };

  const getFirstVisibleWorksheet = (
    data: WorkbookWorksheet[],
    preferWorksheetName?: string
  ) => {
    if (preferWorksheetName) {
      for (const worksheet of data) {
        if (
          isWorksheetVisible(worksheet) &&
          worksheet.name === preferWorksheetName
        ) {
          return worksheet;
        }
      }
    }

    for (const worksheet of data) {
      if (isWorksheetVisible(worksheet)) {
        return worksheet;
      }
    }

    return { id: "" } as WorkbookWorksheet;
  };

  const initWorkbooks = (preferWorksheetName?: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);
      setWorksheetId("");

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

      getWorksheets(driveId, itemId)
        .then((response) => {
          if (!response) {
            throw new Error("Response is undefined");
          }
          if (!response.value) {
            throw new Error(
              "Response without value in WorkbookWorksheetCollectionResponse"
            );
          }
          setData(response.value);
          const first = getFirstVisibleWorksheet(
            response.value,
            preferWorksheetName
          ).id;
          if (first) {
            setWorksheetId(first);
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
        return initWorkbooks();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // To run the effect only once, set the array empty

  const handleSelect = (event: SelectChangeEvent) => {
    setWorksheetId(event.target.value as string);
  };

  const handleCheckAllowHidden = (_event: any, checked: boolean) => {
    setAllowHidden(checked);
  };

  const handleSubmit = () => {
    if (!driveId) {
      throw new Error("driveId is empty");
    }
    if (!itemId) {
      throw new Error("itemId is empty");
    }

    setPreferDocument({
      driveId,
      itemId,
      worksheetId,
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
              <FormControlLabel
                control={<Checkbox />}
                label="Allow access to hidden worksheets"
                checked={allowHidden}
                onChange={handleCheckAllowHidden}
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
                  labelId="workbook-worksheet-loading-label"
                  id="workbook-worksheet-loading"
                  label="Loading"
                  value=""
                  required
                />
              </FormControl>
            ) : error ? (
              <ErrorPage error={error} />
            ) : (
              <FormControl fullWidth style={{ marginTop: 20 }}>
                <InputLabel id="workbook-worksheet-select-label">
                  Worksheet
                </InputLabel>
                <Select
                  labelId="workbook-worksheet-select-label"
                  id="workbook-worksheet-select"
                  value={worksheetId}
                  label="Worksheet"
                  onChange={handleSelect}
                  required
                >
                  {data.map((worksheet) =>
                    isWorksheetVisible(worksheet) ? (
                      <MenuItem key={worksheet.id} value={worksheet.id}>
                        {worksheet.name}
                      </MenuItem>
                    ) : null
                  )}
                </Select>
              </FormControl>
            )}
          </FormGroup>
          <Stack spacing={2} direction="row" style={{ marginTop: 20 }}>
            <Button
              disabled={!worksheetId}
              variant="contained"
              onClick={handleSubmit}
            >
              Submit
            </Button>
            <Button
              disabled={loading}
              variant="outlined"
              onClick={() => {
                setOpenCreateWorksheet(true);
              }}
            >
              Create
            </Button>
            <Button
              disabled={loading}
              variant="outlined"
              onClick={() => {
                initWorkbooks();
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                navigate("/choose");
              }}
            >
              Back
            </Button>
          </Stack>
        </form>
      </Box>
      {driveId === undefined || itemId === undefined ? (
        <ErrorDialog
          open={openCreateWorksheet}
          onClose={() => {
            setOpenCreateWorksheet(false);
          }}
          error={
            new Error(
              "Type 'undefined' is not assignable to type 'string': driveId and (or) itemId"
            )
          }
        />
      ) : (
        <CreateWorksheetDialog
          open={openCreateWorksheet}
          onClose={(created, name) => {
            setOpenCreateWorksheet(false);
            if (created) {
              initWorkbooks(name);
            }
          }}
          driveid={driveId}
          itemid={itemId}
        />
      )}
    </Container>
  );
}

export default ChooseWorksheet;
