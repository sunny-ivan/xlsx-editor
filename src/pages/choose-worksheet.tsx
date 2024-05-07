import { useMsal } from "@azure/msal-react";
import { useEffect, useMemo, useState } from "react";
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
  TextField,
} from "@mui/material";
import { getWorkbooks } from "../services/workbooks/workbooks";
import { WorkbookWorksheet } from "@microsoft/microsoft-graph-types";
import { Person } from "@microsoft/mgt-react";
import { setPreferDocument } from "../services/storage/prefer-document";

function ChooseWorksheet() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();
  const { driveId, itemId } = useParams();

  const [data, setData] = useState([] as WorkbookWorksheet[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as Error | null);

  const [worksheetId, setWorksheetId] = useState("");
  const [containsHidden, setContainsHidden] = useState(false);

  const initWorkbooks = () => {
    try {
      setLoading(true);
      setError(null);

      if (!driveId) {
        throw new Error("driveId is empty");
      }
      if (!itemId) {
        throw new Error("itemId is empty");
      }

      getWorkbooks(driveId, itemId)
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
          if (firstVisibleWorksheet.id) {
            setWorksheetId(firstVisibleWorksheet.id);
          }
          setLoading(false);
        })
        .catch((error) => {
          setError(error);
          setLoading(false);
        });
    } catch (error: any) {
      setError(error);
      setLoading(false);
    }
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

  const isWorksheetVisible = (worksheet: WorkbookWorksheet) => {
    return (
      containsHidden ||
      String(worksheet.visibility).toLowerCase() === "visible" ||
      (!worksheet.visibility && worksheet.id)
    );
  };

  const handleSelect = (event: SelectChangeEvent) => {
    setWorksheetId(event.target.value as string);
  };

  const handleCheckContainsHidden = (_event: any, checked: boolean) => {
    setContainsHidden(checked);
  };

  const firstVisibleWorksheet = useMemo(() => {
    for (const worksheet of data) {
      if (isWorksheetVisible(worksheet)) {
        return worksheet;
      }
    }
    return { id: "" } as WorkbookWorksheet;
  }, [data]);

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
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <ErrorPage error={error} />
      ) : (
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
                  label="Contains hidden worksheets"
                  checked={containsHidden}
                  onChange={handleCheckContainsHidden}
                />
              </FormControl>
              <FormControl fullWidth style={{ marginTop: 20 }}>
                <InputLabel id="workbook-worksheet-select-label">
                  Worksheet
                </InputLabel>
                <Select
                  labelId="workbook-worksheet-select-label"
                  id="workbook-worksheet-select"
                  value={worksheetId}
                  defaultValue={firstVisibleWorksheet.id}
                  label="Worksheet"
                  onChange={handleSelect}
                  required
                >
                  <MenuItem value="" disabled>
                    <em>Please select</em>
                  </MenuItem>
                  {data.map((worksheet) =>
                    isWorksheetVisible(worksheet) ? (
                      <MenuItem key={worksheet.id} value={worksheet.id}>
                        {worksheet.name}
                      </MenuItem>
                    ) : null
                  )}
                </Select>
              </FormControl>
            </FormGroup>
            <Button
              disabled={!worksheetId}
              variant="contained"
              style={{ marginTop: 20 }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </form>
        </Box>
      )}
    </Container>
  );
}

export default ChooseWorksheet;
